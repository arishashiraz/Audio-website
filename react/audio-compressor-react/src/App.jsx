import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an audio file");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch(`${API_URL}/api/audio/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🎧 Audio Compressor</h1>

      {/* DRAG & DROP */}
      <div
        style={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setFile(e.dataTransfer.files[0]);
        }}
      >
        {file ? file.name : "Drag & drop audio file here"}
      </div>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Compressing..." : "Upload & Compress"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.result}>
          <p><b>File ID:</b> {result.fileId}</p>
          <p>
            <b>Original Size:</b>{" "}
            {(result.originalSize / 1024).toFixed(2)} KB
          </p>
          <p>
            <b>Compressed Size:</b>{" "}
            {(result.compressedSize / 1024).toFixed(2)} KB
          </p>

          <a
            href={`${API_URL}/api/audio/download/${result.fileId}`}
            target="_blank"
          >
            <button>⬇️ Download</button>
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "450px",
    margin: "60px auto",
    textAlign: "center",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    fontFamily: "Arial",
  },
  dropZone: {
    padding: "30px",
    border: "2px dashed #666",
    borderRadius: "8px",
    marginBottom: "15px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default App;







