import { Synapse, RPC_URLS, TIME_CONSTANTS } from "@filoz/synapse-sdk";
import { ethers } from "ethers";
import fs from "fs";

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
  const imageCids = {};

  for (let i = 1; i <= 3; i++) {
    const imageData = fs.readFileSync(`${i}.jpg`);
    const { pieceCid } = await synapse.storage.upload(imageData);
    imageCids[i] = pieceCid;
    console.log(`✅ Uploaded ${i}.jpg -> ${pieceCid}`);
  }

  // Save CIDs
  fs.writeFileSync("image-cids.json", JSON.stringify(imageCids, null, 2));
  console.log("\n✅ All images uploaded to Filecoin Cloud!");
}

uploadImages();