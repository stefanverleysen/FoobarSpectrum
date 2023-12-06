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
let backgroundColor = '#000'; // Header color

// Calculate the width of each bar based on the screen width and number of bars
function calculateBarWidth() {
    const screenWidth = window.innerWidth; // Get the screen width
    return screenWidth / barCount;
}

// Update the canvas resolution and initial bar colors
function setupCanvasResolution() {
    const pixelRatio = window.devicePixelRatio || 1;
    const barWidth = calculateBarWidth(); // Calculate the bar width dynamically
    canvas.width = barWidth * barCount * pixelRatio;
    canvas.height = canvas.offsetHeight * pixelRatio;
    canvasCtx.scale(pixelRatio, pixelRatio);
    canvasCtx.fillStyle = backgroundColor; // Set the background color
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas with background color
}

// Function to generate a random cyberpunk color in hex format
function getRandomCyberpunkColor() {
    const cyberpunkColors = ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000", "#FFFF00"];
    return cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];
}

// Function to set initial bar colors to a random cyberpunk color
function setInitialBarColors() {
    const randomColor = getRandomCyberpunkColor();
    const barWidth = calculateBarWidth(); // Calculate bar width dynamically
    let x = 0;

    for (let i = 0; i < barCount; i++) {
        canvasCtx.fillStyle = randomColor; // Set bar color to random cyberpunk color
        canvasCtx.fillRect(x, 0, barWidth, canvas.height);
        x += barWidth;
    }
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
        setInitialBarColors();

        // Define the draw function globally
        function draw() {
            animationId = requestAnimationFrame(draw);
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = calculateBarWidth(); // Calculate bar width dynamically
            let x = 0;

            for (let i = 0; i < barCount; i++) {
                const barHeight = dataArray[i] * (canvas.height / 256);
                canvasCtx.fillStyle = getRandomCyberpunkColor(); // Set bar color to random cyberpunk color
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth;
            }
        }

        draw(); // Call the draw function when starting visualization
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

// Add the new code for mouse and keyboard interactions here

let isMouseOverCanvas = false;
let isFullscreen = false;
let isStopped = true;

// Event listener for mouseover and mouseout on the canvas
canvas.addEventListener('mouseover', () => {
    isMouseOverCanvas = true;
});

canvas.addEventListener('mouseout', () => {
    isMouseOverCanvas = false;
});
// Event listener for double click to toggle fullscreen
canvas.addEventListener('dblclick', () => {
    if (!isFullscreen) {
        // Toggle to fullscreen mode
        canvas.requestFullscreen();
    } else {
        // Exit fullscreen mode
        document.exitFullscreen();
    }
});


// Function to change bar colors to a random cyberpunk color
function changeBarColors() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const barWidth = calculateBarWidth(); // Calculate bar width dynamically
    let x = 0;

    // Define an array of cyberpunk colors
    const cyberpunkColors = ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000", "#FFFF00"];

    // Get a random cyberpunk color from the array
    const randomColor = cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];

    for (let i = 0; i < barCount; i++) {
        const barHeight = dataArray[i] * (canvas.height / 256);
        canvasCtx.fillStyle = randomColor; // Set bar color to the random color
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
    
    // Call the draw function to update the visualization
    draw();
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

// Event listener for keydown to handle key presses
document.addEventListener('keydown', (event) => {
    if (isMouseOverCanvas) {
        if (event.key === 'Enter' && !isFullscreen) {
            // Enter key pressed, toggle fullscreen mode
            isFullscreen = true;
            canvas.requestFullscreen(); // Use appropriate method for fullscreen
        } else if (event.key === 'Escape' && isFullscreen) {
            // Escape key pressed, exit fullscreen mode
            isFullscreen = false;
            document.exitFullscreen(); // Use appropriate method to exit fullscreen
        } else if (event.key === ' ' && !isStopped) {
            // Space key pressed, stop or start visualization
            isStopped = true;
            stopVisualization();
        } else if (event.key === ' ' && isStopped) {
            // Space key pressed, stop or start visualization
            isStopped = false;
            startVisualization();
        } else if (event.key === 'ArrowLeft') {
            // Left arrow key pressed, change bar colors (implement your logic here)
            changeBarColors('left'); // Implement the function to change colors
        } else if (event.key === 'ArrowRight') {
            // Right arrow key pressed, change bar colors (implement your logic here)
            changeBarColors('right'); // Implement the function to change colors
        }
    }
});


// Initialize values
updateBarCountValue();
updateFFTSizeValue();
updateSmoothingValue();
setupCanvasResolution();
