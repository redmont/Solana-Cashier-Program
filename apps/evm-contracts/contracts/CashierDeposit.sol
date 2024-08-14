// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

error ZeroDepositAmount();
error ERC20TransferFailed();
error TokenNotAllowed();
error TooLowAmount();

contract CashierDeposit is AccessControl {
    using SafeERC20 for IERC20;

    event DepositReceived(bytes32 indexed userId, address indexed token, uint256 amount);

    address public treasuryAddress;
    mapping(address token => bool allowed) public allowedTokens;
    mapping(address token => uint8 decimals) public tokenDecimals;

    constructor(address _defaultAdmin, address _treasuryAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        treasuryAddress = _treasuryAddress;
    }

    function setTreasury(address _treasuryAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        treasuryAddress = _treasuryAddress;
    }

    function allowToken(address tokenAddress, uint8 decimals) public onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[tokenAddress] = true;
        tokenDecimals[tokenAddress] = decimals;
    }

    function disallowToken(address tokenAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[tokenAddress] = false;
        delete tokenDecimals[tokenAddress];
    }

    function deposit(bytes32 userId, address tokenAddress, uint256 amount) public {
        if (amount == 0) {
            revert ZeroDepositAmount();
        }
        if (!allowedTokens[tokenAddress]) {
            revert TokenNotAllowed();
        }

        uint8 decimals = tokenDecimals[tokenAddress];
        // Minimum purchase amount is 99 cents
        uint256 minAmount = 99 * 10 ** (decimals - 2);
        if (amount < minAmount) {
            revert TooLowAmount();
        }

        emit DepositReceived(userId, tokenAddress, amount);

        IERC20 token = IERC20(tokenAddress);
        token.safeTransferFrom(msg.sender, treasuryAddress, amount);
    }
}
