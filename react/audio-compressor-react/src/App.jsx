import { useState } from "react";
import "./index.css";

const allowedExtensions = [
  ".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".opus"
];

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isValidAudio = (file) => {
    const ext = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    return allowedExtensions.includes(ext);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!isValidAudio(file)) {
      alert("Unsupported audio format");
      return;
    }

    setAudioFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isValidAudio(file)) {
      alert("Unsupported audio format");
      return;
    }

    setAudioFile(file);
  };

  const handleUpload = async () => {
    if (!audioFile) {
      alert("Please select an audio file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      setLoading(true);
      setMessage("Compressing audio… ⏳");

      const response = await fetch(
        "https://audio-compressor-backend.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage("Compression failed ❌");
        return;
      }

      setMessage("Download starting… ✅");

      // ✅ RELIABLE AUTO DOWNLOAD
      window.location.href =
        `https://audio-compressor-backend.onrender.com/output/${data.file}`;

    } catch (err) {
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>🎵 Audio Compressor</h2>

      <div
        className="drop-box"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {audioFile ? (
          <p>📂 {audioFile.name}</p>
        ) : (
          <p>Drag & Drop Audio File Here</p>
        )}
      </div>

      <input
        type="file"
        accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,.opus"
        onChange={handleFileSelect}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Compressing..." : "Upload & Compress"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;










