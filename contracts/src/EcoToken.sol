// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract EcoToken is ERC20, Ownable {

    constructor() ERC20("EcoToken", "ECO") Ownable(msg.sender) {}

    // mint only owner (EcoReward after ownership transfer or role setup)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // 🔥 FIX: allow user-approved burning
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    // optional direct burn (not used in redeem anymore)
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}