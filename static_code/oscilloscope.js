document.addEventListener('DOMContentLoaded', () => {
    let audioContext;
    let analyser;
    let dataArray;
    let isDrawing = false;
    let drawVisual;
    
    // Add speed and elasticity variables
    let speed = 1; // Default speed
    let elasticity = 1; // Default elasticity
    
    const oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
    const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
    
    oscilloscopeCanvas.width = oscilloscopeCanvas.offsetWidth;
    oscilloscopeCanvas.height = oscilloscopeCanvas.offsetHeight;
    
    // ... (other code remains the same)
    
    // New HTML controls for speed and elasticity
    const speedSlider = document.getElementById('speed');
    const elasticitySlider = document.getElementById('elasticity');
    
    speedSlider.addEventListener('input', (event) => {
        speed = parseFloat(event.target.value);
    });
    
    elasticitySlider.addEventListener('input', (event) => {
        elasticity = parseFloat(event.target.value);
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
        var y = Math.sin((2 * Math.PI * i / analyser.fftSize) * elasticity) * (oscilloscopeCanvas.height / 2) * v * scaleFactor;

        // Adjust for speed
        x += sliceWidth * speed;

        if (i === 0) {
            oscilloscopeCtx.moveTo(x, oscilloscopeCanvas.height / 2);
        } else {
            oscilloscopeCtx.lineTo(x, oscilloscopeCanvas.height / 2 - y);
        }
    }

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
