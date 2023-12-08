document.addEventListener('DOMContentLoaded', () => {

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
   
  analyser = audioContext.createAnalyser();
   
  analyser.fftSize = 8192;
   
  dataArray = new Uint8Array(analyser.fftSize);

  isDrawing = false;
 
  drawVisual;

  oscilloscopeCanvas = document.getElementById('oscilloscopeCanvas');
   
  oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');

  dpr = window.devicePixelRatio || 1;

  oscilloscopeCanvas.width = oscilloscopeCanvas.offsetWidth * dpr;
   
  oscilloscopeCanvas.height = oscilloscopeCanvas.offsetHeight * dpr;

  oscilloscopeCtx.scale(dpr, dpr);
  
  lineThickness = 2;

  function getRandomCyberpunkColor() {

    colors = ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000","#FFFF00"];

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
      var y = v * oscilloscopeCanvas.height; 

      if (i === 0) {
      
        oscilloscopeCtx.moveTo(x, y);
      
      } else {

        oscilloscopeCtx.lineTo(x, y);

      }

      x += sliceWidth;
    }

    oscilloscopeCtx.lineTo(oscilloscopeCanvas.width, oscilloscopeCanvas.height/2);
    
    oscilloscopeCtx.stroke();

  }


});
