const dropZone = document.getElementById("dropZone");
const fileName = document.getElementById("fileName");

// When file is dragged over the box
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault(); // IMPORTANT
  dropZone.classList.add("active");
});

// When file leaves the box
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("active");
});

// When file is dropped
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("active");

  const file = e.dataTransfer.files[0];

  if (!file) {
    alert("No file detected");
    return;
  }

  if (!file.type.startsWith("audio/")) {
    alert("Please drop an audio file only");
    return;
  }

  fileName.innerText = "Selected File: " + file.name;
});
