import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("96");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file select (click OR drop)
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/")) {
      setError("Please upload an audio file only");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  // Drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Click upload (mobile friendly)
  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  // Compress
  const handleCompress = async () => {
    if (!file) {
      setError("Please select an audio file first");
      return;
    }

    setLoading(true);
    setError("");

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
      a.download = "compressed.mp3";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎧 Audio Compressor</h1>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Drag & drop audio here or click to upload</p>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        accept="audio/*"
        hidden
        onChange={handleInputChange}
      />

      <select value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
        <option value="64">64 kbps (Very Small)</option>
        <option value="96">96 kbps (Small)</option>
        <option value="128">128 kbps (Balanced)</option>
        <option value="192">192 kbps (High Quality)</option>
      </select>

      <button onClick={handleCompress} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>

      {loading && <p className="loading">⏳ Processing… please wait</p>}
      {error && <p className="error">❌ {error}</p>}
    </div>
  );
}

export default App;
