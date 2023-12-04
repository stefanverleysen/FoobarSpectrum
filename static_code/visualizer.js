// Get the audio visualizer canvas and its context
const canvas = document.getElementById('audioVisualizerCanvas');
const canvasCtx = canvas.getContext('2d');
const fftSizeSlider = document.getElementById('fftSizeSlider');
const smoothingSlider = document.getElementById('smoothingSlider');
const barCountSlider = document.getElementById('barCountSlider');
const barCountValue = document.getElementById('barCountValue');
const fftSizeValue = document.getElementById('fftSizeValue');
const smoothingValue = document.getElementById('smoothingValue');

let audioContext;
let analyser;
let microphone;
let animationId;
let barCount = 50;
let backgroundColor = '#333'; // Header color

function setupCanvasResolution() {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * pixelRatio;
    canvas.height = canvas.offsetHeight * pixelRatio;
    canvasCtx.scale(pixelRatio, pixelRatio);
    canvasCtx.fillStyle = backgroundColor; // Set the background color
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas with background color
}

// Function to start visualization (you can add your visualization logic here)
function startVisualization() {
    if (!navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support getUserMedia API');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = parseInt(fftSizeSlider.value, 10);
        analyser.smoothingTimeConstant = parseFloat(smoothingSlider.value);

        microphone.connect(analyser);
        setupCanvasResolution();

        function draw() {
            animationId = requestAnimationFrame(draw);
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / barCount);
            let barHeight;
            let x = 0;

            for (let i = 0; i < barCount; i++) {
                barHeight = dataArray[i] * (canvas.height / 256);
                canvasCtx.fillStyle = 'red'; // Set bar color to red
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        }

        draw();
    }).catch(error => {
        console.error('Error accessing microphone:', error);
        alert('Error accessing microphone: ' + error.message);
    });
}

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

// Update the bar count value and display it
function updateBarCountValue() {
    barCount = parseInt(barCountSlider.value, 10);
    barCountValue.textContent = barCount;
}

// Update the FFT size value and display it
function updateFFTSizeValue() {
    fftSizeValue.textContent = fftSizeSlider.value;
}

// Update the smoothing value and display it
function updateSmoothingValue() {
    smoothingValue.textContent = smoothingSlider.value;
}

// Event listeners
document.getElementById('startVisualization').addEventListener('click', startVisualization);
document.getElementById('stopVisualization').addEventListener('click', stopVisualization);
barCountSlider.addEventListener('input', updateBarCountValue);
fftSizeSlider.addEventListener('input', updateFFTSizeValue);
smoothingSlider.addEventListener('input', updateSmoothingValue);

// Initialize values
updateBarCountValue();
updateFFTSizeValue();
updateSmoothingValue();
setupCanvasResolution();
