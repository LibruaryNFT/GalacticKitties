import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { useState, useEffect } from 'react'
import { encodeFunctionData, decodeFunctionResult, formatEther, pad } from 'viem'
import './NFTViewer.css'

// Contract addresses
const BASE_NFT = '0x3A25Ec105ac25f27476998616555674F7F8EBA3E'
const FLOW_NFT = '0x255763f3fC9774E04559ee7A4d49F78a27759C09'
const ADAPTER_ADDRESS = '0x7eD427C937235822c43D30c56aa52823E55E0c42'
const FLOW_RPC = 'https://testnet.evm.nodes.onflow.org'
const PROXY_SERVER = 'https://galactickitties-production.up.railway.app'
const OWNER_ADDRESS = '0x8151a21cdaa1675a105497859ae181edd3d0c5c2'
const FLOW_EID = 40351

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
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
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
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Adapter ABI
const ADAPTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'dstEid', type: 'uint32' },
          { name: 'to', type: 'bytes32' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'extraOptions', type: 'bytes' },
          { name: 'composeMsg', type: 'bytes' },
          { name: 'onftCmd', type: 'bytes' },
        ],
        name: 'sendParam',
        type: 'tuple',
      },
      { name: 'payInLzToken', type: 'bool' },
    ],
    name: 'quoteSend',
    outputs: [
      {
        components: [
          { name: 'nativeFee', type: 'uint128' },
          { name: 'lzTokenFee', type: 'uint128' },
        ],
        name: 'fee',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { name: 'dstEid', type: 'uint32' },
          { name: 'to', type: 'bytes32' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'extraOptions', type: 'bytes' },
          { name: 'composeMsg', type: 'bytes' },
          { name: 'onftCmd', type: 'bytes' },
        ],
        name: 'sendParam',
        type: 'tuple',
      },
      {
        components: [
          { name: 'nativeFee', type: 'uint128' },
          { name: 'lzTokenFee', type: 'uint128' },
        ],
        name: 'fee',
        type: 'tuple',
      },
      { name: 'refundTo', type: 'address' },
    ],
    name: 'send',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

// Extract CID from filecoin:// or ipfs:// URL
function extractCID(uri) {
  if (!uri) return null;
  if (uri.startsWith('filecoin://')) {
    return uri.replace('filecoin://', '').split('/')[0];
  }
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', '').split('/')[0];
  }
  return uri;
}

// Fetch metadata from proxy with retry
async function fetchMetadata(pieceCid, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(`${PROXY_SERVER}/metadata/${pieceCid}`);
      if (response.status === 429) {
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries) {
        console.error('Error fetching metadata:', error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
}

function NFTViewer() {
  const { address, isConnected } = useAccount()
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRawData, setShowRawData] = useState(false)

  // Viewing address (defaults to owner, but can view any address)
  const viewingAddress = (address || OWNER_ADDRESS).toLowerCase()

  // Fetch balance from Base
  const { data: baseBalance } = useReadContract({
    address: BASE_NFT,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: [viewingAddress],
    chainId: baseSepolia.id,
  })

  // Load NFTs from both chains
  useEffect(() => {
    async function loadNFTs() {
      console.log('Loading NFTs for address:', viewingAddress)
      setLoading(true)
      const allNFTs = []

      // Load Base NFTs
      if (baseBalance && Number(baseBalance) > 0) {
        console.log('Base balance:', Number(baseBalance))
        const baseNFTs = await loadChainNFTs('base', Number(baseBalance), viewingAddress)
        console.log('Base NFTs found:', baseNFTs.length)
        allNFTs.push(...baseNFTs)
      } else {
        console.log('No Base NFTs (balance:', baseBalance, ')')
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
            const flowNFTs = await loadChainNFTs('flow', Number(balance), viewingAddress)
            console.log('Flow NFTs found:', flowNFTs.length)
            allNFTs.push(...flowNFTs)
          }
        }
      } catch (e) {
        console.error('Error loading Flow NFTs:', e)
      }

      console.log('Total NFTs loaded:', allNFTs.length)
      setNfts(allNFTs)
      setLoading(false)
    }

    loadNFTs()
  }, [baseBalance, viewingAddress])

  async function loadChainNFTs(chain, balance, owner) {
    const contractAddress = chain === 'base' ? BASE_NFT : FLOW_NFT
    const foundTokens = []

    // Find owned tokens (check 1-100)
    for (let i = 1; i <= 100 && foundTokens.length < balance; i++) {
      try {
        if (i > 1) await new Promise(resolve => setTimeout(resolve, 100))

        const ownerData = encodeFunctionData({
          abi: ERC721_ABI,
          functionName: 'ownerOf',
          args: [BigInt(i)],
        })

        const rpcUrl = chain === 'base' ? 'https://sepolia.base.org' : FLOW_RPC
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: contractAddress, data: ownerData }, 'latest'],
            id: 1,
          }),
        })

        const data = await response.json()
        if (data.result && data.result !== '0x') {
          const result = decodeFunctionResult({
            abi: ERC721_ABI,
            functionName: 'ownerOf',
            data: data.result,
          })
          if (result.toLowerCase() === owner.toLowerCase()) {
            foundTokens.push(i)
          }
        }
      } catch (e) {
        // Token doesn't exist, skip
      }
    }

    // Get token URIs - always from Base contract (source of truth)
    const nftData = []
    for (let idx = 0; idx < foundTokens.length; idx++) {
      const tokenId = foundTokens[idx]
      try {
        if (idx > 0) await new Promise(resolve => setTimeout(resolve, 150))

        // Always fetch tokenURI from Base contract (even for Flow NFTs)
        const uriData = encodeFunctionData({
          abi: ERC721_ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        })

        const uriResponse = await fetch('https://sepolia.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: BASE_NFT, data: uriData }, 'latest'],
            id: 1,
          }),
        })

        const uriResult = await uriResponse.json()
        let uri = null
        let metadata = null

        if (uriResult.result && uriResult.result !== '0x') {
          const decoded = decodeFunctionResult({
            abi: ERC721_ABI,
            functionName: 'tokenURI',
            data: uriResult.result,
          })
          uri = decoded
          const metadataCid = extractCID(uri)

          if (metadataCid) {
            metadata = await fetchMetadata(metadataCid)
          }
        }

        nftData.push({
          tokenId: tokenId.toString(),
          chain: chain,
          uri: uri,
          contractAddress: contractAddress,
          metadata: metadata,
          metadataCid: extractCID(uri),
        })
      } catch (e) {
        console.error(`Error loading token ${tokenId}:`, e)
        nftData.push({
          tokenId: tokenId.toString(),
          chain: chain,
          uri: null,
          contractAddress: contractAddress,
          metadata: null,
          error: e.message,
        })
      }
    }

    return nftData
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-dark-muted text-lg">Loading NFTs from Base and Flow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isConnected && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <p className="text-sm text-dark-muted">
            Viewing: <span className="text-dark-text font-mono">{viewingAddress.substring(0, 6)}...{viewingAddress.substring(38)}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-center bg-dark-surface border border-dark-border rounded-lg p-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <span className="text-dark-text font-medium">Show Raw CIDs & Piece IDs</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showRawData}
              onChange={(e) => setShowRawData(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-14 h-7 rounded-full transition-colors ${showRawData ? 'bg-blue-600' : 'bg-dark-border'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${showRawData ? 'translate-x-7' : 'translate-x-1'} mt-0.5`}></div>
            </div>
          </div>
        </label>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-muted text-lg">No NFTs found</p>
          <p className="text-dark-muted text-sm mt-2">Make sure you have NFTs minted and the contract addresses are correct.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {nfts.map((nft) => (
            <NFTCard
              key={`${nft.chain}-${nft.tokenId}`}
              nft={nft}
              address={address}
              showRawData={showRawData}
              viewingAddress={viewingAddress}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NFTCard({ nft, address, showRawData, viewingAddress }) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const [bridging, setBridging] = useState(false)

  const canBridge = address && address.toLowerCase() === OWNER_ADDRESS.toLowerCase()

  // Convert address to bytes32 (pad to 32 bytes)
  const addressBytes32 = address ? pad(address, { size: 32 }) : '0x0'

  // Quote the bridge fee
  const { data: feeData, refetch: refetchFee } = useReadContract({
    address: ADAPTER_ADDRESS,
    abi: ADAPTER_ABI,
    functionName: 'quoteSend',
    args: [
      {
        dstEid: FLOW_EID,
        to: addressBytes32,
        tokenId: BigInt(nft.tokenId),
        extraOptions: '0x',
        composeMsg: '0x',
        onftCmd: '0x',
      },
      false,
    ],
    chainId: baseSepolia.id,
    query: {
      enabled: canBridge && nft.chain === 'base' && !!address,
    },
  })

  async function handleBridge() {
    if (!canBridge) {
      alert('Only the owner can bridge NFTs')
      return
    }

    if (!address) {
      alert('Please connect your wallet')
      return
    }

    try {
      setBridging(true)

      // Step 1: Approve adapter
      console.log('Step 1: Approving adapter...')
      const approveHash = await writeContract({
        address: BASE_NFT,
        abi: ERC721_ABI,
        functionName: 'approve',
        args: [ADAPTER_ADDRESS, BigInt(nft.tokenId)],
      })

      console.log('Approval transaction:', approveHash)
      alert(`Approval sent! Transaction: ${approveHash}\n\nWaiting for confirmation...`)

      // Wait for approval to be confirmed
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Step 2: Get fee (refresh if needed)
      if (!feeData) {
        await refetchFee()
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!feeData) {
        throw new Error('Could not get bridge fee quote')
      }

      const fee = feeData
      console.log('Bridge fee:', formatEther(fee.nativeFee), 'ETH')

      // Step 3: Build sendParam
      const sendParam = {
        dstEid: FLOW_EID,
        to: addressBytes32,
        tokenId: BigInt(nft.tokenId),
        extraOptions: '0x',
        composeMsg: '0x',
        onftCmd: '0x',
      }

      // Step 4: Send NFT
      console.log('Step 2: Sending NFT...')
      const sendHash = await writeContract({
        address: ADAPTER_ADDRESS,
        abi: ADAPTER_ABI,
        functionName: 'send',
        args: [sendParam, fee, address],
        value: fee.nativeFee,
      })

      console.log('Bridge transaction:', sendHash)
      alert(
        `✅ Bridge transaction sent!\n\n` +
        `Transaction: ${sendHash}\n\n` +
        `View on BaseScan: https://sepolia.basescan.org/tx/${sendHash}\n\n` +
        `The NFT will appear on Flow EVM in a few minutes.`
      )
    } catch (error) {
      console.error('Bridge error:', error)
      alert('Bridge failed: ' + (error.message || error.toString()))
    } finally {
      setBridging(false)
    }
  }

  // Get image URL
  let imageCid = null
  if (nft.metadata?.image) {
    imageCid = extractCID(nft.metadata.image)
  }
  const imageUrl = imageCid ? `${PROXY_SERVER}/image/${imageCid}` : null

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:border-dark-border/50">
      <div className="p-3 space-y-3">
        <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
          nft.chain === 'base' 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
            : 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
        }`}>
          {nft.chain === 'base' ? 'Base Sepolia' : 'Flow EVM'}
        </div>
        
        {imageUrl ? (
          <div className="w-full max-w-[120px] mx-auto aspect-square rounded-lg overflow-hidden bg-dark-surface">
            <img 
              src={imageUrl} 
              alt={`NFT ${nft.tokenId}`} 
              className="w-full h-full object-cover" 
              loading="lazy" 
            />
          </div>
        ) : (
          <div className="w-full max-w-[120px] mx-auto aspect-square bg-dark-surface rounded-lg flex items-center justify-center text-dark-muted text-xs">
            No image
          </div>
        )}
        
        <div className="space-y-2">
          <div>
            <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
              {nft.metadata?.name || `Galactic Kitty #${nft.tokenId}`}
            </h3>
            <p className="text-dark-muted text-xs line-clamp-2">
              {nft.metadata?.description || 'An omnichain space cat'}
            </p>
          </div>
          
          {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-dark-text uppercase tracking-wide">Attributes</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {nft.metadata.attributes.slice(0, 4).map((attr, i) => (
                  <div key={i} className="bg-dark-surface rounded p-1.5 border border-dark-border">
                    <div className="text-[10px] text-dark-muted uppercase truncate">{attr.trait_type}</div>
                    <div className="text-xs font-semibold text-white truncate">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {canBridge && nft.chain === 'base' && (
          <div className="space-y-2 pt-2 border-t border-dark-border">
            {feeData && (
              <div className="text-[10px] text-dark-muted">
                Fee: ~{formatEther(feeData.nativeFee)} ETH
              </div>
            )}
            <button
              onClick={handleBridge}
              disabled={isPending || isConfirming || bridging}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-all text-xs"
            >
              {isPending || isConfirming || bridging ? 'Bridging...' : '🌉 Bridge to Flow'}
            </button>
            {isSuccess && (
              <div className="bg-emerald-900/30 border border-emerald-600/30 text-emerald-400 rounded p-2 text-xs">
                ✅ Bridge confirmed!
              </div>
            )}
          </div>
        )}
        
        {nft.error && (
          <div className="bg-red-900/30 border border-red-600/30 text-red-400 rounded p-2 text-xs">
            Error: {nft.error}
          </div>
        )}
        
        {showRawData && (
          <div className="pt-2 border-t border-dark-border space-y-2">
            <h4 className="text-xs font-semibold text-dark-text uppercase tracking-wide">Raw Data</h4>
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="text-dark-muted mb-0.5">Token URI:</div>
                <div className="bg-dark-surface rounded p-1.5 font-mono text-dark-text break-all text-[9px]">
                  {nft.uri || 'N/A'}
                </div>
              </div>
              {nft.metadataCid && (
                <div>
                  <div className="text-dark-muted mb-0.5">Metadata CID:</div>
                  <div className="bg-dark-surface rounded p-1.5 font-mono text-dark-text break-all text-[9px]">
                    {nft.metadataCid}
                  </div>
                </div>
              )}
              {imageCid && (
                <div>
                  <div className="text-dark-muted mb-0.5">Image CID:</div>
                  <div className="bg-dark-surface rounded p-1.5 font-mono text-dark-text break-all text-[9px]">
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
