import express from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { Pool } from "pg";
import cors from "cors";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const upload = multer({ dest: "uploads/" });

app.post("/compress", upload.single("audio"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const ext = path.extname(req.file.originalname);
    const outputName = `compressed-${Date.now()}${ext}`;
    const outputPath = `compressed/${outputName}`;

    ffmpeg(inputPath)
      .audioBitrate(64)
      .save(outputPath)
      .on("end", async () => {
        await pool.query(
          `INSERT INTO audio_files 
           (original_filename, compressed_filename, original_format, compressed_size)
           VALUES ($1,$2,$3,$4)`,
          [
            req.file.originalname,
            outputName,
            ext,
            fs.statSync(outputPath).size
          ]
        );

        res.download(outputPath, outputName);
      });

  } catch (err) {
    console.error(err);
    res.status(500).send("Compression failed");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});