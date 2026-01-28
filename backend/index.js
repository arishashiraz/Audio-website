const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: "*", // later we will restrict this
    methods: ["GET", "POST"],
  })
);

/* ===================== FOLDERS ===================== */
const uploadDir = "uploads";
const outputDir = "output";

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

/* ===================== MULTER ===================== */
const upload = multer({ dest: uploadDir });

/* ===================== TEST ROUTE ===================== */
app.get("/", (req, res) => {
  res.send("Audio Compressor Backend is running 🚀");
});

/* ===================== COMPRESS ROUTE ===================== */
app.post("/compress", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const bitrate = req.body.bitrate || "96k";

  const inputPath = req.file.path;
  const outputPath = path.join(
    outputDir,
    `compressed-${Date.now()}.mp3`
  );

  const command = `ffmpeg -i ${inputPath} -b:a ${bitrate} ${outputPath}`;

  exec(command, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Compression failed" });
    }

    res.download(outputPath, () => {
      fs.unlinkSync(inputPath);
    });
  });
});

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
