import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [bitrate, setBitrate] = useState("96k");

  // 🔴 API URL (from Vercel / Vite env)
  const API_URL = import.meta.env.VITE_API_URL;

  const handleDrop = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile && droppedFile.type.startsWith("audio/")) {
      setFile(droppedFile);
      setOriginalSize((droppedFile.size / 1024 / 1024).toFixed(2));
      setCompressedSize(null);
    } else {
      setError("Please drop a valid audio file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const compressAudio = async () => {
    if (!file) {
      setError("No audio file selected");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("bitrate", bitrate);

      const response = await fetch(`${API_URL}/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Compression failed");
      }

      const blob = await response.blob();
      setCompressedSize((blob.size / 1024 / 1024).toFixed(2));

      setSuccess("Audio compressed successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
      {/* 🔴 DEBUG – REMOVE LATER */}
<div
  style={{
    background: "#ffecec",
    border: "1px solid red",
    padding: "10px",
    marginBottom: "20px",
    textAlign: "left",
  }}
>
  <b>DEBUG</b><br />
  API_URL = {String(API_URL)}
</div>

      {/* 🔴 DEBUG BLOCK – REMOVE LATER */}
      <div
        style={{
          background: "#ffecec",
          border: "1px solid red",
          padding: "10px",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        <b>DEBUG</b>
        <br />
        API_URL = <b>{String(API_URL)}</b>
      </div>

      <h1>🎧 Audio Compressor</h1>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #999",
          padding: "30px",
          marginBottom: "20px",
        }}
      >
        {file ? file.name : "Drag & drop audio file here"}
      </div>

      <select
        value={bitrate}
        onChange={(e) => setBitrate(e.target.value)}
        style={{ padding: "6px", marginBottom: "15px" }}
      >
        <option value="64k">64 kbps (Very small)</option>
        <option value="96k">96 kbps (Smaller size)</option>
        <option value="128k">128 kbps (Balanced)</option>
        <option value="192k">192 kbps (High quality)</option>
      </select>

      <br />

      <button onClick={compressAudio} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>

      {originalSize && (
        <p>📦 Original size: {originalSize} MB</p>
      )}

      {compressedSize && (
        <p>📉 Compressed size: {compressedSize} MB</p>
      )}

      {error && (
        <p style={{ color: "red" }}>❌ {error}</p>
      )}

      {success && (
        <p style={{ color: "green" }}>✅ {success}</p>
      )}
    </div>
  );
}

export default App;










