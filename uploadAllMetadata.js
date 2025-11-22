import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import fs from "fs";

async function uploadAllMetadata() {
  const synapse = await Synapse.create({
    privateKey: process.env.BASE_SEPOLIA_PRIVATE_KEY,
    rpcURL: RPC_URLS.calibration.http,
  });

  const metadataCids = {};

  // Upload metadata files 1-9
  for (let i = 1; i <= 9; i++) {
    const metadata = fs.readFileSync(`metadata/${i}.json`, "utf8");
    const data = new TextEncoder().encode(metadata);
    const { pieceCid } = await synapse.storage.upload(data);
    metadataCids[i] = pieceCid;
    console.log(`✅ Uploaded metadata/${i}.json -> ${pieceCid}`);
  }

  fs.writeFileSync("metadata-cids.json", JSON.stringify(metadataCids, null, 2));
  console.log("\n✅ All metadata uploaded!");
  console.log(JSON.stringify(metadataCids, null, 2));
}

uploadAllMetadata();