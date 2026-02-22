import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import pkg from "pg";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= POSTGRES ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render")
    ? { rejectUnauthorized: false }
    : false
});

/* ================= FOLDERS ================= */
["uploads", "output"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use("/output", express.static("output"));

/* ================= MULTER ================= */
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads",
    filename: (_, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname)
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) =>
    file.mimetype.startsWith("audio/")
      ? cb(null, true)
      : cb(new Error("Invalid audio file"))
});

/* ================= ROUTES ================= */

app.get("/", (_, res) => {
  res.send("Backend running 🚀");
});

app.post("/upload", upload.single("audio"), async (req, res) => {
  let responded = false;
  const respondOnce = (status, data) => {
    if (!responded) {
      responded = true;
      res.status(status).json(data);
    }
  };

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const outputFile = `compressed-${Date.now()}${ext}`;
    const outputPath = path.join("output", outputFile);

    let command = ffmpeg(req.file.path);

    // FORMAT-AWARE COMPRESSION
    if (ext === ".wav") {
      command.audioChannels(1).audioFrequency(22050);
    } else {
      command.audioBitrate("64k").outputOptions("-vn");
    }

    command
      .on("end", async () => {
        await pool.query(
          `INSERT INTO audio_files (original_name, compressed_name, original_size)
           VALUES ($1, $2, $3)`,
          [req.file.originalname, outputFile, req.file.size]
        );

        respondOnce(200, { file: outputFile });
      })
      .on("error", err => {
        console.error(err);
        respondOnce(500, { error: "Compression failed" });
      })
      .save(outputPath);

    // SAFETY TIMEOUT (NO HANGING)
    setTimeout(() => {
      respondOnce(500, { error: "Compression timeout" });
    }, 30000);

  } catch (err) {
    console.error(err);
    respondOnce(500, { error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});