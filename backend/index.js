import express from "express";
import cors from "cors";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Audio Compressor Backend Running");
});

app.post("/compress", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const bitrate = req.body.bitrate || "128k";

  const inputPath = req.file.path;
  const outputPath = `output/compressed-${Date.now()}.mp3`;

  ffmpeg(inputPath)
    .audioBitrate(bitrate)
    .toFormat("mp3")
    .on("end", () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Compression failed" });
    })
    .save(outputPath);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
