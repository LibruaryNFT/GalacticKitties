import './App.css'
import NFTViewer from './components/NFTViewer'

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1e3e' }}>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-md border-b border-purple-500/30 shadow-xl shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                🚀 Galactic Kitties
              </h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: '#1e1e3e' }}>
        <NFTViewer />
      </main>
    </div>
  )
}

export default App

