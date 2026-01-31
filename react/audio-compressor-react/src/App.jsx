import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  useEffect(() => {
    console.log("API_URL =", API_URL);
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Audio Compressor</h1>
      <p>Check console for API_URL</p>
    </div>
  );
}

export default App;





