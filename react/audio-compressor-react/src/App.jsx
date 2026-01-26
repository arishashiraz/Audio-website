import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("audio/")) {
      setFile(droppedFile);
    } else {
      alert("Please drop an audio file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const compressAudio = async () => {
    if (!file) {
      alert("No file selected");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("audio", file); // MUST be "audio"

    try {
      const response = await fetch("http://localhost:5000/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Compression failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.mp3";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          border: "2px dashed #555",
          padding: "40px",
          width: "300px",
          textAlign: "center",
        }}
      >
        {file ? file.name : "Drag & drop audio file here"}
      </div>

      <button onClick={compressAudio} disabled={loading}>
        {loading ? "Compressing..." : "Compress Audio"}
      </button>
    </div>
  );
}

export default App;


