import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError("");

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) {
      setError("No file detected");
      return;
    }

    if (!droppedFile.type.startsWith("audio/")) {
      setError("Please drop an audio file only");
      return;
    }

    setFile(droppedFile);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Audio Compressor</h1>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: "320px",
          height: "160px",
          border: "2px dashed #333",
          margin: "20px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        Drag & Drop Audio File Here
      </div>

      {file && (
        <p>
          <strong>Selected File:</strong> {file.name}
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;

