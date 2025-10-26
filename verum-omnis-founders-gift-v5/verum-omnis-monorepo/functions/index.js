import functions from "firebase-functions";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({limit:"5mb"}));

app.get("/health", (_req, res) => res.status(200).send("OK"));
app.post("/echo-hash", (req, res) => {
  const { sha512 } = req.body || {};
  if (!sha512) return res.status(400).json({error:"sha512 required"});
  return res.json({received:true, sha512});
});

export const api = functions.region("us-central1").https.onRequest(app);
