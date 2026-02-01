import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("96");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleCompress = async () => {
    setError("");

    if (!file) {
      setError("No file selected");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("bitrate", bitrate);

      const response = await fetch(`${API_URL}/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      // We are NOT handling response yet
      // This step is only for API_URL verification
      console.log("Request sent successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
      {/* 🔴 DEBUG BLOCK – MUST APPEAR */}
      <div
        style={{
          background: "#ffecec",
          border: "1px solid red",
          padding: "10px",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        <b>DEBUG (remove later)</b>
        <br />
        API_URL = <b>{String(API_URL)}</b>
      </div>

      <h1>🎧 Audio Compressor</h1>

      <div
        style={{
          border: "2px dashed #999",
          padding: "30px",
          marginBottom: "20px",
        }}
      >
        Drag & drop audio file here
        <br />
        <br />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <select
        value={bitrate}
        onChange={(e) => setBitrate(e.target.value)}
        style={{ padding: "5px", marginBottom: "20px" }}
      >
        <option value="64">64 kbps (Very small)</option>
        <option value="96">96 kbps (Smaller size)</option>
        <option value="128">128 kbps (Balanced)</option>
        <option value="192">192 kbps (High quality)</option>
      </select>

      <br />

      <button onClick={handleCompress} style={{ padding: "8px 20px" }}>
        Compress Audio
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "15px" }}>❌ {error}</p>
      )}
    </div>
  );
}

export default App;








