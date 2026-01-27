const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());

// Store uploaded files in uploads/
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Audio compression endpoint
app.post("/compress", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const inputPath = req.file.path;
  const outputFileName = `compressed-${Date.now()}.mp3`;
  const outputPath = path.join("output", outputFileName);

  const bitrate = req.body.bitrate || "96k";
  const command = `ffmpeg -y -i ${inputPath} -b:a ${bitrate} ${outputPath}`;

  exec(command, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Compression failed" });
    }

    res.download(outputPath, outputFileName, () => {
      console.log("Compressed audio sent");
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


