const startBtn = document.getElementById("start-btn");
const shutter = document.getElementById("shutter");
const cameraSection = document.getElementById("camera-section");
const video = document.getElementById("video");
const shutterSound = document.getElementById("shutter-open");
const intro = document.getElementById("intro");
const filterOptions = document.getElementById("filter-options");

const filters = [
  { name: "2000s", value: "contrast(110%) saturate(130%)" },
  { name: "Noir", value: "grayscale(100%) contrast(120%)" },
  { name: "Fisheye", value: "contrast(140%)" },
  { name: "OldFilm", value: "sepia(0.6) contrast(1.2) brightness(0.95)" },
  { name: "Dreamy", value: "brightness(150%) contrast(120%)" },
  { name: "Polaroid", value: "contrast(105%) brightness(115%) saturate(120%)" }
];


let currentFilter = null;

function applyFilter(index) {
  const selected = document.querySelectorAll(".filter-item")[index];
  const wasActive = selected.classList.contains("active");

  // Remove all highlights
  document.querySelectorAll(".filter-item").forEach(el => el.classList.remove("active"));

  if (wasActive) {
    video.style.filter = "none";
    currentFilter = null;
  } else {
    video.style.filter = filters[index].value;
    selected.classList.add("active");
    currentFilter = index;
  }
}

function populateFilters() {
  filters.forEach((filter, index) => {
    const span = document.createElement("span");
    span.className = "filter-item";
    span.textContent = filter.name;
    span.addEventListener("click", () => applyFilter(index));
    filterOptions.appendChild(span);
  });
}

startBtn.addEventListener("click", async () => {
  intro.style.display = "none";
  cameraSection.style.display = "flex";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    shutter.classList.add("open");
    shutterSound.play();
  } catch (err) {
    alert("Camera access denied or not available.");
    console.error(err);
  }
});

populateFilters();
