import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const app = express();

/* =========================
   ✅ STEP 3: CORS (FIX)
========================= */
app.use(
  cors({
    origin: "*", // allow all origins (safe for now)
    methods: ["GET", "POST"],
  })
);

/* =========================
   Basic middleware
========================= */
app.use(express.json());

/* =========================
   File upload setup
========================= */
const uploadDir = "uploads";
const outputDir = "output";

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* =========================
   Health check route
========================= */
app.get("/", (req, res) => {
  res.send("Audio Compressor Backend is running 🚀");
});

/* =========================
   ✅ /compress ROUTE
========================= */
app.post("/compress", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const bitrate = req.body.bitrate || "96k";

    const inputPath = path.join(uploadDir, req.file.filename);
    const outputFileName = `compressed-${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, outputFileName);

    const command = `ffmpeg -i "${inputPath}" -b:a ${bitrate} "${outputPath}"`;

    exec(command, (error) => {
      if (error) {
        console.error("FFmpeg error:", error);
        return res.status(500).json({ error: "Compression failed" });
      }

      res.download(outputPath, () => {
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
   Render PORT config
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
