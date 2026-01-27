import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [bitrate, setBitrate] = useState("96k");

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

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("bitrate", bitrate);

    try {
      const response = await fetch("http://localhost:5000/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Compression failed. Try again.");
      }

      const blob = await response.blob();
      setCompressedSize((blob.size / 1024 / 1024).toFixed(2));

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.mp3";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("🎉 Audio compressed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontFamily: "sans-serif",
      }}
    >
      <h2>🎧 Audio Compressor</h2>

      <div
        style={{
          border: "2px dashed #555",
          padding: "40px",
          width: "320px",
          textAlign: "center",
          borderRadius: "8px",
          background: "#fafafa",
        }}
      >
        {file ? `🎵 ${file.name}` : "Drag & drop audio file here"}
      </div>

      <select
        value={bitrate}
        onChange={(e) => setBitrate(e.target.value)}
        style={{ padding: "8px" }}
      >
        <option value="96k">96 kbps (Smaller size)</option>
        <option value="128k">128 kbps (Balanced)</option>
        <option value="192k">192 kbps (Better quality)</option>
      </select>

      <button onClick={compressAudio} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>

      {loading && <div>⏳ Compressing audio...</div>}
      {error && <div style={{ color: "red" }}>❌ {error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      {originalSize && <div>📦 Original size: {originalSize} MB</div>}
      {compressedSize && <div>🗜️ Compressed size: {compressedSize} MB</div>}
    </div>
  );
}

export default App;

