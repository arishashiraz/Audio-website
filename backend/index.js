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

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const Audio = mongoose.model(
  "Audio",
  new mongoose.Schema({
    originalName: String,
    compressedName: String,
    originalSize: Number,
    createdAt: { type: Date, default: Date.now }
  })
);

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
      : cb(new Error("Invalid audio"))
});

/* ================= ROUTES ================= */
app.get("/", (_, res) => res.send("Backend running 🚀"));

app.post("/upload", upload.single("audio"), async (req, res) => {
  const ext = path.extname(req.file.originalname).toLowerCase();
  const outputFile = `compressed-${Date.now()}${ext}`;
  const outputPath = path.join("output", outputFile);

  let responded = false;
  const respondOnce = (status, data) => {
    if (!responded) {
      responded = true;
      res.status(status).json(data);
    }
  };

  try {
    let cmd = ffmpeg(req.file.path);

    // FORMAT-AWARE COMPRESSION
    if (ext === ".wav") {
      cmd.audioChannels(1).audioFrequency(22050);
    } else {
      cmd.audioBitrate("64k").outputOptions("-vn");
    }

    cmd
      .on("end", async () => {
        await Audio.create({
          originalName: req.file.originalname,
          compressedName: outputFile,
          originalSize: req.file.size
        });
        respondOnce(200, { file: outputFile });
      })
      .on("error", err => {
        console.error(err);
        respondOnce(500, { error: "Compression failed" });
      })
      .save(outputPath);

    // SAFETY TIMEOUT
    setTimeout(() => {
      respondOnce(500, { error: "Compression timeout" });
    }, 30000);

  } catch (err) {
    console.error(err);
    respondOnce(500, { error: "Server error" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);