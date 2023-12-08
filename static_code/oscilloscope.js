const canvas = document.getElementById('oscilloscope');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let requestId; 

let analyser;
let dataArray;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

startButton.addEventListener('click', start); 
stopButton.addEventListener('click', stop);

const start = async () => {

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const audioCtx = new AudioContext();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.fftSize);

    const source = audioCtx.createMediaStreamSource(stream);

    source.connect(analyser);

    isDrawing = true;
    draw();

  } catch(err) {
    console.log('Could not get audio stream', err);
  }

};

function draw() {

  if(!isDrawing) 
    return;
    
  requestId = requestAnimationFrame(draw);

  analyser.getByteTimeDomainData(dataArray); 

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(0, 0, 0)';

  ctx.beginPath();
  
  const sliceWidth = canvas.width * 1.0 / analyser.fftSize;
  let x = 0;

  for(let i = 0; i < analyser.fftSize; i++) {

    const v = dataArray[i] / 128.0;
    let y = v * canvas.height / 2;

    if(i === 0)
      ctx.moveTo(x, y);
    else  
      ctx.lineTo(x, y);   

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height/2);

  ctx.stroke();  
}

function stop() { 
  
  if(!isDrawing)
    return;

  isDrawing = false;
  
  cancelAnimationFrame(requestId);
  
  analyser.disconnect();
}
