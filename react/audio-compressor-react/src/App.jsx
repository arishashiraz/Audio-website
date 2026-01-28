import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("96k");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [originalSize, setOriginalSize] = useState(null);

  /* ================= FILE HANDLERS ================= */

  const handleFileSelect = (f) => {
    if (!f) return;

    if (!f.type.startsWith("audio/")) {
      setError("Please select an audio file");
      return;
    }

    setError("");
    setSuccess("");
    setFile(f);
    setOriginalSize((f.size / (1024 * 1024)).toFixed(2));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => e.preventDefault();

  /* ================= COMPRESS ================= */

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
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setSuccess("Compression successful! File downloaded.");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch / compress audio");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="app">
      <h1>🎧 Audio Compressor</h1>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {file ? (
          <p>🎵 {file.name}</p>
        ) : (
          <p>Drag & drop audio here or click to upload</p>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => handleFileSelect(e.target.files[0])}
      />

      <select value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
        <option value="64k">64 kbps (Very small)</option>
        <option value="96k">96 kbps (Smaller size)</option>
        <option value="128k">128 kbps (Balanced)</option>
        <option value="192k">192 kbps (High quality)</option>
      </select>

      <button onClick={compressAudio} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>

      {error && <p className="error">❌ {error}</p>}
      {success && <p className="success">✅ {success}</p>}

      {originalSize && (
        <p className="info">📦 Original size: {originalSize} MB</p>
      )}
    </div>
  );
}

export default App;
