import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";
import pool from "../db.js";

ffmpeg.setFfmpegPath(ffmpegPath);

// ===============================
// UPLOAD + COMPRESS + SAVE TO DB
// ===============================
export const compressAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const inputPath = req.file.path;
    const originalFilename = req.file.originalname;
    const originalFormat = path.extname(originalFilename);

    const compressedFilename = `compressed-${Date.now()}.mp3`;
    const outputPath = path.join("compressed", compressedFilename);

    ffmpeg(inputPath)
      .audioBitrate("64k")
      .save(outputPath)
      .on("end", async () => {
        try {
          const originalSize = fs.statSync(inputPath).size;
          const compressedSize = fs.statSync(outputPath).size;
          console.log("📥 Inserting into DB...");
          console.log({
             originalFilename,
             compressedFilename,
             originalFormat,
             originalSize,
             compressedSize,
          });

          const result = await pool.query(
            `INSERT INTO audio_files 
             (original_filename, compressed_filename, original_format, original_size, compressed_size)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
              originalFilename,
              compressedFilename,
              originalFormat,
              originalSize,
              compressedSize,
            ]
          );

          return res.json({
            message: "Audio compressed successfully",
            fileId: result.rows[0].id,
            originalSize,
            compressedSize,
          });
        } catch (dbErr) {
          console.error("DB insert error:", dbErr);
          return res.status(500).json({ error: "Database insert failed" });
        }
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        return res.status(500).json({ error: "Audio compression failed" });
      });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ===============================
// DOWNLOAD BY FILE ID
// ===============================
export const downloadAudio = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT compressed_filename FROM audio_files WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(
      process.cwd(),
      "compressed",
      result.rows[0].compressed_filename
    );

    return res.download(filePath);
  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).json({ error: "Download failed" });
  }
};