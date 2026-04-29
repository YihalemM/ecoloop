// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EcoToken.sol";
import "../src/EcoReward.sol";

contract Deploy is Script {
    function run() external {

        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(privateKey);

        // Deploy token
        EcoToken token = new EcoToken();

        // Deploy reward system
        EcoReward reward = new EcoReward(address(token));

        // Give reward contract control over token
        token.transferOwnership(address(reward));

        vm.stopBroadcast();

        console.log("EcoToken:", address(token));
        console.log("EcoReward:", address(reward));
    }
}