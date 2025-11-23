import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig, ConnectButton } from '@rainbow-me/rainbowkit'
import { baseSepolia } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'
import './App.css'
import NFTViewer from './components/NFTViewer'

// Configure RainbowKit
// Note: You need a WalletConnect Project ID from https://cloud.walletconnect.com
// Create a free account and get your project ID, then create viewer/.env with:
// VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

if (projectId === 'YOUR_WALLETCONNECT_PROJECT_ID') {
  console.warn('⚠️ WalletConnect Project ID not set. Get one from https://cloud.walletconnect.com')
  console.warn('MetaMask will still work, but WalletConnect features won\'t be available')
}

const config = getDefaultConfig({
  appName: 'Galactic Kitties',
  projectId: projectId,
  chains: [baseSepolia],
  ssr: true,
})

// Create React Query client
const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-cosmic-bg">
            <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-md border-b border-purple-500/30 shadow-xl shadow-purple-500/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                      🚀 Galactic Kitties
                    </h1>
                  </div>
                  <div className="flex items-center">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <NFTViewer />
            </main>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

