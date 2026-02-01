import { useState, useEffect } from "react";

function App() {
  const [file, setFile] = useState(null);

  // 🚨 FORCE DEBUG (CANNOT BE HIDDEN)
  useEffect(() => {
    alert("APP.JSX IS RUNNING");
    console.log("APP.JSX IS RUNNING");
    console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      {/* 🚨 BIG VISIBLE DEBUG */}
      <h1 style={{ color: "red", fontSize: "32px" }}>
        DEBUG: APP.JSX ACTIVE
      </h1>

      <h2 style={{ color: "blue" }}>
        API_URL = {String(import.meta.env.VITE_API_URL)}
      </h2>

      <hr />

      <h3>🎧 Audio Compressor</h3>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button>Compress Audio</button>
    </div>
  );
}

export default App;











