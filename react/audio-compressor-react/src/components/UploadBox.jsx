import { useState } from "react";

function UploadBox({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (!droppedFile.type.startsWith("audio/")) {
      setError("Please upload an audio file");
      return;
    }

    onFileSelect(droppedFile);
  };

  const handleFileSelect = (e) => {
    setError("");
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/")) {
      setError("Please upload an audio file");
      return;
    }

    onFileSelect(selectedFile);
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #999",
          padding: "30px",
          textAlign: "center",
          backgroundColor: isDragging ? "#f0f8ff" : "transparent",
          cursor: "pointer",
        }}
      >
        <p>Drag & drop an audio file here</p>
        <p>or</p>
        <input type="file" accept="audio/*" onChange={handleFileSelect} />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default UploadBox;
