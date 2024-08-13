// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract CashierWithdraw is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public authorizedSigner;
    mapping(bytes16 receiptId => bool paidOut) public paidOutWithdrawals;

    event WithdrawalPaidOut(address indexed walletAddress, bytes16 indexed receiptId, uint256 amount);

    constructor(address defaultAdmin, address signer) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        authorizedSigner = signer;
    }

    receive() external payable {}

    fallback() external payable {}
}
