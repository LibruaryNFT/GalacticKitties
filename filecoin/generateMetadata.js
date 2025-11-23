import fs from "fs";

// Load image CIDs
const imageCids = JSON.parse(fs.readFileSync("image-cids.json", "utf8"));

// Get available image CIDs (1, 2, 3)
const availableImageIds = Object.keys(imageCids)
  .map(Number)
  .filter(id => imageCids[id]?.["/"])
  .sort((a, b) => a - b);

if (availableImageIds.length === 0) {
  console.error("❌ No image CIDs found! Please upload images first.");
  process.exit(1);
}

console.log(`📸 Found ${availableImageIds.length} image(s) to reuse: ${availableImageIds.join(", ")}\n`);

// Generate metadata files 10-15
for (let i = 10; i <= 15; i++) {
  // Cycle through available images (10 -> image 1, 11 -> image 2, 12 -> image 3, 13 -> image 1, etc.)
  const imageIndex = (i - 10) % availableImageIds.length;
  const imageId = availableImageIds[imageIndex];
  const imageCid = imageCids[imageId]["/"];

  const metadata = {
    name: `Galactic Kitty #${i}`,
    description: "An omnichain space cat bridged via LayerZero. Images stored on Filecoin Onchain Cloud.",
    image: `filecoin://${imageCid}`,
    attributes: [
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Origin Chain", value: "Base Sepolia" },
      { trait_type: "Bridge Protocol", value: "LayerZero V2" },
      { trait_type: "Storage", value: "Filecoin Onchain Cloud" }
    ]
  };

  fs.writeFileSync(`metadata/${i}.json`, JSON.stringify(metadata, null, 2));
  console.log(`✅ Created metadata/${i}.json (using image from token #${imageId})`);
}

console.log("\n✅ All metadata files generated!");
console.log("\n📝 Next steps:");
console.log("1. Add images 4.jpg through 15.jpg to the filecoin/ directory");
console.log("2. Run: node filecoin/uploadImages.js (from filecoin directory)");
console.log("3. Update metadata files 10-15 with correct image CIDs if needed");
console.log("4. Run: node filecoin/uploadAllMetadata.js (from filecoin directory)");
console.log("5. Mint NFTs 4-15 using: cast send <contract> \"mint()\" --rpc-url <rpc> --private-key <key>");
console.log("6. Run: node filecoin/setTokenURIs.js (from filecoin directory)");

