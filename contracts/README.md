# ♻️ EcoLoop

## Overview
EcoLoop is a blockchain-based recycling reward system deployed on Base Sepolia. It rewards verified recycling activities with ERC20 tokens and enables token redemption through a burn mechanism.

---

## Features
- ERC20 reward token (EcoToken)
- Reward distribution via smart contract (EcoReward)
- Backend-authorized minting
- Cooldown system to prevent spam/abuse
- Token redemption with burn mechanism
- Fully tested using Foundry

---

## Tech Stack
- Solidity ^0.8.20
- Foundry (Forge, Cast, Anvil)
- OpenZeppelin Contracts
- Base Sepolia Testnet

---

## Deployed Contracts (Base Sepolia)
- EcoToken: `0x1703f762AD337638124Dd953c630F7568dEa05da`
- EcoReward: `0xE678Ba2EE10Cd22b3927Cf6EaAcaa88632aD3145`

---

## Setup
---
git clone https://github.com/YihalemM/ecoloop.git
cd ecoloop
forge install
forge build
---
### Testing
forge test
forge test -vvv
### System Flow
- User performs recycling activity  
- Backend verifies the activity  
- EcoReward contract mints EcoTokens  
- User receives tokens  
- Tokens can be redeemed and burned  
### Security Notes
- Backend-only mint authorization  
- Cooldown protection against abuse  
- OpenZeppelin ERC20 implementation  
- Tested on Base Sepolia before deployment  

### License
MIT