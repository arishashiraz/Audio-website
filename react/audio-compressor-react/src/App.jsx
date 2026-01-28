import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("96");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setSize((selected.size / 1024 / 1024).toFixed(2));
    setError("");
  };

  const compressAudio = async () => {
    if (!file) {
      setError("Please upload an audio file");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("audio", file);      // ⚠️ MUST be "audio"
    formData.append("bitrate", bitrate);

    try {
      const response = await fetch(`${API_URL}/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error");
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
      console.error(err);
      setError("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>🎧 Audio Compressor</h2>

      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
      />

      <br /><br />

      <select value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
        <option value="64">64 kbps</option>
        <option value="96">96 kbps</option>
        <option value="128">128 kbps</option>
      </select>

      <br /><br />

      <button onClick={compressAudio} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>

      {error && <p style={{ color: "red" }}>❌ {error}</p>}
      {size && <p>📦 Original size: {size} MB</p>}
    </div>
  );
}

export default App;

