// Get the audio visualizer canvas and its context
const canvas = document.getElementById('audioVisualizerCanvas');
const canvasCtx = canvas.getContext('2d');
const smoothingSlider = document.getElementById('smoothingSlider');
const barCountSlider = document.getElementById('barCountSlider');
const barCountValue = document.getElementById('barCountValue');
const smoothingValue = document.getElementById('smoothingValue');

let audioContext;
let analyser;
let microphone;
let animationId;
let barCount = 100;
let backgroundColor = '#000'; // Background color

// Function to generate a random cyberpunk color
function getRandomCyberpunkColor() {
    const colors = ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000", "#FFFF00"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Calculate the width of each bar based on the screen width and number of bars
function calculateBarWidth() {
    return window.innerWidth / barCount;
}

// Update the canvas resolution and initial bar colors
function setupCanvasResolution() {
    const pixelRatio = window.devicePixelRatio || 1;
    const barWidth = calculateBarWidth();
    canvas.width = barWidth * barCount * pixelRatio;
    canvas.height = canvas.offsetHeight * pixelRatio;
    canvasCtx.scale(pixelRatio, pixelRatio);
    canvasCtx.fillStyle = backgroundColor;
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
}

// Set initial bar colors
function setInitialBarColors() {
    const barWidth = calculateBarWidth();
    let x = 0;
    for (let i = 0; i < barCount; i++) {
        canvasCtx.fillStyle = getRandomCyberpunkColor();
        canvasCtx.fillRect(x, 0, barWidth, canvas.height);
        x += barWidth;
    }
}

// Define the draw function globally
function draw() {
    animationId = requestAnimationFrame(draw);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = calculateBarWidth();
    let x = 0;
    for (let i = 0; i < barCount; i++) {
        const barHeight = dataArray[i] * (canvas.height / 256);
        canvasCtx.fillStyle = getRandomCyberpunkColor();
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}

// Start visualization
function startVisualization() {
    if (!navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support getUserMedia API');
        return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = parseFloat(smoothingSlider.value);

        microphone.connect(analyser);
        setupCanvasResolution();
        setInitialBarColors();
        draw();
    }).catch(error => {
        console.error('Error accessing microphone:', error);
        alert('Error accessing microphone: ' + error.message);
    });
}

// Stop visualization
function stopVisualization() {
    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Toggle Fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Update value displays
function updateBarCountValue() {
    barCount = parseInt(barCountSlider.value, 10);
    barCountValue.textContent = barCount;
}

function updateSmoothingValue() {
    smoothingValue.textContent = smoothingSlider.value;
}

// Event listeners
document.getElementById('startVisualization').addEventListener('click', startVisualization);
document.getElementById('stopVisualization').addEventListener('click', stopVisualization);
barCountSlider.addEventListener('input', updateBarCountValue);
smoothingSlider.addEventListener('input', updateSmoothingValue);
canvas.addEventListener('dblclick', toggleFullscreen);

// Initialize values
updateBarCountValue();
updateSmoothingValue();
setupCanvasResolution();
