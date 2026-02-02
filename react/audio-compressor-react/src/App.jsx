import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseText, setResponseText] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const compressAudio = async () => {
    console.log("Compress button clicked");

    if (!file) {
      setError("No file selected");
      return;
    }

    setLoading(true);
    setError("");
    setResponseText("");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch(`${API_URL}/compress`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      console.log("API response:", text);
      setResponseText(text);
    } catch (err) {
      console.error(err);
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "red" }}>DEBUG: APP.JSX ACTIVE</h1>
      <h2 style={{ color: "blue" }}>API_URL = {API_URL}</h2>

      <hr />

      <h2>🎧 Audio Compressor</h2>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={compressAudio} disabled={loading}>
        {loading ? "Uploading..." : "Compress Audio"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {responseText && (
        <p style={{ color: "green" }}>Server response: {responseText}</p>
      )}
    </div>
  );
}

export default App;











