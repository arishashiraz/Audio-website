import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("96k");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState(null);

  // 🔥 IMPORTANT: Backend URL from Vercel env
  const API_URL = import.meta.env.VITE_API_URL;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setOriginalSize((selectedFile.size / (1024 * 1024)).toFixed(2));
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setOriginalSize((droppedFile.size / (1024 * 1024)).toFixed(2));
    setError("");
  };

  const handleCompress = async () => {
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

    } catch (err) {
      setError("Failed to fetch (Backend/CORS issue)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>🎧 Audio Compressor</h1>

      {/* DROP ZONE */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #888",
          padding: "30px",
          margin: "20px auto",
          width: "60%",
          cursor: "pointer",
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {file ? (
          <p>🎵 {file.name}</p>
        ) : (
          <p>Drag & drop audio file here or click to upload</p>
        )}
      </div>

      {/* FILE INPUT (IMPORTANT FOR MOBILE) */}
      <input
        id="fileInput"
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* BITRATE */}
      <br />
      <select value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
        <option value="64k">64 kbps (Very small)</option>
        <option value="96k">96 kbps (Small)</option>
        <option value="128k">128 kbps (Balanced)</option>
        <option value="192k">192 kbps (High quality)</option>
      </select>

      <br /><br />

      {/* BUTTON */}
      <button onClick={handleCompress} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>

      {/* ERROR */}
      {error && <p style={{ color: "red", marginTop: "15px" }}>❌ {error}</p>}

      {/* INFO */}
      {originalSize && (
        <p style={{ marginTop: "10px" }}>
          📦 Original size: {originalSize} MB
        </p>
      )}
    </div>
  );
}

export default App;
