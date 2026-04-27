// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract EcoToken is ERC20, Ownable {
    constructor() ERC20("EcoLoop Token", "ECO") Ownable(msg.sender) {}

    // 🔑 Only EcoReward contract will control minting
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // 🔄 User burns own tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}
