const startBtn = document.getElementById("start-btn");
const shutter = document.getElementById("shutter");
const cameraSection = document.getElementById("camera-section");
const video = document.getElementById("video");
const shutterSound = document.getElementById("shutter-sound");

startBtn.addEventListener("click", async () => {
  // Play shutter sound
  shutterSound.play();

  // Animate shutter opening
  shutter.classList.add("open");

  // Wait for animation & sound to finish (2 sec)
  setTimeout(async () => {
    document.querySelector('.intro').style.display = "none";
    cameraSection.style.display = "block";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or not available.");
      console.error(err);
    }
  }, 2000);  // Duration must match CSS + sound duration
});
