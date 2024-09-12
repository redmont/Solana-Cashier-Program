// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

error InvalidSignature();
error WithdrawalTooEarly();
error WithdrawalTooLate();
error WithdrawalAlreadyPaidOut();
error InputParameterLengthMismatch();
error InvalidChainId();

contract CashierWithdraw is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using SafeERC20 for IERC20;

    address public authorizedSigner;
    address public payoutTreasury;
    address public payoutToken;
    mapping(bytes16 receiptId => bool paidOut) public paidOutWithdrawals;

    event WithdrawalPaidOut(address indexed walletAddress, bytes16 indexed receiptId, uint256 amount);

    constructor(address defaultAdmin, address signer, address _payoutTreasury, address _payoutToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        authorizedSigner = signer;
        payoutTreasury = _payoutTreasury;
        payoutToken = _payoutToken;
    }

    receive() external payable {}

    fallback() external payable {}

    function _verifySignature(bytes32 data, bytes memory signature, address account) internal pure returns (bool) {
        return data.toEthSignedMessageHash().recover(signature) == account;
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setAuthorizedSigner(address _authorizedSigner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedSigner = _authorizedSigner;
    }

    function setPayoutTreasury(address _payoutTreasury) public onlyRole(DEFAULT_ADMIN_ROLE) {
        payoutTreasury = _payoutTreasury;
    }

    function setPayoutToken(address _payoutToken) public onlyRole(DEFAULT_ADMIN_ROLE) {
        payoutToken = _payoutToken;
    }

    function withdrawWithReceipt(
        bytes16 receiptId,
        uint256 amount,
        uint256 validFrom,
        uint256 validTo,
        uint256 chainId,
        bytes memory signature
    ) public whenNotPaused nonReentrant {
        address walletAddress = msg.sender;

        bytes32 message = keccak256(abi.encodePacked(receiptId, walletAddress, amount, validFrom, validTo, chainId));

        if (!_verifySignature(message, signature, authorizedSigner)) {
            revert InvalidSignature();
        }

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (paidOutWithdrawals[receiptId]) {
            revert WithdrawalAlreadyPaidOut();
        }

        if (validFrom > block.timestamp) {
            revert WithdrawalTooEarly();
        }

        if (validTo < block.timestamp) {
            revert WithdrawalTooLate();
        }

        paidOutWithdrawals[receiptId] = true;

        IERC20(payoutToken).safeTransferFrom(payoutTreasury, walletAddress, amount);

        emit WithdrawalPaidOut(walletAddress, receiptId, amount);
    }

    function batchWithdrawWithReceipts(
        bytes16[] memory receiptIds,
        uint256[] memory amounts,
        uint256[] memory validFroms,
        uint256[] memory validTos,
        uint256[] memory chainIds,
        bytes[] memory signatures
    ) public {
        if (
            receiptIds.length != amounts.length ||
            receiptIds.length != validFroms.length ||
            receiptIds.length != validTos.length ||
            receiptIds.length != chainIds.length ||
            receiptIds.length != signatures.length
        ) {
            revert InputParameterLengthMismatch();
        }

        for (uint256 i = 0; i < receiptIds.length; i++) {
            withdrawWithReceipt(receiptIds[i], amounts[i], validFroms[i], validTos[i], chainIds[i], signatures[i]);
        }
    }

    function blocklistReceipt(bytes16 receiptId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        paidOutWithdrawals[receiptId] = true;
    }

    function batchBlocklistReceipt(bytes16[] memory receiptIds) public onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < receiptIds.length; i++) {
            paidOutWithdrawals[receiptIds[i]] = true;
        }
    }
}
