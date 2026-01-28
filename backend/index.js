import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

/* =========================
   CORS (FIXED FOR FILE UPLOAD)
========================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  })
);

app.options("*", cors());

/* =========================
   DATABASE (NEON)
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* =========================
   MULTER (UPLOAD)
========================= */
const upload = multer({ dest: "uploads/" });

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Audio Compressor Backend is running 🚀");
});

/* =========================
   COMPRESS API
========================= */
app.post("/compress", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const bitrate = req.body.bitrate || "96";
    const inputPath = req.file.path;
    const outputPath = `compressed-${Date.now()}.mp3`;

    const command = `ffmpeg -y -i "${inputPath}" -ab ${bitrate}k "${outputPath}"`;

    exec(command, async (err) => {
      if (err) {
        console.error("FFMPEG ERROR:", err);
        return res.status(500).json({ error: "Compression failed" });
      }

      // Save metadata to DB
      await pool.query(
        `INSERT INTO compress_logs (filename, bitrate, size)
         VALUES ($1, $2, $3)`,
        [req.file.originalname, bitrate, req.file.size]
      );

      res.download(outputPath, (err) => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
