document.addEventListener('DOMContentLoaded', () => {
    let audioContext;
    let analyser;
    let dataArray;
    let isDrawing = false;
    let drawVisual;

    const oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
    const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');

    oscilloscopeCanvas.width = oscilloscopeCanvas.offsetWidth;
    oscilloscopeCanvas.height = oscilloscopeCanvas.offsetHeight;

    // New variables for waveform type, line thickness, and scale factor
    let selectedWaveform = 'sine'; // Default to sine wave
    let lineThickness = 2; // Default line thickness
    let scaleFactor = 1; // Default scale factor

    // New HTML controls for waveform type, line thickness, and scale factor
    const waveformTypeDropdown = document.getElementById('waveformType');
    const lineThicknessSlider = document.getElementById('lineThickness');
    const scaleFactorSlider = document.getElementById('scaleFactor');

    waveformTypeDropdown.addEventListener('change', (event) => {
        selectedWaveform = event.target.value;
    });

    lineThicknessSlider.addEventListener('input', (event) => {
        lineThickness = event.target.value;
    });

    scaleFactorSlider.addEventListener('input', (event) => {
        scaleFactor = event.target.value;
    });

   function drawOscilloscope() {
    if (!isDrawing) return;
    drawVisual = requestAnimationFrame(drawOscilloscope);

    analyser.getByteTimeDomainData(dataArray);
    oscilloscopeCtx.fillStyle = 'rgb(200, 200, 200)';
    oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

    oscilloscopeCtx.lineWidth = lineThickness; // Use the selected line thickness
    oscilloscopeCtx.strokeStyle = 'rgb(0, 0, 0)';
    oscilloscopeCtx.beginPath();

    var sliceWidth = (oscilloscopeCanvas.width * scaleFactor) / analyser.fftSize; // Use the selected scale factor
    var x = 0;

    for (var i = 0; i < analyser.fftSize; i++) {
        var v = dataArray[i] / 128.0;
        var y;

        // Adjust the y value based on the selected waveform type
        switch (selectedWaveform) {
            case 'sine':
                y = Math.sin(2 * Math.PI * i / analyser.fftSize);
                break;
            case 'square':
                y = v >= 0.5 ? 1 : -1;
                break;
            case 'sawtooth':
                y = (v * 2 - 1) * (i / analyser.fftSize);
                break;
            case 'triangle':
                y = 1 - 4 * Math.abs((i / analyser.fftSize) - 0.5);
                break;
            default:
                y = 0;
                break;
        }

        y = y * (oscilloscopeCanvas.height / 2) * scaleFactor; // Adjust for scale factor

        if (i === 0) {
            oscilloscopeCtx.moveTo(x, y);
        } else {
            oscilloscopeCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    oscilloscopeCtx.lineTo(oscilloscopeCanvas.width, oscilloscopeCanvas.height / 2);
    oscilloscopeCtx.stroke();
}


    function startOscilloscope() {
        if (isDrawing) {
            stopOscilloscope(); // Stop the oscilloscope if it's already running
        }

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.85;
        dataArray = new Uint8Array(analyser.fftSize);

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            isDrawing = true;
            drawVisual = requestAnimationFrame(drawOscilloscope);
        }).catch(err => {
            console.error('Error accessing microphone:', err);
        });
    }

    function stopOscilloscope() {
        if (!isDrawing) return;
        isDrawing = false;
        cancelAnimationFrame(drawVisual);
        analyser.disconnect();
        audioContext.close();
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            oscilloscopeCanvas.requestFullscreen().catch(err => {
                alert('Error attempting to enable fullscreen: ' + err.message);
            });
        } else {
            document.exitFullscreen();
        }
    }

    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const fullscreenButton = document.getElementById('fullscreenButton');

    startButton.addEventListener('click', startOscilloscope);
    stopButton.addEventListener('click', stopOscilloscope);
    fullscreenButton.addEventListener('click', toggleFullscreen);
});
