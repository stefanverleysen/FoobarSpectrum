document.addEventListener('DOMContentLoaded', () => {
  let audioContext;
  let analyser;
  let dataArray;
  let isDrawing = false;
  let drawVisual;
  let currentGain = 1.0; // Default to 1.0
  const oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
  const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  const fftSizeInput = document.getElementById('fftSize');
  const gainInput = document.getElementById('gain');

  fftSizeInput.addEventListener('input', () => {
    const newFftSize = parseInt(fftSizeInput.value);
    // Update your FFT size settings or perform any other actions with newFftSize
    console.log('FFT Size:', newFftSize);
  });
  gainInput.addEventListener('input', () => {
    const newGain = parseFloat(gainInput.value);
    // Update your gain settings or perform any other actions with newGain
    console.log('Gain:', newGain);
  });

  oscilloscopeCanvas.width = oscilloscopeCanvas.offsetWidth * dpr;
  oscilloscopeCanvas.height = oscilloscopeCanvas.offsetHeight * dpr;
  oscilloscopeCtx.scale(dpr, dpr);

  let lineThickness = 2;

  function getRandomCyberpunkColor() {
    const colors = ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000", "#FFFF00"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function resizeCanvas() {
    if (document.fullscreenElement) {
      oscilloscopeCanvas.width = window.screen.width * dpr;
      oscilloscopeCanvas.height = window.screen.height * dpr;
    } else {
      oscilloscopeCanvas.width = oscilloscopeCanvas.offsetWidth * dpr;
      oscilloscopeCanvas.height = oscilloscopeCanvas.offsetHeight * dpr;
    }
    oscilloscopeCtx.scale(dpr, dpr);

    if (isDrawing) {
      drawOscilloscope();
    }
  }

  function onFullScreenChange() {
    resizeCanvas();
  }

  oscilloscopeCanvas.addEventListener('click', toggleFullscreen);

  oscilloscopeCanvas.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', onFullScreenChange);

 function drawOscilloscope() {
  if (!isDrawing) return;

  drawVisual = requestAnimationFrame(drawOscilloscope);

  analyser.getByteTimeDomainData(dataArray);

  oscilloscopeCtx.fillStyle = 'rgb(0, 0, 0)';
  oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

  oscilloscopeCtx.lineWidth = lineThickness;
  oscilloscopeCtx.strokeStyle = getRandomCyberpunkColor();

  oscilloscopeCtx.beginPath();

  var sliceWidth = oscilloscopeCanvas.width / dataArray.length;
  var x = 0;
  var centerY = oscilloscopeCanvas.height / 2; // Calculate centerY

  const gainValue = parseFloat(gainInput.value); // Log gainValue
  console.log('Gain Value:', gainValue);

  for (var i = 0; i < dataArray.length; i++) {

  var v = dataArray[i] / 128.0;
  v *= currentGain; // Apply gain
  
  var y = v * oscilloscopeCanvas.height / 2;

    if (i === 0) {
      oscilloscopeCtx.moveTo(x, y);
    } else {
      oscilloscopeCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  console.log('dataArray:', dataArray); // Log dataArray

  oscilloscopeCtx.stroke();
}
  

  function startOscilloscope() {
    // Check if the AudioContext is available
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (AudioContext) {
      audioContext = new AudioContext();

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192;
      dataArray = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(dataArray);

      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const source = audioContext.createMediaStreamSource(stream);

        // Connect the source to the analyser
        source.connect(analyser);

        isDrawing = true;
        drawVisual = requestAnimationFrame(drawOscilloscope);
      }).catch(err => {
        console.error('Error accessing microphone:', err);
      });
    } else {
      console.error('Web Audio API is not supported in this browser.');
    }
  }

  function stopOscilloscope() {
    if (!isDrawing) return;

    isDrawing = false;
    cancelAnimationFrame(drawVisual);

    if (audioContext) {
      analyser.disconnect();
      audioContext.close();
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      oscilloscopeCanvas.requestFullscreen().catch(err => {
        alert('Error attempting to enable fullscreen mode: ' + err.message);
      });
    } else {
      document.exitFullscreen();
    }
  }

  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');

  startButton.addEventListener('click', startOscilloscope);
  stopButton.addEventListener('click', stopOscilloscope);

  gainInput.addEventListener('input', () => {

  currentGain = parseFloat(gainInput.value);

});

});
