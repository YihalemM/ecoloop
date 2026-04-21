// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EcoToken.sol";
import "../src/EcoReward.sol";

contract EcoRewardTest is Test {

    EcoToken token;
    EcoReward reward;

    address owner = address(1);
    address backend = address(2);
    address user = address(3);

    function setUp() public {
        vm.startPrank(owner);

        token = new EcoToken();
        reward = new EcoReward(address(token));

        token.transferOwnership(address(reward));
        reward.setBackend(backend);
        reward.setRewardRate("plastic", 10);

        vm.stopPrank();
    }

    // ✅ Reward works
    function testRewardUser() public {
        vm.prank(backend);

        reward.rewardUser(user, "plastic", 2);

        uint256 balance = token.balanceOf(user);
        assertEq(balance, 20);
    }

    // ❌ Only backend
    function testOnlyBackendCanReward() public {
        vm.expectRevert("Not authorized");
        reward.rewardUser(user, "plastic", 1);
    }

    // ⏳ Cooldown
    function testCooldown() public {
        vm.startPrank(backend);

        reward.rewardUser(user, "plastic", 1);

        vm.expectRevert("Cooldown active");
        reward.rewardUser(user, "plastic", 1);

        vm.warp(block.timestamp + 2 minutes);

        reward.rewardUser(user, "plastic", 1);

        vm.stopPrank();
    }

    // 📊 Record storage
    function testRecordStored() public {
        vm.startPrank(backend);

        reward.rewardUser(user, "plastic", 3);

        vm.warp(block.timestamp + 2 minutes);

        uint256 total = reward.getTotalRecords();
        assertEq(total, 1);

        vm.stopPrank();
    }

    // ❌ Invalid reward (IMPORTANT FIX)
    function testInvalidReward() public {

        // ⏩ Move time forward BEFORE calling
        vm.warp(block.timestamp + 2 minutes);

        vm.prank(backend);

        vm.expectRevert("Invalid reward");
        reward.rewardUser(user, "metal", 1);
    }

    // 🔄 Redeem
    function testRedeem() public {
        vm.startPrank(backend);

        reward.rewardUser(user, "plastic", 2);

        vm.stopPrank();

        vm.prank(user);
        reward.redeem(20);

        uint256 balance = token.balanceOf(user);
        assertEq(balance, 0);
    }
}