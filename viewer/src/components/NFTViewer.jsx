import { useState, useEffect } from 'react'
import { encodeFunctionData, decodeFunctionResult } from 'viem'
import './NFTViewer.css'

// Contract addresses
const BASE_NFT = '0x3A25Ec105ac25f27476998616555674F7F8EBA3E'
const FLOW_NFT = '0x255763f3fC9774E04559ee7A4d49F78a27759C09'
const FLOW_RPC = 'https://testnet.evm.nodes.onflow.org'
const PROXY_SERVER = 'https://galactickitties-production.up.railway.app'
const OWNER_ADDRESS = '0x8151a21cdaa1675a105497859ae181edd3d0c5c2'

// ERC721 ABI
const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]

// Extract CID from filecoin:// or ipfs:// URL
function extractCID(uri) {
  if (!uri) return null;
  if (uri.startsWith('filecoin://')) {
    return uri.replace('filecoin://', '').split('/')[0];
  }
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', '').split('/')[0];
  }
  return null;
}

// Fetch metadata with retry logic
async function fetchMetadata(pieceCid, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${PROXY_SERVER}/metadata/${pieceCid}`);
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Metadata fetch attempt ${i + 1} failed:`, error);
      if (i === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

function NFTViewer() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Initializing...')
  const [showRawData, setShowRawData] = useState(false)

  // Viewing address (always use owner address)
  const viewingAddress = OWNER_ADDRESS.toLowerCase()

  // Load NFTs from both chains
  useEffect(() => {
    async function loadNFTs() {
      console.log('Loading NFTs for address:', viewingAddress)
      setLoading(true)
      setLoadingMessage('Checking Base Sepolia balance...')
      const allNFTs = []

      // Load Base NFTs - check balance via RPC
      try {
        const baseBalanceResponse = await fetch('https://sepolia.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: BASE_NFT,
                data: encodeFunctionData({
                  abi: ERC721_ABI,
                  functionName: 'balanceOf',
                  args: [viewingAddress],
                }),
              },
              'latest',
            ],
            id: 1,
          }),
        }).then(r => r.json())

        if (baseBalanceResponse.result && baseBalanceResponse.result !== '0x') {
          const baseBalance = BigInt(baseBalanceResponse.result)
          if (baseBalance > 0n) {
            console.log('Base balance:', Number(baseBalance))
            setLoadingMessage(`Loading ${Number(baseBalance)} NFT${Number(baseBalance) > 1 ? 's' : ''} from Base Sepolia...`)
            const baseNFTs = await loadChainNFTs('base', Number(baseBalance), viewingAddress)
            console.log('Base NFTs found:', baseNFTs.length)
            allNFTs.push(...baseNFTs)
          }
        }
      } catch (e) {
        console.error('Error loading Base NFTs:', e)
      }

      // Load Flow NFTs (check balance via RPC)
      try {
        const flowBalance = await fetch(FLOW_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: FLOW_NFT,
                data: encodeFunctionData({
                  abi: ERC721_ABI,
                  functionName: 'balanceOf',
                  args: [viewingAddress],
                }),
              },
              'latest',
            ],
            id: 1,
          }),
        }).then(r => r.json())

        if (flowBalance.result && flowBalance.result !== '0x') {
          const balance = BigInt(flowBalance.result)
          if (balance > 0n) {
            console.log('Flow balance:', Number(balance))
            setLoadingMessage(`Loading ${Number(balance)} NFT${Number(balance) > 1 ? 's' : ''} from Flow EVM...`)
            const flowNFTs = await loadChainNFTs('flow', Number(balance), viewingAddress)
            console.log('Flow NFTs found:', flowNFTs.length)
            allNFTs.push(...flowNFTs)
          }
        }
      } catch (e) {
        console.error('Error loading Flow NFTs:', e)
      }

      console.log('Total NFTs loaded:', allNFTs.length)
      setLoadingMessage('Finalizing...')
      setNfts(allNFTs)
      setLoading(false)
    }

    loadNFTs()
  }, [viewingAddress])

  async function loadChainNFTs(chain, balance, owner) {
    const contractAddress = chain === 'base' ? BASE_NFT : FLOW_NFT
    const rpcUrl = chain === 'base' ? 'https://sepolia.base.org' : FLOW_RPC

    // Only check token IDs 1, 2, 3
    const tokenIdsToCheck = [1, 2, 3]
    
    // Find owned tokens - PARALLEL REQUESTS
    const ownerChecks = []
    for (const tokenId of tokenIdsToCheck) {
      const ownerData = encodeFunctionData({
        abi: ERC721_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      })

      ownerChecks.push(
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: contractAddress, data: ownerData }, 'latest'],
            id: tokenId,
          }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.result && data.result !== '0x') {
              try {
                const nftOwner = decodeFunctionResult({
                  abi: ERC721_ABI,
                  functionName: 'ownerOf',
                  data: data.result,
                })
                if (nftOwner.toLowerCase() === owner.toLowerCase()) {
                  return tokenId
                }
              } catch (e) {
                // Invalid result, skip
              }
            }
            return null
          })
          .catch(() => null)
      )
    }

    // Wait for all owner checks
    const results = await Promise.all(ownerChecks)
    const foundTokens = results.filter(id => id !== null)

    // Get token URIs - always from Base contract (source of truth) - PARALLEL REQUESTS
    const uriPromises = foundTokens.map(tokenId => {
      const uriData = encodeFunctionData({
        abi: ERC721_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      })

      return fetch('https://sepolia.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: BASE_NFT, data: uriData }, 'latest'],
          id: tokenId,
        }),
      })
        .then(r => r.json())
        .then(result => {
          if (result.result && result.result !== '0x') {
            try {
              const uri = decodeFunctionResult({
                abi: ERC721_ABI,
                functionName: 'tokenURI',
                data: result.result,
              })
              return { tokenId, uri }
            } catch (e) {
              return { tokenId, uri: null }
            }
          }
          return { tokenId, uri: null }
        })
        .catch(() => ({ tokenId, uri: null }))
    })

    const uriResults = await Promise.all(uriPromises)

    // Fetch metadata in parallel
    const nftPromises = uriResults.map(async ({ tokenId, uri }) => {
      const metadataCid = extractCID(uri)
      if (metadataCid) {
        try {
          const metadata = await fetchMetadata(metadataCid)
          return {
            tokenId,
            chain,
            uri,
            metadataCid,
            metadata,
          }
        } catch (error) {
          console.error(`Failed to fetch metadata for token ${tokenId}:`, error)
          return {
            tokenId,
            chain,
            uri,
            metadataCid,
            error: error.message,
          }
        }
      }
      return {
        tokenId,
        chain,
        uri,
        metadataCid: null,
        error: 'No metadata CID found',
      }
    })

    return await Promise.all(nftPromises)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-accent mx-auto mb-4"></div>
          <p className="text-cosmic-muted text-lg">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#1e1e3e' }}>
      <div className="flex items-center justify-between border border-cosmic-border rounded-lg p-3 backdrop-blur-sm" style={{ backgroundColor: '#1e1e3e' }}>
        <p className="text-sm text-cosmic-muted/90">
          Viewing: <span className="text-cosmic-muted/80 font-mono">{viewingAddress.substring(0, 6)}...{viewingAddress.substring(38)}</span>
        </p>
        <label className="flex items-center space-x-4 cursor-pointer">
          <span className="text-cosmic-text font-semibold text-base">Show Raw CIDs & Piece IDs</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showRawData}
              onChange={(e) => setShowRawData(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-16 h-9 rounded-full transition-colors shadow-lg ${showRawData ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-600'}`}>
              <div className={`w-7 h-7 bg-white rounded-full shadow-lg transform transition-transform ${showRawData ? 'translate-x-8' : 'translate-x-1'} mt-1`}></div>
            </div>
          </div>
        </label>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-cosmic-muted text-lg">No NFTs found</p>
          <p className="text-cosmic-muted text-sm mt-2">Make sure you have NFTs minted and the contract addresses are correct.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {nfts.map((nft) => (
            <NFTCard
              key={`${nft.chain}-${nft.tokenId}`}
              nft={nft}
              showRawData={showRawData}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NFTCard({ nft, showRawData }) {
  // Get image URL
  let imageCid = null
  if (nft.metadata?.image) {
    imageCid = extractCID(nft.metadata.image)
  }
  const imageUrl = imageCid ? `${PROXY_SERVER}/image/${imageCid}` : null

  return (
    <div className="border border-cosmic-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all hover:border-cosmic-accent/50 backdrop-blur-sm" style={{ backgroundColor: '#1a1a2e' }}>
      <div className="p-3 space-y-3">
        <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
          nft.chain === 'base' 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
            : 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
        }`}>
          {nft.chain === 'base' ? 'Base Sepolia' : 'Flow EVM'}
        </div>
        
        {imageUrl ? (
          <div className="w-full max-w-[120px] mx-auto aspect-square rounded-lg overflow-hidden border border-cosmic-border/50" style={{ backgroundColor: '#1e1e3e' }}>
            <img 
              src={imageUrl} 
              alt={`NFT ${nft.tokenId}`} 
              className="w-full h-full object-cover" 
              loading="lazy" 
            />
          </div>
        ) : (
          <div className="w-full max-w-[120px] mx-auto aspect-square rounded-lg flex items-center justify-center text-cosmic-muted text-xs border border-cosmic-border/50" style={{ backgroundColor: '#1e1e3e' }}>
            No image
          </div>
        )}
        
        <div className="space-y-2">
          <div>
            <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
              {nft.metadata?.name || `Galactic Kitty #${nft.tokenId}`}
            </h3>
            <p className="text-cosmic-muted text-xs line-clamp-2">
              {nft.metadata?.description || 'An omnichain space cat'}
            </p>
          </div>
          
          {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-cosmic-text uppercase tracking-wide">Attributes</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {nft.metadata.attributes.slice(0, 4).map((attr, i) => (
                  <div key={i} className="rounded p-1.5 border border-cosmic-border" style={{ backgroundColor: '#1e1e3e' }}>
                    <div className="text-[10px] text-cosmic-muted uppercase truncate">{attr.trait_type}</div>
                    <div className="text-xs font-semibold text-cosmic-text truncate">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {nft.error && (
          <div className="bg-red-900/30 border border-red-600/30 text-red-400 rounded p-2 text-xs">
            Error: {nft.error}
          </div>
        )}
        
        {showRawData && (
          <div className="pt-2 border-t border-cosmic-border space-y-2">
            <h4 className="text-xs font-semibold text-cosmic-text uppercase tracking-wide">Raw Data</h4>
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="text-cosmic-muted mb-0.5">Token URI:</div>
                <div className="rounded p-1.5 font-mono text-cosmic-text break-all text-[9px] border border-cosmic-border" style={{ backgroundColor: '#1e1e3e' }}>
                  {nft.uri || 'N/A'}
                </div>
              </div>
              {nft.metadataCid && (
                <div>
                  <div className="text-cosmic-muted mb-0.5">Metadata CID:</div>
                  <div className="rounded p-1.5 font-mono text-cosmic-text break-all text-[9px] border border-cosmic-border" style={{ backgroundColor: '#1e1e3e' }}>
                    {nft.metadataCid}
                  </div>
                </div>
              )}
              {imageCid && (
                <div>
                  <div className="text-cosmic-muted mb-0.5">Image CID:</div>
                  <div className="rounded p-1.5 font-mono text-cosmic-text break-all text-[9px] border border-cosmic-border" style={{ backgroundColor: '#1e1e3e' }}>
                    {imageCid}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NFTViewer
