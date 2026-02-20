import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("128k");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  console.log(import.meta.env.VITE_API_URL);
  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile || !droppedFile.type.startsWith("audio/")) {
      setError("Please drop a valid audio file");
      return;
    }

    setFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle file picker
  const handleFileChange = (e) => {
    setError("");
    setSuccess("");
    setFile(e.target.files[0]);
  };

  // Send file to backend & download compressed audio
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

      // Convert response to downloadable file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed-audio.mp3";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("Audio compressed successfully!");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎧 Audio Compressor</h1>

      <div
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag & drop an audio file here</p>
        <p>or</p>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
      </div>

      {file && (
        <div className="file-info">
          <p>
            <b>File name:</b> {file.name}
          </p>
          <p>
            <b>File size:</b>{" "}
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      <div className="controls">
        <label>
          Bitrate:
          <select
            value={bitrate}
            onChange={(e) => setBitrate(e.target.value)}
          >
            <option value="64k">64 kbps (Very small)</option>
            <option value="96k">96 kbps (Small)</option>
            <option value="128k">128 kbps (Balanced)</option>
            <option value="192k">192 kbps (High quality)</option>
          </select>
        </label>
      </div>

      <button onClick={compressAudio} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default App;












