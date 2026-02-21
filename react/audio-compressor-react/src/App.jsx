import { useState } from "react";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadFile, setDownloadFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!audioFile) {
      alert("Please select an audio file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("https://audio-compressor-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setDownloadFile(data.file);
        setMessage("Audio compressed successfully ✅");
      } else {
        setMessage("Compression failed ❌");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>🎵 Audio Compressor</h2>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudioFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Compressing..." : "Upload & Compress"}
      </button>

      <br /><br />

      {message && <p>{message}</p>}

      {downloadFile && (
        <a
         href={`https://audio-compressor-backend.onrender.com/output/${downloadFile}`}
        >
          ⬇️ Download Compressed Audio
        </a>
      )}
    </div>
  );
}

export default App;












