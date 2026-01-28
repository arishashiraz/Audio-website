import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("96");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  /* =========================
     FILE SELECT / DROP
  ========================= */
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setOriginalSize((selectedFile.size / (1024 * 1024)).toFixed(2));
  };

  /* =========================
     DRAG & DROP
  ========================= */
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  /* =========================
     COMPRESS
  ========================= */
  const compressAudio = async () => {
    if (!file) {
      setError("Please upload an audio file");
      return;
    }

    try {
      setLoading(true);
      setError("");

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
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>🎧 Audio Compressor</h1>

      {/* DROP ZONE */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #555",
          padding: "30px",
          width: "400px",
          margin: "20px auto",
          cursor: "pointer",
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {file ? (
          <p>🎵 {file.name}</p>
        ) : (
          <p>Drag & drop audio file here or click</p>
        )}
      </div>

      {/* FILE INPUT (IMPORTANT FOR MOBILE) */}
      <input
        id="fileInput"
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* BITRATE */}
      <div>
        <select value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
          <option value="64">64 kbps (Smallest)</option>
          <option value="96">96 kbps (Smaller)</option>
          <option value="128">128 kbps (Balanced)</option>
          <option value="192">192 kbps (High)</option>
        </select>
      </div>

      {/* BUTTON */}
      <div style={{ marginTop: "15px" }}>
        <button onClick={compressAudio} disabled={loading}>
          {loading ? "Compressing..." : "Compress Audio"}
        </button>
      </div>

      {/* INFO */}
      {originalSize && (
        <p>📦 Original size: {originalSize} MB</p>
      )}

      {/* ERROR */}
      {error && (
        <p style={{ color: "red" }}>❌ {error}</p>
      )}
    </div>
  );
}

export default App;
