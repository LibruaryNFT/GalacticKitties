# Setup React Viewer with RainbowKit

## Why This Approach is Better

✅ **RainbowKit** - Beautiful, professional wallet connection UI
✅ **wagmi** - Modern React hooks for Ethereum (uses viem under the hood)
✅ **viem** - Type-safe, modern Ethereum library (faster than ethers)
✅ **React Query** - Automatic caching, refetching, and state management
✅ **Vite** - Lightning-fast dev server and builds
✅ **Type Safety** - Full TypeScript support

This solves all the issues we had with vanilla JS:
- No more `window.ethereum` detection problems
- Proper React state management
- Auto-reconnection
- Chain switching UI built-in
- Mobile wallet support (WalletConnect)
- Better error handling

## Commands to Run

```bash
# 1. Create React app with Vite
npm create vite@latest viewer -- --template react

# 2. Navigate to viewer directory
cd viewer

# 3. Install base dependencies
npm install

# 4. Install wallet connection libraries
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query

# 5. Start dev server
npm run dev
```

## Note About ethers vs viem

**wagmi uses viem by default**, not ethers. However:
- viem is faster and more modern
- You can still use ethers for specific things if needed
- For your bridge functionality, viem works great with wagmi hooks

If you really need ethers@5.7.2, you can install it separately, but wagmi/viem will handle most of your needs.

## Project Structure After Setup

```
flowzero/
├── contracts/
├── script/
├── filecoin/
├── viewer/              ← New React app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── components/
│   ├── package.json
│   └── vite.config.js
├── index.html           ← Keep for now (can remove later)
└── README.md
```

## Next Steps After Setup

1. Configure RainbowKit for Base Sepolia
2. Create NFT viewer component
3. Add bridge functionality using wagmi hooks
4. Connect to your existing contracts
