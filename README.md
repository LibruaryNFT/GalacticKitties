# FlowZero - Galactic Kitties NFT Bridge

A cross-chain NFT project that demonstrates deploying an ERC721 NFT contract on Base Sepolia, minting NFTs, and bridging them to Flow EVM using LayerZero's ONFT (Omnichain NFT) protocol.

## Project Overview

This project implements:
- **Galactic Kitties NFT Contract**: An ERC721 NFT contract deployed on Base Sepolia
- **Cross-Chain Bridging**: Using LayerZero v2 to bridge NFTs from Base to Flow EVM
- **Image Storage**: NFT images stored on Filecoin using Synapse SDK

## What We Built

1. ✅ Deployed `GalacticKitties` ERC721 contract on Base Sepolia
2. ✅ Minted NFTs on Base Sepolia
3. ✅ Set up LayerZero ONFT infrastructure:
   - `GalacticKittiesAdapter` on Base (wraps existing NFT for bridging)
   - `WrappedGalacticKittiesONFT` on Flow EVM (receives bridged NFTs)
4. ✅ Configured peer connections between chains
5. ✅ Successfully bridged NFTs from Base to Flow EVM

## Project Structure

```
flowzero/
├── contracts/
│   ├── GalacticKitties.sol              # Main NFT contract (Base)
│   ├── GalacticKittiesAdapter.sol        # LayerZero adapter (Base)
│   └── WrappedGalacticKittiesONFT.sol    # Wrapped ONFT (Flow EVM)
├── script/
│   ├── deployGalacticKitties.js          # Deploy NFT contract (Hardhat)
│   ├── mintKitty.js                      # Mint NFT script
│   ├── DeployBaseAdapter.s.sol           # Deploy adapter on Base
│   ├── DeployFlowONFT.s.sol              # Deploy ONFT on Flow
│   ├── SetPeerOnBase.s.sol               # Configure Base peer
│   ├── SetPeerOnFlow.s.sol               # Configure Flow peer
│   ├── SetEnforcedOptions.s.sol          # Set LayerZero options
│   ├── BridgeNFT.s.sol                   # Bridge NFT script
│   └── CheckNFTs.s.sol                   # Check owned NFTs
├── uploadImages.js                       # Upload images to Filecoin
├── hardhat.config.ts                     # Hardhat configuration
└── foundry.toml                          # Foundry configuration
```

## Prerequisites

- Node.js and npm
- Hardhat
- Foundry
- Private keys for Base Sepolia and Flow Testnet
- RPC URLs for both networks

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Foundry** (if not already installed):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Create `.env` file** with the following variables:
   ```env
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASE_SEPOLIA_PRIVATE_KEY=your_base_private_key
   FLOW_EVM_RPC_URL=https://testnet.evm.nodes.onflow.org
   FLOW_TESTNET_PRIVATE_KEY=your_flow_private_key
   ```

## Deployment Workflow

### 1. Deploy NFT Contract on Base Sepolia

```bash
npx hardhat run script/deployGalacticKitties.js --network baseSepolia
```

This deploys the `GalacticKitties` contract. Save the deployed address.

### 2. Mint an NFT

```bash
npx hardhat run script/mintKitty.js --network baseSepolia
```

Or update the contract address in `script/mintKitty.js` and run it.

### 3. Upload Images to Filecoin (Optional)

```bash
node uploadImages.js
```

This uploads NFT images to Filecoin and generates `image-cids.json`.

### 4. Deploy LayerZero Adapter on Base

```bash
forge script script/DeployBaseAdapter.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --private-key $BASE_SEPOLIA_PRIVATE_KEY
```

Update the `galacticKitties` address in the script before running.

### 5. Deploy ONFT Contract on Flow EVM

```bash
forge script script/DeployFlowONFT.s.sol --rpc-url $FLOW_EVM_RPC_URL --broadcast --private-key $FLOW_TESTNET_PRIVATE_KEY
```

### 6. Configure Peer Connections

**Set peer on Base adapter:**
```bash
forge script script/SetPeerOnBase.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --private-key $BASE_SEPOLIA_PRIVATE_KEY
```

**Set peer on Flow ONFT:**
```bash
forge script script/SetPeerOnFlow.s.sol --rpc-url $FLOW_EVM_RPC_URL --broadcast --private-key $FLOW_TESTNET_PRIVATE_KEY
```

### 7. Set Enforced Options

```bash
forge script script/SetEnforcedOptions.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --private-key $BASE_SEPOLIA_PRIVATE_KEY
```

This configures gas limits for receiving NFTs on Flow.

### 8. Bridge an NFT

```bash
forge script script/BridgeNFT.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --private-key $BASE_SEPOLIA_PRIVATE_KEY
```

Update the `tokenId` in the script to bridge a specific NFT.

## Key Contracts

### GalacticKitties (Base Sepolia)
- **Address**: `0x23F1a69E8100D758bb1E88F783e565739f66F6E5`
- Standard ERC721 NFT contract
- Public `mint()` function
- Owner can update base URI

### GalacticKittiesAdapter (Base Sepolia)
- **Address**: `0x953015B459e7862DE2d2CF3624c2DadfFf6310c2`
- Wraps `GalacticKitties` for LayerZero bridging
- Locks NFTs on Base when bridging

### WrappedGalacticKittiesONFT (Flow EVM)
- **Address**: `0xEff1A41FC690152a9C2ce26aF24aF0dbB321397B`
- Receives and mints wrapped NFTs on Flow
- Maintains same token IDs as original

## Network Configuration

- **Base Sepolia**
  - Chain ID: 84532
  - LayerZero Endpoint ID (EID): 40245
  - RPC: https://sepolia.base.org

- **Flow EVM Testnet**
  - Chain ID: 545
  - LayerZero Endpoint ID (EID): 40351
  - RPC: https://testnet.evm.nodes.onflow.org

## Useful Commands

**Check owned NFTs:**
```bash
forge script script/CheckNFTs.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL
```

**Build contracts:**
```bash
forge build
```

**Run tests:**
```bash
forge test
```

## Monitoring

Track your bridge transactions on [LayerZero Scan](https://testnet.layerzeroscan.com).

## Technologies Used

- **Hardhat**: Development environment and deployment
- **Foundry**: Smart contract testing and scripting
- **LayerZero v2**: Cross-chain messaging protocol
- **OpenZeppelin**: Secure smart contract libraries
- **Synapse SDK**: Filecoin storage integration
- **Ethers.js v6**: Ethereum interaction library

## License

MIT
