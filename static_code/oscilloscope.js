
// JavaScript code for oscilloscope functionality

window.onload = function() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser = audioContext.createAnalyser();
    let isDrawing = false;
    let drawVisual;

    const oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
    const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');

    // Fit the canvas to the container size in the CSS
    oscilloscopeCanvas.width = oscilloscopeCanvas.offsetWidth;
    oscilloscopeCanvas.height = oscilloscopeCanvas.offsetHeight;

    function drawOscilloscope() {
        if (!isDrawing) return;

        drawVisual = requestAnimationFrame(drawOscilloscope);
        analyser.fftSize = 2048;
        let bufferLength = analyser.fftSize;
        let dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        oscilloscopeCtx.fillStyle = 'rgb(0, 0, 0)';
        oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

        oscilloscopeCtx.lineWidth = 2;
        oscilloscopeCtx.strokeStyle = 'rgb(0, 123, 255)';

        oscilloscopeCtx.beginPath();

        let sliceWidth = oscilloscopeCanvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = v * oscilloscopeCanvas.height / 2;

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
        isDrawing = true;
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function(stream) {
                let source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                drawOscilloscope();
            })
            .catch(function(err) {
                console.error('Error getting audio stream from getUserMedia', err);
            });
    }

    function stopOscilloscope() {
        isDrawing = false;
        window.cancelAnimationFrame(drawVisual);
    }

    // Attach event listeners to buttons
    document.getElementById('startButton').addEventListener('click', startOscilloscope);
    document.getElementById('stopButton').addEventListener('click', stopOscilloscope);
    // The Fullscreen button logic will need to be implemented based on the user's existing fullscreen functionality
};

