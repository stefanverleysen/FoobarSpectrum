document.addEventListener('DOMContentLoaded', () => {
    let audioContext;
    let analyser;
    let dataArray;
    let isDrawing = false;
    let drawVisual;

    const oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
    const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');

    // Adjust for high-DPI displays
    let dpr = window.devicePixelRatio || 1;
    oscilloscopeCanvas.width = oscilloscopeCanvas.offsetWidth * dpr;
    oscilloscopeCanvas.height = oscilloscopeCanvas.offsetHeight * dpr;
    oscilloscopeCtx.scale(dpr, dpr);

    // Set default values for line thickness
    let lineThickness = 1;

    // Sensitivity control with new range
    let sensitivity = 2.5; // Initial sensitivity corresponding to slider value 5
    const sensitivitySlider = document.getElementById('sensitivity');

    sensitivitySlider.addEventListener('input', (event) => {
        const sliderValue = parseFloat(event.target.value);
        // Map the 1-10 range to a 0.5-4 range
        sensitivity = 0.5 + (sliderValue - 1) * (3.5 / 9);
    });

    // Function to generate a random cyberpunk color in hex format
    function getRandomCyberpunkColor() {
        const cyberpunkColors = ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000", "#FFFF00"];
        return cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];
    }

    function drawOscilloscope() {
        if (!isDrawing) return;
        drawVisual = requestAnimationFrame(drawOscilloscope);

        analyser.getByteTimeDomainData(dataArray);
        oscilloscopeCtx.fillStyle = 'rgb(0, 0, 0)';
        oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

        oscilloscopeCtx.lineWidth = lineThickness;
        oscilloscopeCtx.lineJoin = 'round';
        oscilloscopeCtx.lineCap = 'round';
        oscilloscopeCtx.strokeStyle = getRandomCyberpunkColor();
        oscilloscopeCtx.beginPath();

        var sliceWidth = oscilloscopeCanvas.width / analyser.fftSize;
        var x = 0;

        for (var i = 0; i < analyser.fftSize; i++) {
            var v = dataArray[i] / 128.0 - 1;
            var y = (oscilloscopeCanvas.height / 2) + v * sensitivity * (oscilloscopeCanvas.height / 2);

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
        if (isDrawing) return;

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
