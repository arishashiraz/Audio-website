import { useState } from "react";
import "./index.css";

const ALLOWED = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".opus"];

export default function App() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = f =>
    ALLOWED.includes(f.name.slice(f.name.lastIndexOf(".")).toLowerCase());

  const pick = f => valid(f) ? setFile(f) : alert("Unsupported audio format");

  const upload = async () => {
    if (!file) return alert("Select a file");

    const fd = new FormData();
    fd.append("audio", file);

    try {
      setLoading(true);
      setMsg("Compressing audio… ⏳");

      const r = await fetch(
        "https://audio-compressor-backend.onrender.com/upload",
        { method: "POST", body: fd }
      );

      const d = await r.json();
      if (!r.ok) throw new Error(d.error);

      setMsg("Download starting… ✅");
      window.location.href =
        `https://audio-compressor-backend.onrender.com/output/${d.file}`;

    } catch (e) {
      setMsg(e.message || "Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>🎵 Audio Compressor</h2>

      <div
        className="drop-box"
        onDragOver={e => e.preventDefault()}
        onDrop={e => pick(e.dataTransfer.files[0])}
      >
        {file ? file.name : "Drag & Drop Audio Here"}
      </div>

      <input
        type="file"
        accept={ALLOWED.join(",")}
        onChange={e => pick(e.target.files[0])}
      />

      <button disabled={loading} onClick={upload}>
        {loading ? "Compressing…" : "Upload & Compress"}
      </button>

      {msg && <p>{msg}</p>}
    </div>
  );
}









