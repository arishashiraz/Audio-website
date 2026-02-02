import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   MULTER SETUP
========================= */
const upload = multer({
  dest: "uploads/",
});

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

/* =========================
   COMPRESS ROUTE (TEST VERSION)
   RETURNS SAME FILE AS DOWNLOAD
========================= */
app.post("/compress", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const originalName = req.file.originalname;
    const filePath = req.file.path;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="compressed-${originalName}"`
    );

    res.setHeader("Content-Type", req.file.mimetype);

    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error(err);
      }

      // optional cleanup
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Compression failed");
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

