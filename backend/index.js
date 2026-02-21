import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   RENDER FIX: ENSURE FOLDERS EXIST
   =============================== */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("output")) {
  fs.mkdirSync("output");
}

/* ===============================
   MIDDLEWARE
   =============================== */
app.use(cors());
app.use(express.json());
app.use("/output", express.static("output"));

/* ===============================
   MULTER CONFIG (RENDER SAFE)
   =============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB (Render free tier safe)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files allowed"), false);
    }
  }
});

/* ===============================
   ROUTES
   =============================== */

// Health check (important for Render wake-up)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Upload + Compress
app.post("/upload", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const inputPath = req.file.path;
    const outputFileName = `compressed-${req.file.filename}`;
    const outputPath = path.join("output", outputFileName);

    ffmpeg(inputPath)
      .audioBitrate(64)
      .save(outputPath)
      .on("end", () => {
        res.json({
          message: "Audio compressed successfully",
          file: outputFileName
        });
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).json({ error: "Audio compression failed" });
      });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   SERVER START
   =============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});