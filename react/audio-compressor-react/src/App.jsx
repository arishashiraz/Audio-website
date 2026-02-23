import { useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setStatus("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const compressAudio = async () => {
    if (!file) return;

    setLoading(true);
    setStatus("Compressing audio... ⏳");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch(
        "https://audio-compressor-backend.onrender.com/compress",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Server error");

      const blob = await res.blob();

      // 🔽 AUTO DOWNLOAD
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name; // same format
      document.body.appendChild(a);
      a.click();
      a.remove();

      setStatus("Audio compressed & downloaded ✅");
    } catch (err) {
      console.error(err);
      setStatus("Compression failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎵 Audio Compressor</h1>

      <div
        className="drop-box"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        {file ? (
          <p>📁 {file.name}</p>
        ) : (
          <p>Drag & drop audio here or click to choose</p>
        )}
      </div>

      <input
        type="file"
        ref={inputRef}
        hidden
        accept="audio/*"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <button onClick={compressAudio} disabled={loading || !file}>
        {loading ? "Compressing..." : "Upload & Compress"}
      </button>

      {status && <p className="status">{status}</p>}
    </div>
  );
}








