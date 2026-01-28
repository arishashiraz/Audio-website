import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();

/* =========================
   CORS (IMPORTANT)
========================= */
app.use(
  cors({
    origin: "*", // allow all for now (we'll secure later)
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

/* =========================
   FOLDERS
========================= */
const uploadsDir = "uploads";
const outputDir = "output";

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Audio Compressor Backend is running 🚀");
});

/* =========================
   COMPRESS ROUTE
========================= */
app.post("/compress", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const bitrate = req.body.bitrate || "96";

    const inputPath = path.join(uploadsDir, req.file.filename);
    const outputFile = `compressed-${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, outputFile);

    const command = `ffmpeg -i "${inputPath}" -b:a ${bitrate}k "${outputPath}" -y`;

    exec(command, (error) => {
      if (error) {
        console.error("FFmpeg error:", error);
        return res.status(500).json({ error: "Compression failed" });
      }

      res.download(outputPath, outputFile, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
