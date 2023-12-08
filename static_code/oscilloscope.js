document.addEventListener('DOMContentLoaded', () => {
  let audioContext;
  let analyser;
  let dataArray;
  let isDrawing = false;
  let drawVisual;
  const oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
  const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

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

    for (var i = 0; i < dataArray.length; i++) {
      var v = dataArray[i] / 128.0;
      var y = (0.5 - v) * oscilloscopeCanvas.height / 2 + oscilloscopeCanvas.height / 2; // Center the waveform

      if (i === 0) {
        oscilloscopeCtx.moveTo(x, y);
      } else {
        oscilloscopeCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    oscilloscopeCtx.stroke();
  }

  function startOscilloscope() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 8192;

    dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);

    // Create a gain node to control the audio input gain
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1; // Set the initial gain value

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const source = audioContext.createMediaStreamSource(stream);

      // Connect the source directly to the gain node
      source.connect(gainNode);

      // Connect the gain node to the analyser
      gainNode.connect(analyser);

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
        alert('Error attempting to enable fullscreen mode: ' + err.message);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Add event listeners for FFT Size and Gain controls
  const fftSizeInput = document.getElementById('fftSize');
  const gainInput = document.getElementById('gain');

  fftSizeInput.addEventListener('input', () => {
    const newFftSize = parseInt(fftSizeInput.value, 10);
    if (!isNaN(newFftSize)) {
      analyser.fftSize = newFftSize;
      dataArray = new Uint8Array(analyser.fftSize);
    }
  });

  gainInput.addEventListener('input', () => {
    const newGainValue = parseFloat(gainInput.value);
    if (!isNaN(newGainValue)) {
      gainNode.gain.value = newGainValue;
    }
  });

  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');

  startButton.addEventListener('click', startOscilloscope);
  stopButton.addEventListener('click', stopOscilloscope);
});
