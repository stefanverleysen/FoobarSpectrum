class VisualizerController {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.animationId = null;
        this.barCount = 50;
        this.backgroundColor = '#000';
        this.dataArray = null;
        this.sensitivity = 1;
        this.currentTheme = 'cyberpunk';
        this.themes = {
            cyberpunk: ["#FF00FF", "#00FFFF", "#00FF00", "#FF0000", "#FFFF00"],
            retro: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA"],
            neon: ["#FF00FF", "#00FFFF", "#FF00AA", "#AA00FF", "#FF3300"],
            pastel: ["#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA", "#FFDFBA"],
            calm: this.createCalmGradient(),
            primary: ["#FF0000", "#00FF00", "#0000FF"]
        };
        this.setupEventListeners();
        this.resizeCanvas();
    }

    createCalmGradient() {
        const gradient = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#8e9eab');
        gradient.addColorStop(1, '#eef2f3');
        return gradient;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.getElementById('startVisualization').addEventListener('click', () => this.start());
        document.getElementById('stopVisualization').addEventListener('click', () => this.stop());
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('barCountSlider').addEventListener('input', (e) => this.updateBarCount(e.target.value));
        document.getElementById('smoothingSlider').addEventListener('input', (e) => this.updateSmoothing(e.target.value));
        document.getElementById('sensitivitySlider').addEventListener('input', (e) => this.updateSensitivity(e.target.value));
        this.canvas.addEventListener('dblclick', () => this.toggleFullscreen());
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());

        const settingsButton = document.getElementById('toggleSettings');
        const settingsDiv = document.getElementById('settings');

        settingsButton.addEventListener('click', () => {
            if (settingsDiv.classList.contains('hidden')) {
                settingsDiv.classList.remove('hidden');
            } else {
                settingsDiv.classList.add('hidden');
            }
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (document.fullscreenElement) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
        this.themes.calm = this.createCalmGradient();
        if (this.animationId) {
            this.draw();
        }
    }

    onFullscreenChange() {
        this.resizeCanvas();
        if (!document.fullscreenElement) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }

    start() {
        if (!navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support getUserMedia API');
            return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.smoothingTimeConstant = parseFloat(document.getElementById('smoothingSlider').value);
            this.microphone.connect(this.analyser);
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.animate();
        }).catch(error => {
            console.error('Error accessing microphone:', error);
            alert('Error accessing microphone: ' + error.message);
        });
    }

    stop() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.draw();
    }

    draw() {
        this.analyser.getByteFrequencyData(this.dataArray);
        
        this.canvasCtx.fillStyle = this.backgroundColor;
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const barWidth = this.canvas.width / this.barCount;
        
        for (let i = 0; i < this.barCount; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height * this.sensitivity;
            const x = i * barWidth;
            const y = this.canvas.height - barHeight;
            
            if (this.currentTheme === 'calm') {
                this.canvasCtx.fillStyle = this.themes.calm;
            } else if (this.currentTheme === 'primary') {
                this.canvasCtx.fillStyle = this.themes.primary[i % 3];
            } else {
                this.canvasCtx.fillStyle = this.getRandomThemeColor();
            }
            this.canvasCtx.fillRect(x, y, barWidth, barHeight);
        }
    }

    getRandomThemeColor() {
        const colors = this.themes[this.currentTheme];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    changeTheme(theme) {
        this.currentTheme = theme;
    }

    toggleFullscreen() {
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (!fullscreenElement) {
            if (this.canvas.requestFullscreen) {
                this.canvas.requestFullscreen();
            } else if (this.canvas.webkitRequestFullscreen) { /* Safari */
                this.canvas.webkitRequestFullscreen();
            } else if (this.canvas.mozRequestFullScreen) { /* Firefox */
                this.canvas.mozRequestFullScreen();
            } else if (this.canvas.msRequestFullscreen) { /* IE/Edge */
                this.canvas.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
    }

    updateBarCount(value) {
        this.barCount = parseInt(value, 10);
        document.getElementById('barCountValue').textContent = value;
    }

    updateSmoothing(value) {
        if (this.analyser) {
            this.analyser.smoothingTimeConstant = parseFloat(value);
        }
        document.getElementById('smoothingValue').textContent = value;
    }

    updateSensitivity(value) {
        this.sensitivity = parseFloat(value);
        document.getElementById('sensitivityValue').textContent = value;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new VisualizerController(document.getElementById('audioVisualizerCanvas'));

    const settingsButton = document.getElementById('toggleSettings');
    const settingsDiv = document.getElementById('settings');

    settingsButton.addEventListener('click', () => {
        if (settingsDiv.classList.contains('hidden')) {
            settingsDiv.classList.remove('hidden');
        } else {
            settingsDiv.classList.add('hidden');
        }
    });
});
