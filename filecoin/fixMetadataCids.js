import fs from "fs";

// Fix nested "/" keys in metadata-cids.json
const metadataCids = JSON.parse(fs.readFileSync("metadata-cids.json", "utf8"));

let fixed = false;
for (const [key, value] of Object.entries(metadataCids)) {
  if (value && typeof value === 'object' && value["/"] && typeof value["/"] === 'object' && value["/"]["/"]) {
    // Has nested structure, fix it
    metadataCids[key] = { "/": value["/"]["/"] };
    fixed = true;
    console.log(`Fixed token ${key}: ${value["/"]["/"]}`);
  }
}

if (fixed) {
  fs.writeFileSync("metadata-cids.json", JSON.stringify(metadataCids, null, 2));
  console.log("\n✅ Fixed metadata-cids.json structure!");
} else {
  console.log("✅ No fixes needed - structure is correct");
}

