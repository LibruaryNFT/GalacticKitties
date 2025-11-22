// Simple Filecoin proxy server for Railway deployment
import express from "express";
import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import cors from "cors";
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

// Initialize Synapse (lazy load)
let synapse = null;
async function getSynapse() {
  if (!synapse) {
    synapse = await Synapse.create({
      privateKey: process.env.PRIVATE_KEY || process.env.BASE_SEPOLIA_PRIVATE_KEY,
      rpcURL: RPC_URLS.calibration.http,
    });
  }
  return synapse;
}

// Simple cache to reduce costs
const cache = new Map();

// Serve metadata
app.get("/metadata/:pieceCid", async (req, res) => {
  const { pieceCid } = req.params;
  
  // Check cache
  if (cache.has(`meta:${pieceCid}`)) {
    const cached = cache.get(`meta:${pieceCid}`);
    res.json(cached);
    return;
  }
  
  try {
    const s = await getSynapse();
    const data = await s.storage.download(pieceCid);
    const json = JSON.parse(new TextDecoder().decode(data));
    
    // Cache it
    cache.set(`meta:${pieceCid}`, json);
    
    res.json(json);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve images
app.get("/image/:pieceCid", async (req, res) => {
  const { pieceCid } = req.params;
  
  // Check cache
  if (cache.has(`img:${pieceCid}`)) {
    const cached = cache.get(`img:${pieceCid}`);
    res.setHeader('Content-Type', cached.type);
    res.send(cached.data);
    return;
  }
  
  try {
    const s = await getSynapse();
    const data = await s.storage.download(pieceCid);
    
    // Detect image type
    let contentType = 'image/jpeg';
    if (data[0] === 0x89 && data[1] === 0x50) contentType = 'image/png';
    
    // Cache it
    cache.set(`img:${pieceCid}`, { type: contentType, data: Buffer.from(data) });
    
    res.setHeader("Content-Type", contentType);
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

