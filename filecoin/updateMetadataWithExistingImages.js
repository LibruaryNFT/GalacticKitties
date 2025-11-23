import fs from "fs";

// Load image CIDs
const imageCids = JSON.parse(fs.readFileSync("image-cids.json", "utf8"));

// Get available image CIDs (1, 2, 3)
const availableImageIds = Object.keys(imageCids)
  .map(Number)
  .filter(id => imageCids[id]?.["/"])
  .sort((a, b) => a - b);

console.log(`📸 Found ${availableImageIds.length} image(s) to reuse: ${availableImageIds.join(", ")}\n`);

// Update metadata files 10-15
for (let i = 10; i <= 15; i++) {
  // Cycle through available images (10 -> image 1, 11 -> image 2, 12 -> image 3, 13 -> image 1, etc.)
  const imageIndex = (i - 10) % availableImageIds.length;
  const imageId = availableImageIds[imageIndex];
  const imageCid = imageCids[imageId]["/"];

  const metadataPath = `metadata/${i}.json`;
  if (!fs.existsSync(metadataPath)) {
    console.log(`⚠️  ${metadataPath} not found, skipping...`);
    continue;
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  metadata.image = `filecoin://${imageCid}`;

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Updated metadata/${i}.json (using image from token #${imageId})`);
}

console.log("\n✅ All metadata files updated with existing image CIDs!");

