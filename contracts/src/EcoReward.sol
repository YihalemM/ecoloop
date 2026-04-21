// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EcoToken.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract EcoReward is Ownable {
    EcoToken public ecoToken;

    address public backend;

    uint256 public cooldown = 1 minutes;

    struct RecyclingRecord {
        address user;
        string wasteType;
        uint256 amount;
        uint256 timestamp;
    }

    RecyclingRecord[] public records;

    mapping(address => uint256) public lastRewardTime;

    // Optional: dynamic reward system
    mapping(string => uint256) public rewardRate;

    event RewardIssued(address indexed user, uint256 amount, string wasteType);

    event BackendUpdated(address backend);

    event RewardRateUpdated(string wasteType, uint256 rate);

    modifier onlyBackend() {
        require(msg.sender == backend, "Not authorized");
        _;
    }

    constructor(address _token) Ownable(msg.sender) {
        ecoToken = EcoToken(_token);
    }

    // 🔐 Set backend (Node.js server wallet)
    function setBackend(address _backend) external onlyOwner {
        backend = _backend;
        emit BackendUpdated(_backend);
    }

    // ⚙️ Set reward rate per waste type (admin control)
    function setRewardRate(
        string memory wasteType,
        uint256 rate
    ) external onlyOwner {
        rewardRate[wasteType] = rate;
        emit RewardRateUpdated(wasteType, rate);
    }

    // ♻️ MAIN FUNCTION (AI → Backend → Contract)
    function rewardUser(
        address user,
        string memory wasteType,
        uint256 quantity
    ) external onlyBackend {
        // 🛑 Anti-spam protection
        require(
            block.timestamp >= lastRewardTime[user] + cooldown,
            "Cooldown active"
        );

        lastRewardTime[user] = block.timestamp;

        // 💰 Calculate reward
        uint256 amount = rewardRate[wasteType] * quantity;

        require(amount > 0, "Invalid reward");

        // 💸 Mint tokens
        ecoToken.mint(user, amount);

        // 📊 Store record
        records.push(
            RecyclingRecord({
                user: user,
                wasteType: wasteType,
                amount: amount,
                timestamp: block.timestamp
            })
        );

        emit RewardIssued(user, amount, wasteType);
    }

    // 🔄 Redeem (burn tokens for future utilities)
    function redeem(uint256 amount) external {
        ecoToken.burn(amount);
    }

    // 📊 View total records
    function getTotalRecords() external view returns (uint256) {
        return records.length;
    }
}
