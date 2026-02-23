import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import pkg from "pg";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

ffmpeg.setFfmpegPath(ffmpegPath);

// folders
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("compressed")) fs.mkdirSync("compressed");

// 🔑 DATABASE (NO SSL LOCALLY)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// 🔥 force DB connect
(async () => {
  try {
    const r = await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");
  } catch (e) {
    console.error("❌ DB error:", e.message);
  }
})();

// multer
const upload = multer({ dest: "uploads/" });

// health check
app.get("/", (req, res) => {
  res.send("Backend OK");
});

// upload + compress
app.post("/api/audio/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file" });
  }

  const inputPath = req.file.path;
  const outputName = `compressed-${Date.now()}.mp3`;
  const outputPath = path.join("compressed", outputName);

  ffmpeg(inputPath)
    .audioBitrate("64k")
    .save(outputPath)
    .on("end", async () => {
      try {
        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;

        const result = await pool.query(
          `INSERT INTO audio_files
           (original_filename, compressed_filename, original_size, compressed_size)
           VALUES ($1,$2,$3,$4)
           RETURNING id`,
          [req.file.originalname, outputName, originalSize, compressedSize]
        );

        console.log("✅ DB row inserted:", result.rows[0].id);

        res.json({
          fileId: result.rows[0].id,
          compressedSize,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB insert failed" });
      }
    })
    .on("error", () => {
      res.status(500).json({ error: "FFmpeg failed" });
    });
});

// download
app.get("/api/audio/download/:id", async (req, res) => {
  const r = await pool.query(
    "SELECT compressed_filename FROM audio_files WHERE id=$1",
    [req.params.id]
  );

  if (!r.rows.length) return res.sendStatus(404);

  res.download(path.join("compressed", r.rows[0].compressed_filename));
});

// ⚠️ FIXED PORT
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});