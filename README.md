# FlowZero - Galactic Kitties Omnichain NFT Bridge

**Built for ETH Global Buenos Aires 2025** 🚀

**Built by:** [Libruary](https://github.com/LibruaryNFT) (Solo Hacker)

## Why I Built This

I'm a builder on Flow and was curious if I could actually bridge NFTs from Base to Flow EVM. I may want to bridge some stuff over in the future, so I wanted to learn how it works. I plan to use what I learned here for future projects.

Also, I heard that Filecoin Cloud literally just came out, so I wanted to test it out and see how it works with decentralized storage for NFTs.

## What It Does

An omnichain NFT bridge using LayerZero V2 that lets you bridge ERC721 NFTs from Base Sepolia to Flow EVM testnet. NFT images are stored on Filecoin Onchain Cloud using the Synapse SDK.

**What I Built:**
- ✅ Deployed GalacticKitties NFT on Base Sepolia
- ✅ Uploaded NFT images to Filecoin Cloud
- ✅ Set up LayerZero ONFT infrastructure (adapter on Base, wrapped ONFT on Flow)
- ✅ Successfully bridged NFTs from Base to Flow EVM

## Quick Start

### Setup

```bash
npm install --legacy-peer-deps
```

Create `.env`:
```env
BASE_SEPOLIA_PRIVATE_KEY=0xyour_key
FLOW_TESTNET_PRIVATE_KEY=0xyour_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
FLOW_EVM_RPC_URL=https://testnet.evm.nodes.onflow.org
```

### Deploy & Bridge

1. **Upload images to Filecoin:**
   ```bash
   node uploadImages.js
   ```

2. **Deploy adapter on Base:**
   ```bash
   forge script script/DeployBaseAdapter.s.sol --rpc-url https://sepolia.base.org --broadcast
   ```

3. **Deploy ONFT on Flow:**
   ```bash
   forge script script/DeployFlowONFT.s.sol --rpc-url https://testnet.evm.nodes.onflow.org --broadcast
   ```

4. **Configure peers:**
   ```bash
   forge script script/SetPeerOnBase.s.sol --rpc-url https://sepolia.base.org --broadcast
   forge script script/SetPeerOnFlow.s.sol --rpc-url https://testnet.evm.nodes.onflow.org --broadcast
   ```

5. **Set gas options:**
   ```bash
   forge script script/SetEnforcedOptions.s.sol --rpc-url https://sepolia.base.org --broadcast
   ```

6. **Bridge an NFT:**
   ```bash
   forge script script/BridgeNFT.s.sol --rpc-url https://sepolia.base.org --broadcast
   ```

## Deployed Contracts

**Base Sepolia:**
- GalacticKitties: [`0x23F1a69E8100D758bb1E88F783e565739f66F6E5`](https://sepolia.basescan.org/address/0x23F1a69E8100D758bb1E88F783e565739f66F6E5)
- Adapter: [`0x953015B459e7862DE2d2CF3624c2DadfFf6310c2`](https://sepolia.basescan.org/address/0x953015B459e7862DE2d2CF3624c2DadfFf6310c2)

**Flow EVM Testnet:**
- Wrapped ONFT: [`0xEff1A41FC690152a9C2ce26aF24aF0dbB321397B`](https://evm-testnet.flowscan.io/token/0xEff1A41FC690152a9C2ce26aF24aF0dbB321397B)

## Proof of Concept

**Bridge Transaction:** [0xbbd9254b21f67e1ccd0d30e7872efca7a3bd62baf7be1e25a8171e0f6b2bf919](https://sepolia.basescan.org/tx/0xbbd9254b21f67e1ccd0d30e7872efca7a3bd62baf7be1e25a8171e0f6b2bf919)

Token ID 1 successfully bridged from Base to Flow EVM. View on [LayerZero Scan](https://testnet.layerzeroscan.com).

Also can be seen here:
https://evm-testnet.flowscan.io/token/0x255763f3fC9774E04559ee7A4d49F78a27759C09


## Technologies

- **LayerZero V2** - Cross-chain messaging
- **Filecoin Onchain Cloud** - Decentralized storage (Synapse SDK)
- **Foundry** - Smart contract development
- **OpenZeppelin** - Secure contract libraries

## AI Used 

- Including Cursor for the front-end
- Gemini for images
- Scripts were made with quick start guides from sponsors guides with guidance from ClaudeAI

## Resources

- [LayerZero Docs](https://docs.layerzero.network/)
- [Filecoin Onchain Cloud Docs](https://docs.filoz.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Flow Testnet Faucet](https://faucet.flow.com/)

---

**Status:** ✅ Fully functional cross-chain NFT bridge

**Built for:** ETH Global Buenos Aires 2025 🚀

