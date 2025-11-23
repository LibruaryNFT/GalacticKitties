import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // Use the correct contract address (check which one you're using)
  const contractAddr = "0x3A25Ec105ac25f27476998616555674F7F8EBA3E";
  const gk = await ethers.getContractAt("GalacticKitties", contractAddr);
  
  // Mint 12 NFTs (will be tokens 4-15 if you already have 1-3)
  const numToMint = 12;
  
  console.log(`Minting ${numToMint} NFTs...\n`);
  
  for (let i = 0; i < numToMint; i++) {
    try {
      console.log(`Minting NFT ${i + 1}/${numToMint}...`);
      const tx = await gk.mint();
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Minted! (Block: ${receipt.blockNumber})\n`);
      
      // Small delay to avoid rate limiting
      if (i < numToMint - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`❌ Error minting NFT ${i + 1}:`, error.message);
      // Continue with next NFT
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log("\n🎉 All NFTs minted!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

