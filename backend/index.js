import express from "express";
import cors from "cors";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Tell ffmpeg where the binary is
ffmpeg.setFfmpegPath(ffmpegPath);

// Ensure folders exist
const uploadDir = "uploads";
const outputDir = "output";

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Multer storage
const upload = multer({ dest: uploadDir });

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Audio Compressor Backend Running");
});

// 🔊 AUDIO COMPRESSION ROUTE
app.post("/compress", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No audio file uploaded");
    }

    const bitrate = req.body.bitrate || "128k";

    const inputPath = req.file.path;
    const outputFileName = `compressed-${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, outputFileName);

    ffmpeg(inputPath)
      .audioBitrate(bitrate)
      .toFormat("mp3")
      .on("end", () => {
        res.download(outputPath, outputFileName, () => {
          fs.unlinkSync(inputPath);      // delete upload
          fs.unlinkSync(outputPath);     // delete output
        });
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).send("Audio compression failed");
      })
      .save(outputPath);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
