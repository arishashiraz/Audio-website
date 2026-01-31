import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  useEffect(() => {
    console.log("API_URL =", API_URL);
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🎧 Audio Compressor</h1>

      <h3>STEP 1 DEBUG</h3>

      <p>
        <strong>API_URL value:</strong>
      </p>

      <pre
        style={{
          background: "#f4f4f4",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {String(API_URL)}
      </pre>

      <p>
        If this says <b>undefined</b>, your Vercel env variable is missing.
      </p>
    </div>
  );
}

export default App;






