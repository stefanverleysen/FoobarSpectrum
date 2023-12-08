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
      var y = (1 - v) * oscilloscopeCanvas.height; // Use the full canvas height

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

});
