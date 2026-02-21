import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import mongoose from "mongoose";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   DATABASE CONNECTION
   =============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const AudioSchema = new mongoose.Schema({
  originalName: String,
  compressedName: String,
  originalSize: Number,
  createdAt: { type: Date, default: Date.now },
});

const Audio = mongoose.model("Audio", AudioSchema);

/* ===============================
   ENSURE FOLDERS (Render-safe)
   =============================== */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("output")) fs.mkdirSync("output");

/* ===============================
   MIDDLEWARE
   =============================== */
app.use(cors());
app.use(express.json());
app.use("/output", express.static("output"));

/* ===============================
   MULTER CONFIG (ALL AUDIO TYPES)
   =============================== */
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files allowed"));
    }
  },
});

/* ===============================
   ROUTES
   =============================== */

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Upload + Compress (FORMAT PRESERVED)
app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Preserve original extension
    const ext = path.extname(req.file.originalname);
    const outputFileName = `compressed-${Date.now()}${ext}`;
    const outputPath = path.join("output", outputFileName);

    ffmpeg(req.file.path)
      .audioBitrate(64) // compression
      .save(outputPath)
      .on("end", async () => {
        await Audio.create({
          originalName: req.file.originalname,
          compressedName: outputFileName,
          originalSize: req.file.size,
        });

        res.json({
          message: "Audio compressed successfully",
          file: outputFileName,
        });
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).json({ error: "Compression failed" });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Optional: history API
app.get("/history", async (req, res) => {
  const history = await Audio.find().sort({ createdAt: -1 });
  res.json(history);
});

/* ===============================
   SERVER START
   =============================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});