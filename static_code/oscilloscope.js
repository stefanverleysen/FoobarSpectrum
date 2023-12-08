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

    const lineThicknessSlider = document.getElementById('lineThickness');
    const speedSlider = document.getElementById('speed');
    const elasticitySlider = document.getElementById('elasticity');

    let lineThickness = 2;
    let speed = 1;
    let elasticity = 1;

    lineThicknessSlider.addEventListener('input', (event) => {
        lineThickness = event.target.value;
    });

    speedSlider.addEventListener('input', (event) => {
        speed = event.target.value;
    });

    elasticitySlider.addEventListener('input', (event) => {
        elasticity = event.target.value;
    });
    // Function to generate a random cyberpunk color in hex format
    function getRandomCyberpunkColor() {
    const cyberpunkColors = ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000", "#FFFF00"];
    return cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];
    function drawOscilloscope() {
    if (!isDrawing) return;
    drawVisual = requestAnimationFrame(drawOscilloscope);

    analyser.getByteTimeDomainData(dataArray);
    oscilloscopeCtx.fillStyle = 'rgb(0, 0, 0)';
    oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

    oscilloscopeCtx.lineWidth = lineThickness;
    oscilloscopeCtx.strokeStyle = getRandomCyberpunkColor(); // Use the random color generator for strokeStyle
    oscilloscopeCtx.beginPath();

    var sliceWidth = (oscilloscopeCanvas.width * speed) / analyser.fftSize;
    var x = 0;

    for (var i = 0; i < analyser.fftSize; i++) {
        var v = dataArray[i] / 128.0;
        var y = (v * (oscilloscopeCanvas.height / 2) * elasticity);

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
