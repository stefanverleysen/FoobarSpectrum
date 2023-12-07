
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

// Connecting the audio source
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(function(stream) {
        let source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        drawOscilloscope();
    })
    .catch(function(err) {
        console.log('Error getting audio stream from getUserMedia', err);
    });

// Function to draw the oscilloscope waveform
function drawOscilloscope() {
    requestAnimationFrame(drawOscilloscope);

    // Clear the canvas
    oscilloscopeCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

    // Get the waveform data
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Draw the waveform
    oscilloscopeCtx.lineWidth = 2;
    oscilloscopeCtx.strokeStyle = 'rgb(0, 255, 0)';
    oscilloscopeCtx.beginPath();

    let sliceWidth = oscilloscopeCanvas.width * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = v * oscilloscopeCanvas.height / 2;

        if(i === 0) {
            oscilloscopeCtx.moveTo(x, y);
        } else {
            oscilloscopeCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    oscilloscopeCtx.lineTo(oscilloscopeCanvas.width, oscilloscopeCanvas.height / 2);
    oscilloscopeCtx.stroke();
}
