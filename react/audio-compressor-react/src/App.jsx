import { useState, useEffect } from "react";

// 🔴 STEP 1: READ ENV VARIABLE
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  // 🔴 STEP 1: LOG API URL ON PAGE LOAD
  useEffect(() => {
    console.log("API_URL =", API_URL);
  }, []);

  const handleCompress = async () => {
    setError("");

    if (!file) {
      setError("No file selected");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch(`${API_URL}/compress`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>🎧 Audio Compressor</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleCompress}>
        Compress Audio
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}

export default App;




