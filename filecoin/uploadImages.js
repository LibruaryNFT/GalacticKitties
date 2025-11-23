import { Synapse, RPC_URLS, TIME_CONSTANTS } from "@filoz/synapse-sdk";
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (project root)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function uploadImages() {
  const synapse = await Synapse.create({
    privateKey: process.env.BASE_SEPOLIA_PRIVATE_KEY,
    rpcURL: RPC_URLS.calibration.http,
  });

  // Deposit if not already done
  const depositAmount = ethers.parseUnits("2.5", 18);
  const tx = await synapse.payments.depositWithPermitAndApproveOperator(
    depositAmount,
    synapse.getWarmStorageAddress(),
    ethers.MaxUint256,
    ethers.MaxUint256,
    TIME_CONSTANTS.EPOCHS_PER_MONTH,
  );
  await tx.wait();
  console.log("✅ Payment setup complete");

  // Upload each image
  // Load existing CIDs if file exists
  let imageCids = {};
  if (fs.existsSync("image-cids.json")) {
    imageCids = JSON.parse(fs.readFileSync("image-cids.json", "utf8"));
    console.log("📁 Loaded existing image CIDs");
  }

  // Upload images 4-15 (1-3 already uploaded)
  for (let i = 4; i <= 15; i++) {
    const imagePath = `${i}.jpg`;
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  Skipping ${imagePath} - file not found`);
      continue;
    }
    const imageData = fs.readFileSync(imagePath);
    const { pieceCid } = await synapse.storage.upload(imageData);
    imageCids[i] = { "/": pieceCid };
    console.log(`✅ Uploaded ${imagePath} -> ${pieceCid}`);
  }

  // Save CIDs
  fs.writeFileSync("image-cids.json", JSON.stringify(imageCids, null, 2));
  console.log("\n✅ All images uploaded to Filecoin Cloud!");
}

uploadImages();