import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function setTokenURIs() {
  // Load metadata CIDs
  const metadataCids = JSON.parse(fs.readFileSync("metadata-cids.json"));

  // Setup Base provider and signer
  const baseProvider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const baseSigner = new ethers.Wallet(process.env.BASE_SEPOLIA_PRIVATE_KEY, baseProvider);

  // Contract address
  const baseContract = "0x23F1a69E8100D758bb1E88F783e565739f66F6E5";

  // ABI for setTokenURI
  const abi = ["function setTokenURI(uint256 tokenId, string memory uri) external"];
  const baseNFT = new ethers.Contract(baseContract, abi, baseSigner);

  // Set URIs for tokens 4-15 (or all tokens that have metadata)
  const tokenIds = Object.keys(metadataCids).map(Number).sort((a, b) => a - b);
  
  for (const tokenId of tokenIds) {
    // Skip if already set (optional - you can remove this check)
    try {
      const existingURI = await baseNFT.tokenURI(tokenId);
      if (existingURI && existingURI.startsWith("filecoin://")) {
        console.log(`⏭️  Token ${tokenId} already has URI, skipping...`);
        continue;
      }
    } catch (e) {
      // Token might not exist yet, continue
    }

    // Handle nested structure if it exists
    let pieceCid = metadataCids[tokenId]?.["/"];
    if (typeof pieceCid === 'object' && pieceCid["/"]) {
      pieceCid = pieceCid["/"];
    }
    
    if (!pieceCid || typeof pieceCid !== 'string') {
      console.log(`⚠️  No valid CID found for token ${tokenId}, skipping...`);
      continue;
    }
    
    const uri = `filecoin://${pieceCid}`;

    console.log(`Setting URI for token ${tokenId} on Base...`);
    const tx = await baseNFT.setTokenURI(tokenId, uri);
    await tx.wait();
    console.log(`✅ Token ${tokenId} -> ${uri}\n`);
  }

  console.log("🎉 All token URIs updated on Base!");
}

setTokenURIs().catch(console.error);