import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (project root)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function uploadAllMetadata() {
  const synapse = await Synapse.create({
    privateKey: process.env.BASE_SEPOLIA_PRIVATE_KEY,
    rpcURL: RPC_URLS.calibration.http,
  });

  // Load existing CIDs if file exists
  let metadataCids = {};
  if (fs.existsSync("metadata-cids.json")) {
    metadataCids = JSON.parse(fs.readFileSync("metadata-cids.json", "utf8"));
    console.log("📁 Loaded existing metadata CIDs");
  }

  // Upload metadata files 10-15 (1-9 already uploaded)
  for (let i = 10; i <= 15; i++) {
    const metadataPath = `metadata/${i}.json`;
    if (!fs.existsSync(metadataPath)) {
      console.log(`⚠️  Skipping ${metadataPath} - file not found`);
      continue;
    }
    const metadata = fs.readFileSync(metadataPath, "utf8");
    const data = new TextEncoder().encode(metadata);
    const { pieceCid } = await synapse.storage.upload(data);
    // Ensure we're storing it correctly (not nested)
    if (typeof metadataCids[i] === 'object' && metadataCids[i]["/"]) {
      // Already has the correct structure, just update the CID
      metadataCids[i]["/"] = pieceCid;
    } else {
      metadataCids[i] = { "/": pieceCid };
    }
    console.log(`✅ Uploaded ${metadataPath} -> ${pieceCid}`);
  }

  fs.writeFileSync("metadata-cids.json", JSON.stringify(metadataCids, null, 2));
  console.log("\n✅ All metadata uploaded!");
  console.log(JSON.stringify(metadataCids, null, 2));
}

uploadAllMetadata();