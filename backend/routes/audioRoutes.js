import express from "express";
import multer from "multer";
import {
  compressAudio,
  downloadAudio,
} from "../controllers/audioController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("audio"), compressAudio);
router.get("/download/:id", downloadAudio);

export default router;