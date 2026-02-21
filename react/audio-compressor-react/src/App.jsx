import { useState } from "react";
import "./index.css";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      alert("Please upload a valid audio file");
    }
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

    } catch (error) {
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
        accept="audio/*"
        onChange={(e) => setAudioFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Compressing..." : "Upload & Compress"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;











