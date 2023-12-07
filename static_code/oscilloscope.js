
// JavaScript code for oscilloscope functionality

// Selecting the oscilloscope canvas and getting its context
const oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
oscilloscopeCanvas.width = window.innerWidth;
oscilloscopeCanvas.height = window.innerHeight;

// Audio setup
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
let isDrawing = false;

// Function to draw the oscilloscope waveform
function drawOscilloscope() {
    if (!isDrawing) return;
    requestAnimationFrame(drawOscilloscope);

    // [Drawing logic remains the same as before...]
}

// Function to start the oscilloscope
function startOscilloscope() {
    if (isDrawing) return;
    isDrawing = true;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function(stream) {
            let source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            drawOscilloscope();
        })
        .catch(function(err) {
            console.log('Error getting audio stream from getUserMedia', err);
        });
}

// Function to stop the oscilloscope
function stopOscilloscope() {
    isDrawing = false;
}

// Attaching event listeners to buttons
document.getElementById('startButton').addEventListener('click', startOscilloscope);
document.getElementById('stopButton').addEventListener('click', stopOscilloscope);
