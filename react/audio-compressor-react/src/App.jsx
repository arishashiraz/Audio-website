import { useState } from "react";
import UploadBox from "./components/UploadBox";
import Controls from "./components/Controls";

function App() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState("128k");
  const [format, setFormat] = useState("mp3");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleCompress = async () => {
    if (!file) {
      setError("Please upload an audio file");
      return;
    }

    setError("");
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("bitrate", bitrate);
    formData.append("format", format);

    try {
      const response = await fetch(`${API_URL}/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Compression failed");
      }

      const text = await response.text();
      setStatus(`Server response: ${text}`);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
      setStatus("");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>Audio Compressor</h1>

      <UploadBox onFileSelect={setFile} />

      {file && (
        <div style={{ marginTop: "20px" }}>
          <p><b>File name:</b> {file.name}</p>
          <p><b>File size:</b> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <Controls
        bitrate={bitrate}
        setBitrate={setBitrate}
        format={format}
        setFormat={setFormat}
      />

      <button
        onClick={handleCompress}
        style={{ marginTop: "30px", padding: "10px 20px" }}
      >
        Compress Audio
      </button>

      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;














