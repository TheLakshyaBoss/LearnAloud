const imageInput = document.getElementById("imageInput");
const extractBtn = document.getElementById("extractBtn");
const preview = document.getElementById("preview");
const outputContainer = document.getElementById("outputContainer");
const outputText = document.getElementById("outputText");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

let currentUtterance = null;
let isPaused = false;

// Show preview on image select
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      extractBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }
});

// Extract text using Tesseract.js
extractBtn.addEventListener("click", () => {
  const file = imageInput.files[0];
  if (!file) return;

  extractBtn.textContent = "Extracting...";
  extractBtn.disabled = true;

  Tesseract.recognize(file, "eng", {
    logger: (info) => console.log(info) // progress log
  })
    .then(({ data: { text } }) => {
      outputText.value = text.trim();
      outputContainer.classList.remove("hidden");
    })
    .finally(() => {
      extractBtn.textContent = "Extract Text";
      extractBtn.disabled = false;
    });
});

// Speech controls
playBtn.addEventListener("click", () => {
  const text = outputText.value.trim();
  if (!text) return;

  if (isPaused && currentUtterance) {
    speechSynthesis.resume();
    isPaused = false;
    return;
  }

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = 1; // adjust speed
  currentUtterance.pitch = 1; // adjust pitch
  speechSynthesis.speak(currentUtterance);
});

pauseBtn.addEventListener("click", () => {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    isPaused = true;
  }
});

stopBtn.addEventListener("click", () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    isPaused = false;
  }
});

const voiceSelect = document.getElementById("voiceSelect");
let voices = [];

// Populate voices dynamically
function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
}

// voices may load asynchronously
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

// Update play button to use selected voice
playBtn.addEventListener("click", () => {
  const text = outputText.value.trim();
  if (!text) return;

  if (isPaused && currentUtterance) {
    speechSynthesis.resume();
    isPaused = false;
    return;
  }

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = 1;
  currentUtterance.pitch = 1;

  // Use selected voice
  const selectedIndex = parseInt(voiceSelect.value);
  if (voices[selectedIndex]) {
    currentUtterance.voice = voices[selectedIndex];
  }

  speechSynthesis.speak(currentUtterance);
});
