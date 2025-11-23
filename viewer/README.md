# Galactic Kitties Viewer

React app for viewing and bridging Galactic Kitties NFTs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Get a WalletConnect Project ID:
   - Go to https://cloud.walletconnect.com
   - Create a project
   - Copy your Project ID
   - Replace `YOUR_WALLETCONNECT_PROJECT_ID` in `src/App.jsx`

3. Start dev server:
```bash
npm run dev
```

## Features

- ✅ Connect wallet with RainbowKit (MetaMask, WalletConnect, etc.)
- ✅ View NFTs from Base Sepolia
- ✅ Display NFT metadata and images
- ✅ Bridge NFTs to Flow EVM (owner only)

## Tech Stack

- React + Vite
- RainbowKit (wallet connection UI)
- wagmi (Ethereum React hooks)
- viem (Ethereum library)
- React Query (data fetching)

