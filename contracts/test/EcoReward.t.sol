// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EcoToken.sol";
import "../src/EcoReward.sol";

contract EcoRewardTest is Test {

    EcoToken token;
    EcoReward reward;

    address owner = address(this);
    address backend = address(0xBEEF);
    address user = address(0xABCD);
    address attacker = address(0x1234);

    uint256 constant START_TIME = 1000;

    function setUp() public {
        vm.warp(START_TIME);

        token = new EcoToken();
        reward = new EcoReward(address(token));

        // set backend
        reward.setBackend(backend);

         // ✅ IMPORTANT FIX: ensure ownership transfer is executed correctly
    vm.prank(address(this));
    token.transferOwnership(address(reward));
        // set reward rate
        reward.setRewardRate("plastic", 10);
    }

    // =========================
    // ✅ 1. Reward works correctly
    // =========================
    function testRewardUser() public {
        vm.warp(START_TIME + 2 minutes);

        vm.prank(backend);

        reward.rewardUser(user, "plastic", 2);

        assertEq(token.balanceOf(user), 20);
    }

    // =========================
    // ⛔ 2. Only backend can call
    // =========================
    function testOnlyBackendCanReward() public {
        vm.prank(attacker);

        vm.expectRevert("Not authorized");
        reward.rewardUser(user, "plastic", 1);
    }

    // =========================
    // ⏱ 3. Cooldown prevents spam
    // =========================
    function testCooldownPreventsSpam() public {
        vm.startPrank(backend);

        reward.rewardUser(user, "plastic", 1);

        vm.expectRevert("Cooldown active");
        reward.rewardUser(user, "plastic", 1);

        vm.stopPrank();
    }

    // =========================
    // ⏱ 4. Cooldown resets after time
    // =========================
    function testCooldownResets() public {
        vm.startPrank(backend);

        reward.rewardUser(user, "plastic", 1);

        // move time forward
        vm.warp(block.timestamp + 2 minutes);

        reward.rewardUser(user, "plastic", 1);

        vm.stopPrank();

        assertEq(token.balanceOf(user), 20);
    }

    // =========================
    // ❌ 5. Invalid reward (rate = 0)
    // =========================
    function testInvalidRewardReverts() public {
        vm.prank(backend);

        vm.expectRevert("Invalid reward");
        reward.rewardUser(user, "glass", 1);
    }

    // =========================
    // 📊 6. Records stored correctly
    // =========================
    function testRecordsStored() public {
        vm.warp(START_TIME + 2 minutes);

        vm.prank(backend);

        reward.rewardUser(user, "plastic", 2);

        assertEq(reward.getTotalRecords(), 1);
    }

    // =========================
    // 🔥 7. Redeem burns tokens
    // =========================
 function testRedeemBurnsTokens() public {

    vm.warp(1000 + 2 minutes);

    vm.startPrank(backend);
    reward.rewardUser(user, "plastic", 2);
    vm.stopPrank();

    uint256 balance = token.balanceOf(user);
    assertEq(balance, 20);

    // 🔥 FIX: give allowance to reward contract
    vm.prank(user);
    token.approve(address(reward), 10);

    vm.prank(user);
    reward.redeem(10);

    assertEq(token.balanceOf(user), 10);
}

    // =========================
    // 🔐 8. Only owner can set backend
    // =========================
    function testOnlyOwnerCanSetBackend() public {
        vm.prank(attacker);

        vm.expectRevert();
        reward.setBackend(attacker);
    }

    // =========================
    // 🔐 9. Only owner can set reward rate
    // =========================
    function testOnlyOwnerCanSetRewardRate() public {
        vm.prank(attacker);

        vm.expectRevert();
        reward.setRewardRate("plastic", 100);
    }
}