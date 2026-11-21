import { FilesetResolver, PoseLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
const $ = id => document.getElementById(id);
let stream, landmarker, socket, loopId, startedAt, sessionTimer, breakTimer, breakSeconds=1200, lastBreak=1200, alertCooldown=0, deferredInstallPrompt;
const video=$('video'), canvas=$('overlay'), ctx=canvas.getContext('2d');
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2800)}
function setConnection(on){$('connection').textContent=on?'Connected':'Offline';document.querySelector('.live-dot').classList.toggle('active',on)}
async function connectSocket(){const protocol=location.protocol==='https:'?'wss':'ws';socket=new WebSocket(`${protocol}://${location.host}/ws/coach`);socket.onopen=()=>setConnection(true);socket.onclose=()=>setConnection(false);socket.onerror=()=>setConnection(false);socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.status==='ERROR')return;renderMetrics(d)}}
async function initPose(){const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');landmarker=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'GPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.5,minTrackingConfidence:.5});}
async function start(){try{$('startBtn').disabled=true;toast('Preparing your camera and posture coach…');stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'},audio:false});video.srcObject=stream;await video.play();$('cameraStage').classList.add('active');$('cameraPlaceholder').style.display='none';$('camStatus').textContent='● LIVE ANALYSIS';if(!landmarker)await initPose();await connectSocket();startedAt=Date.now();sessionTimer=setInterval(()=>{$('sessionTime').textContent=fmt(Math.floor((Date.now()-startedAt)/1000))},1000);loop();$('stopBtn').disabled=false;toast('You’re all set. Sit comfortably and keep both shoulders in view.')}catch(e){$('startBtn').disabled=false;toast(e.name==='NotAllowedError'?'Camera permission is needed to start.':'Could not start camera. Use HTTPS or localhost and check browser support.');console.error(e)}}
function loop(){if(!stream)return;if(video.readyState>=2&&landmarker){const result=landmarker.detectForVideo(video,performance.now());const points=result.landmarks?.[0];draw(points);if(points&&socket?.readyState===1){const indices=[0,11,12,23,24];socket.send(JSON.stringify({type:'POSE',landmarks:indices.map(index=>({index,x:points[index].x,y:points[index].y,visibility:points[index].visibility??1})),imageWidth:video.videoWidth,imageHeight:video.videoHeight}))}}loopId=requestAnimationFrame(loop)}
function draw(points){canvas.width=video.videoWidth||640;canvas.height=video.videoHeight||480;ctx.clearRect(0,0,canvas.width,canvas.height);if(!points)return;const a=points[11],b=points[12];ctx.lineWidth=4;ctx.strokeStyle='#b8f1d5';ctx.fillStyle='#b8f1d5';ctx.beginPath();ctx.moveTo(a.x*canvas.width,a.y*canvas.height);ctx.lineTo(b.x*canvas.width,b.y*canvas.height);ctx.stroke();[a,b].forEach(p=>{ctx.beginPath();ctx.arc(p.x*canvas.width,p.y*canvas.height,7,0,Math.PI*2);ctx.fill()})}
function renderMetrics(d){$('score').textContent=d.score??'—';$('scoreText').textContent=d.status==='WARNING'?'A small adjustment could help you feel better.':'Nice work. Keep that comfortable posture.';$('tilt').textContent=d.shoulderTiltDegrees??'—';$('tiltText').textContent=Math.abs(d.shoulderTiltDegrees??0)>8?'Shoulders look uneven':'Shoulders look balanced';$('distance').textContent=d.screenTooClose?'CLOSE':'GOOD';$('distanceText').textContent=d.screenTooClose?'Try moving your screen farther away':'Your framing looks comfortable';if(d.status==='WARNING'&&Date.now()-alertCooldown>45000){alertCooldown=Date.now();$('coachTip').textContent=d.message;if($('soundToggle').checked)beep();toast(d.message)}else if(d.status==='GOOD')$('coachTip').textContent='Great posture. Keep your shoulders relaxed and your feet supported.'}
function beep(){try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=660;g.gain.value=.06;o.start();o.stop(c.currentTime+.16)}catch{}}
function stop(){cancelAnimationFrame(loopId);clearInterval(sessionTimer);if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;$('cameraStage').classList.remove('active');$('cameraPlaceholder').style.display='flex';$('camStatus').textContent='● NOT ACTIVE';$('startBtn').disabled=false;$('stopBtn').disabled=true;if(socket){socket.close();socket=null}setConnection(false);ctx.clearRect(0,0,canvas.width,canvas.height);toast('Session ended. Nice work taking care of yourself.')}
function fmt(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function tickBreak(){breakSeconds--;if(breakSeconds<=0){breakSeconds=Number($('interval').value)*60;toast('Eye-rest time! Look 20 feet away for 20 seconds.');if($('soundToggle').checked)beep()}$('breakClock').textContent=fmt(breakSeconds)}
$('startBtn').onclick=start;$('stopBtn').onclick=stop;$('breakBtn').onclick=()=>{breakSeconds=Number($('interval').value)*60;$('breakClock').textContent=fmt(breakSeconds);toast('Break timer reset.')};$('interval').onchange=()=>{$('breakBtn').click()};breakTimer=setInterval(tickBreak,1000);$('settingsBtn').onclick=()=>{$('interval').focus();toast('Adjust your reminder preferences below.')};
window.addEventListener('beforeunload',stop);
fetch('/api/health').then(r=>r.json()).then(d=>console.info('ErgoGuard API:',d)).catch(()=>toast('Backend connection unavailable.'));

// Progressive Web App installation support.
const installButton = $('installBtn');
const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
if (installButton && isAppleMobile && !isStandalone) installButton.hidden = false;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installButton) installButton.hidden = false;
});
if (installButton) installButton.addEventListener('click', async () => {
  if (!deferredInstallPrompt) {
    toast(/iphone|ipad|ipod/i.test(navigator.userAgent)
      ? 'To install: tap Share in Safari, then Add to Home Screen.'
      : 'Use your browser menu and choose Install app or Add to Home Screen.');
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});
window.addEventListener('appinstalled', () => {
  if (installButton) installButton.hidden = true;
  toast('ErgoGuard AI has been installed.');
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(error => console.error('PWA service worker registration failed:', error));
  });
}
