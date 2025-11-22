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

  // Set URIs for tokens 3-9
  for (let tokenId = 3; tokenId <= 9; tokenId++) {
    const pieceCid = metadataCids[tokenId]["/"];
    const uri = `filecoin://${pieceCid}`;

    console.log(`Setting URI for token ${tokenId} on Base...`);
    const tx = await baseNFT.setTokenURI(tokenId, uri);
    await tx.wait();
    console.log(`✅ Token ${tokenId} -> ${uri}\n`);
  }

  console.log("🎉 All token URIs updated on Base!");
}

setTokenURIs().catch(console.error);