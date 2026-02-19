function Controls({ bitrate, setBitrate, format, setFormat }) {
  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Compression Settings</h3>

      {/* Bitrate selection */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          Bitrate:&nbsp;
          <select
            value={bitrate}
            onChange={(e) => setBitrate(e.target.value)}
          >
            <option value="64k">64 kbps (Very small)</option>
            <option value="96k">96 kbps (Small)</option>
            <option value="128k">128 kbps (Balanced)</option>
            <option value="192k">192 kbps (High quality)</option>
          </select>
        </label>
      </div>

      {/* Output format selection */}
      <div>
        <label>
          Output format:&nbsp;
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="mp3">MP3</option>
            <option value="aac">AAC</option>
            <option value="ogg">OGG</option>
            <option value="wav">WAV</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default Controls;
