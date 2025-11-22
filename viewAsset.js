import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import fs from "fs";

async function viewAsset(pieceCid) {
  const synapse = await Synapse.create({
    privateKey: process.env.BASE_SEPOLIA_PRIVATE_KEY,
    rpcURL: RPC_URLS.calibration.http,
  });

  // Download the data
  const data = await synapse.storage.download(pieceCid);
  
  // If it's an image
  fs.writeFileSync("downloaded.jpg", data);
  console.log("✅ Image saved as downloaded.jpg");
  
  // If it's JSON metadata
  const text = new TextDecoder().decode(data);
  console.log("Content:", text);
}

// Usage:
viewAsset("bafkzcibez3fqmdpkmrpvzhyzo2yrliwsjoulszv6fe2ogl7idjmr4pvow4uwo5mceu");