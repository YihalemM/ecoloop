// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EcoToken.sol";
import "../src/EcoReward.sol";

contract Deploy is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(privateKey);

        // Deploy contracts
        EcoToken token = new EcoToken();
        EcoReward reward = new EcoReward(address(token));

        token.transferOwnership(address(reward));

        vm.stopBroadcast();
    }
}
