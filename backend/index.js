import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("output")) {
  fs.mkdirSync("output");
}

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ---------- MULTER CONFIG ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  }
});
app.use("/output", express.static("output"));
app.use(cors());
app.use(express.json());

// 🔥 THIS LINE ENABLES DOWNLOAD LINKS
app.use("/output", express.static("output"));

// ---------- TEST ROUTE ----------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ---------- AUDIO UPLOAD + COMPRESSION ----------
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
        console.error(err);
        res.status(500).json({ error: "Audio compression failed" });
      });

  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---------- SERVER START ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});