class OscilloscopeController {
  constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.audioContext = null;
      this.analyser = null;
      this.dataArray = null;
      this.isDrawing = false;
      this.drawVisual = null;
      this.gain = 5;
      this.fftSize = 8192;
      this.currentTheme = 'cyberpunk';
      this.themes = {
          cyberpunk: "#00FFFF",
          retro: "#4ECDC4",
          neon: "#FF00FF",
          pastel: "#BAE1FF"
      };
      this.setupEventListeners();
      this.resizeCanvas();
  }

  setupEventListeners() {
      window.addEventListener('resize', () => this.resizeCanvas());
      
      const startButton = document.getElementById('startButton');
      const stopButton = document.getElementById('stopButton');
      const themeSelect = document.getElementById('themeSelect');
      const gainSlider = document.getElementById('gainSlider');
      const fftSizeSlider = document.getElementById('fftSizeSlider');
      const visualizerContainer = document.getElementById('visualizer-container');

      if (startButton) startButton.addEventListener('click', () => this.start());
      if (stopButton) stopButton.addEventListener('click', () => this.stop());
      if (themeSelect) themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
      if (gainSlider) gainSlider.addEventListener('input', (e) => this.updateGain(e.target.value));
      if (fftSizeSlider) fftSizeSlider.addEventListener('input', (e) => this.updateFFTSize(e.target.value));
      if (visualizerContainer) visualizerContainer.addEventListener('dblclick', () => this.toggleFullscreen());

      console.log('Event listeners set up');
  }

  resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      if (this.isDrawing) this.draw();
  }

  async start() {
      console.log('Start button clicked');
      try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) {
              throw new Error('Web Audio API is not supported in this browser.');
          }

          this.audioContext = new AudioContext();
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = this.fftSize;
          this.dataArray = new Uint8Array(this.analyser.fftSize);

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = this.audioContext.createMediaStreamSource(stream);
          source.connect(this.analyser);
          
          this.isDrawing = true;
          this.draw();
          console.log('Oscilloscope started successfully');
      } catch (err) {
          console.error('Error starting oscilloscope:', err);
          alert('Error starting oscilloscope: ' + err.message);
      }
  }

  stop() {
      console.log('Stop button clicked');
      if (!this.isDrawing) return;
      this.isDrawing = false;
      cancelAnimationFrame(this.drawVisual);
      if (this.audioContext) {
          this.audioContext.close().then(() => {
              console.log('Audio context closed');
              this.audioContext = null;
              this.analyser = null;
          }).catch(err => console.error('Error closing audio context:', err));
      }
  }

  draw() {
      if (!this.isDrawing) return;
      this.drawVisual = requestAnimationFrame(() => this.draw());

      if (!this.analyser || !this.dataArray) {
          console.error('Analyser or dataArray is not initialized');
          return;
      }

      this.analyser.getByteTimeDomainData(this.dataArray);
      this.ctx.fillStyle = 'rgb(0, 0, 0)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = this.themes[this.currentTheme];
      this.ctx.beginPath();

      const sliceWidth = this.canvas.width / this.dataArray.length;
      let x = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
          const v = (this.dataArray[i] / 128.0) * this.gain;
          const y = v * this.canvas.height / 2;

          if (i === 0) {
              this.ctx.moveTo(x, y);
          } else {
              this.ctx.lineTo(x, y);
          }

          x += sliceWidth;
      }

      this.ctx.stroke();
  }

  changeTheme(theme) {
      console.log('Theme changed to:', theme);
      this.currentTheme = theme;
  }

  toggleFullscreen() {
      console.log('Fullscreen toggled');
      const container = document.getElementById('visualizer-container');
      if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => {
              console.error('Error attempting to enable fullscreen:', err);
          });
      } else {
          document.exitFullscreen().catch(err => {
              console.error('Error attempting to exit fullscreen:', err);
          });
      }
  }

  updateGain(value) {
      console.log('Gain updated to:', value);
      this.gain = parseFloat(value);
  }

  updateFFTSize(value) {
      console.log('FFT size updated to:', Math.pow(2, parseInt(value)));
      this.fftSize = Math.pow(2, parseInt(value));
      if (this.analyser) {
          this.analyser.fftSize = this.fftSize;
          this.dataArray = new Uint8Array(this.analyser.fftSize);
      }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  const canvas = document.getElementById('oscilloscopeCanvas');
  if (canvas) {
      new OscilloscopeController(canvas);
  } else {
      console.error('Canvas element not found');
  }
});