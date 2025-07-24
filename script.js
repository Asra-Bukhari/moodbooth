const startBtn = document.getElementById("start-btn");
const shutter = document.getElementById("shutter");
const cameraSection = document.getElementById("camera-section");
const video = document.getElementById("video");
const shutterSound = document.getElementById("shutter-open");
const intro = document.getElementById("intro");
const filterOptions = document.getElementById("filter-options");
const stripSection = document.getElementById("strip-section");
const stripDate = document.getElementById("strip-date");
const retakeBtn = document.getElementById("retake-btn");
const downloadBtn = document.getElementById("download-btn");
const canvas = document.getElementById("photo-strip");
const shutterButton = document.querySelector(".shutter-button");

const images = [];
const shutterClick = new Audio("assets/shutter-click.mp3");

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

function triggerFlash() {
  const flash = document.getElementById("flash");
  flash.classList.add("active");

  setTimeout(() => {
    flash.classList.remove("active");
  }, 100);
}

function countdownAndCapture() {
  shutterButton.disabled = true;
  shutterButton.classList.add("disabled");

  let count = 3;
  const countdown = document.createElement("div");
  countdown.className = "countdown";
  document.body.appendChild(countdown);

  const countdownInterval = setInterval(() => {
    if (count === 0) {
      countdown.textContent = "Smile!";

      setTimeout(() => {
        triggerFlash();
        shutterClick.play();
        captureImage();
      }, 500);

      setTimeout(() => {
        document.body.removeChild(countdown);
        if (images.length < 3) {
          countdownAndCapture();
        } else {
          showPhotoStrip();
          shutterButton.disabled = false;
          shutterButton.classList.remove("disabled");
        }
      }, 600);
      clearInterval(countdownInterval);
    } else {
      countdown.textContent = count--;
    }
  }, 1000);
}

function captureImage() {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.translate(tempCanvas.width, 0);
  tempCtx.scale(-1, 1);
  tempCtx.filter = currentFilter !== null ? filters[currentFilter].value : "none";
  tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  images.push(tempCanvas);
}

function showPhotoStrip() {
  cameraSection.style.display = "none";
  stripSection.style.display = "flex";

  const photoStrip = document.getElementById("photo-strip");
  photoStrip.innerHTML = ""; 

  images.forEach((imgCanvas) => {
    const img = document.createElement("img");
    img.src = imgCanvas.toDataURL("image/png");
    img.className = "strip-photo";
    photoStrip.appendChild(img);
  });

  const label = document.createElement("div");
  label.className = "strip-label";

  const today = new Date();
  label.textContent = `MoodBooth • ${today.toLocaleDateString()}`;

  const labelColorPicker = document.getElementById("labelColorPicker");
  if (labelColorPicker) {
    label.style.color = labelColorPicker.value;
  }

  photoStrip.appendChild(label);
}


document.getElementById("labelColorPicker").addEventListener("input", (e) => {
  const label = document.querySelector(".strip-label");
  if (label) {
    label.style.color = e.target.value;
  }
});



retakeBtn.addEventListener("click", () => {
  shutterButton.disabled = false;
  shutterButton.classList.remove("disabled");
  stripSection.style.display = "none";
  cameraSection.style.display = "flex";
  images.length = 0;
  document.querySelectorAll(".applied-sticker").forEach(s => s.remove());
  countdownAndCapture();
});


downloadBtn.addEventListener("click", () => {
const downloadTarget = document.getElementById("download-target");

const originalMaxHeight = downloadTarget.style.maxHeight;
const originalOverflow = downloadTarget.style.overflow;

downloadTarget.style.maxHeight = "none";
downloadTarget.style.overflow = "visible";

html2canvas(downloadTarget, {
  useCORS: true,
  scrollY: -window.scrollY, 
}).then(canvasFinal => {
  const link = document.createElement("a");
  link.download = `MoodBooth_Strip_${new Date().toISOString().split("T")[0]}.png`;
  link.href = canvasFinal.toDataURL("image/png");
  link.click();

  downloadTarget.style.maxHeight = originalMaxHeight;
  downloadTarget.style.overflow = originalOverflow;
});

});


shutterButton.addEventListener("click", () => {
  images.length = 0;
  countdownAndCapture();
});


const stickerPanel = document.getElementById("stickerPanel");

for (let i = 1; i <= 23; i++) {
  const sticker = document.createElement("img");
  sticker.src = `assets/stickers/sticker${i}.png`;
  sticker.classList.add("sticker-thumb");
  sticker.setAttribute("draggable", "true");
  stickerPanel.appendChild(sticker);
}

document.getElementById("toggleStickers").addEventListener("click", () => {
  stickerPanel.classList.toggle("hidden");
});


const photoStripBox = document.getElementById("download-target");

stickerPanel.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "IMG") {
    e.dataTransfer.setData("text/plain", e.target.src);
  }
});

photoStripBox.addEventListener("dragover", (e) => {
  e.preventDefault();
});

photoStripBox.addEventListener("drop", (e) => {
  e.preventDefault();
  const src = e.dataTransfer.getData("text/plain");

  const wrapper = document.createElement("div");
  wrapper.classList.add("applied-sticker-wrapper");
  wrapper.style.position = "absolute";
  wrapper.style.left = e.offsetX + "px";
  wrapper.style.top = e.offsetY + "px";
  wrapper.style.width = "100px";
  wrapper.style.height = "100px";
  wrapper.style.transform = "rotate(0deg)";

  const sticker = document.createElement("img");
  sticker.src = src;
  sticker.classList.add("applied-sticker");

  wrapper.appendChild(sticker);
  photoStripBox.appendChild(wrapper);
  placedStickers.push(wrapper);

  makeStickerInteractive(wrapper); 
});



function makeStickerInteractive(wrapper) {
  interact(wrapper)
    .draggable({
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          const angle = parseFloat(target.getAttribute("data-rotation")) || 0;
          target.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        }
      }
    })
    .resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      listeners: {
        move(event) {
          const target = event.target;
          let { width, height } = event.rect;
          target.style.width = `${width}px`;
          target.style.height = `${height}px`;

          const x = parseFloat(target.getAttribute("data-x")) || 0;
          const y = parseFloat(target.getAttribute("data-y")) || 0;
          const angle = parseFloat(target.getAttribute("data-rotation")) || 0;
          target.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
        }
      }
    })
    .gesturable({
      listeners: {
        move(event) {
          const target = event.target;
          const currentAngle = parseFloat(target.getAttribute("data-rotation")) || 0;
          const newAngle = currentAngle + event.da;

          const x = parseFloat(target.getAttribute("data-x")) || 0;
          const y = parseFloat(target.getAttribute("data-y")) || 0;

          target.style.transform = `translate(${x}px, ${y}px) rotate(${newAngle}deg)`;
          target.setAttribute("data-rotation", newAngle);
        }
      }
    });
}




const placedStickers = [];

function undoLastSticker() {
  const last = placedStickers.pop();
  if (last && last.parentNode) {
    last.parentNode.removeChild(last);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("undoSticker").addEventListener("click", undoLastSticker);
});


const colorPicker = document.getElementById("stripColorPicker");
const stripElement = document.querySelector(".photo-strip-html");

colorPicker.addEventListener("input", () => {
  const selectedColor = colorPicker.value;

 
  document.querySelector(".photo-strip-html").style.backgroundColor = selectedColor;
  document.querySelector(".photo-strip-box").style.backgroundColor = selectedColor;
  document.querySelector(".strip-preview").style.backgroundColor = selectedColor;
});

const labelColorPicker = document.getElementById("labelColorPicker");
const labelElement = document.querySelector(".photo-strip-label");

labelColorPicker.addEventListener("input", () => {
  labelElement.style.color = labelColorPicker.value;
});

function applySticker(stickerURL) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("resizable-container");

  const img = document.createElement("img");
  img.src = stickerURL;
  img.classList.add("applied-sticker");
  wrapper.appendChild(img);

 
  ["tl", "tr", "bl", "br"].forEach(pos => {
    const handle = document.createElement("div");
    handle.classList.add("resize-handle", pos);
    wrapper.appendChild(handle);
  });

  photoStripContainer.appendChild(wrapper);

  makeStickerInteractive(wrapper);

  
  wrapper.addEventListener("mousedown", () => {
    document.querySelectorAll(".resizable-container").forEach(e => e.classList.remove("active"));
    wrapper.classList.add("active");
  });
}

document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".resizable-container")) {
    document.querySelectorAll(".resizable-container").forEach(el => el.classList.remove("active"));
  }
});
