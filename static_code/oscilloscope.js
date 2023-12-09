<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foobar Oscilloscope</title>
    <link rel="stylesheet" href="styles.css">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-01JKEKRL8S"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', 'G-01JKEKRL8S');
    </script>
</head>

<body>
    <div id="container">
        <header>
            <img src="Foobarspectrumlogo2.png" alt="Foobar Spectrum Logo" id="logo">
            <nav>
                <a href="index.html" id="foobar-title">Foobar Spectrum</a>
            </nav>
        </header>
        <main>
            <div id="visualizer-container">
                <canvas id="oscilloscopeCanvas" style="width: 100%; height: 65vh;"></canvas>
                <div id="controls" class="card">
                    <!-- Start, Stop, and Fullscreen buttons -->
                    <div id="basicControls">
                        <button id="startButton">Start</button>
                        <button id="stopButton">Stop</button>
                        <button id="fullscreenButton">Fullscreen</button>
                    </div>
                    <div class="control-card">
                        <label for="fftSize">FFT Size:</label>
                        <input type="range" id="fftSize" min="32" max="8192" step="32" value="8192">
                        <br>
                        <label for="gain">Gain:</label>
                        <input type="range" id="gain" min="1" max="10" step="0.1" value="5">
                    </div>
                </div>
            </div>
        </main>
        <footer>
            <p>&copy; 2023 Foobar Spectrum by <a href="https://asan.digital" target="_blank">Asan Digital</a></p>
        </footer>
    </div>
    <script>
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
            var centerY = oscilloscopeCanvas.height / 2; // Calculate centerY

            for (var i = 0; i < dataArray.length; i++) {
              var v = dataArray[i] / 128.0;
              var y = v * oscilloscopeCanvas.height / 2;

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

        });
    </script>
</body>
</html>
