import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function syncMetadataFromBase() {
  const baseProvider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const flowProvider = new ethers.JsonRpcProvider(process.env.FLOW_EVM_RPC_URL);
  const flowSigner = new ethers.Wallet(process.env.FLOW_TESTNET_PRIVATE_KEY, flowProvider);
  
  const baseContract = "0x3A25Ec105ac25f27476998616555674F7F8EBA3E";
  const flowContract = "0x255763f3fC9774E04559ee7A4d49F78a27759C09";

  const abi = [
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function setTokenURI(uint256 tokenId, string memory uri) external",
    "function ownerOf(uint256 tokenId) view returns (address)"
  ];

  const baseNFT = new ethers.Contract(baseContract, abi, baseProvider);
  const flowNFT = new ethers.Contract(flowContract, abi, flowSigner);

  const bridgedTokens = [1];

  for (const tokenId of bridgedTokens) {
    const owner = await flowNFT.ownerOf(tokenId);
    console.log(`Token ${tokenId} owner on Flow: ${owner}`);
    
    const baseURI = await baseNFT.tokenURI(tokenId);
    console.log(`Base URI: ${baseURI}`);
    
    const tx = await flowNFT.setTokenURI(tokenId, baseURI);
    await tx.wait();
    console.log(`✅ Token ${tokenId} synced!\n`);
  }
}

syncMetadataFromBase().catch(console.error);