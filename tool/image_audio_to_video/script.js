const image_input = document.getElementById('image_input');
const audio_input = document.getElementById('audio_input');
const export_button = document.getElementById('export_button');
const play_button = document.getElementById('play_button');
const preview_canvas = document.getElementById('preview_canvas');
const canvas_context = preview_canvas.getContext('2d');
const empty_preview = document.getElementById('empty_preview');
const preview_frame = document.getElementById('preview_frame');
const export_status = document.getElementById('export_status');
const image_drop_zone = document.getElementById('image_drop_zone');
const audio_drop_zone = document.getElementById('audio_drop_zone');
let image_file = null;
let audio_file = null;
let image_object = null;
let audio_element = new Audio();
let animation_id = null;
let ffmpeg = null;
let ffmpeg_load_promise = null;

async function load_ffmpeg(){
  if(ffmpeg_load_promise)return ffmpeg_load_promise;
  if(!window.FFmpeg)throw new Error('MP4変換エンジンを読み込めませんでした。ネットワーク接続を確認してください');
  ffmpeg=window.FFmpeg.createFFmpeg({log:false});
  ffmpeg_load_promise=ffmpeg.load();
  await ffmpeg_load_promise;
  return ffmpeg;
}

function format_time(seconds){if(!Number.isFinite(seconds))return '00:00';return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`}
function update_state(){const ready=image_file&&audio_file;export_button.disabled=!ready;export_status.textContent=ready?'準備完了。動画を書き出せます':'画像と音声を追加してください'}
function draw_frame(){if(!image_object)return;const ratio=Math.max(preview_canvas.width/image_object.width,preview_canvas.height/image_object.height);const w=image_object.width*ratio,h=image_object.height*ratio;canvas_context.fillStyle='#07111a';canvas_context.fillRect(0,0,preview_canvas.width,preview_canvas.height);canvas_context.drawImage(image_object,(preview_canvas.width-w)/2,(preview_canvas.height-h)/2,w,h)}
function read_image(file){image_file=file;document.getElementById('image_name').textContent=file.name;image_drop_zone.classList.add('has_file');image_object=new Image();image_object.onload=()=>{draw_frame();empty_preview.style.display='none';preview_frame.classList.add('has_preview')};image_object.src=URL.createObjectURL(file);update_state()}
function read_audio(file){audio_file=file;document.getElementById('audio_name').textContent=file.name;audio_drop_zone.classList.add('has_file');audio_element.src=URL.createObjectURL(file);audio_element.load();audio_element.onloadedmetadata=()=>{document.getElementById('total_time').textContent=format_time(audio_element.duration);update_state()};update_state()}
image_input.addEventListener('change',()=>{if(image_input.files[0])read_image(image_input.files[0])});audio_input.addEventListener('change',()=>{if(audio_input.files[0])read_audio(audio_input.files[0])});
play_button.addEventListener('click',()=>{if(audio_element.paused){audio_element.play();play_button.textContent='Ⅱ'}else{audio_element.pause();play_button.textContent='▶'}});
audio_element.addEventListener('timeupdate',()=>{document.getElementById('current_time').textContent=format_time(audio_element.currentTime);document.getElementById('timeline_progress').style.width=`${(audio_element.currentTime/audio_element.duration)*100||0}%`});audio_element.addEventListener('ended',()=>{play_button.textContent='▶'});
export_button.addEventListener('click',async()=>{if(!image_file||!audio_file)return;export_button.disabled=true;document.getElementById('export_label').textContent='書き出し中…';export_status.textContent='音声の長さに合わせて動画を生成しています';try{const audio_context=new AudioContext();const source=audio_context.createMediaElementSource(audio_element);const destination=audio_context.createMediaStreamDestination();source.connect(destination);const canvas_stream=preview_canvas.captureStream(30);const stream=new MediaStream([...canvas_stream.getVideoTracks(),...destination.stream.getAudioTracks()]);const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus'});const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const finished=new Promise(resolve=>recorder.onstop=resolve);audio_element.currentTime=0;audio_element.play();recorder.start(250);const draw=()=>{draw_frame();if(!audio_element.paused){animation_id=requestAnimationFrame(draw)}};draw();audio_element.onended=()=>{recorder.stop();cancelAnimationFrame(animation_id);audio_element.pause()};await finished;const webm_blob=new Blob(chunks,{type:'video/webm'});let output_blob=webm_blob;let extension='webm';if(document.querySelector('input[name="format"]:checked').value==='mp4'){export_status.textContent='MP4へ変換しています。初回は少し時間がかかります';const engine=await load_ffmpeg();const input_name=`input_${Date.now()}.webm`;const output_name=`output_${Date.now()}.mp4`;engine.FS('writeFile',input_name,await window.FFmpeg.fetchFile(webm_blob));await engine.run('-i',input_name,'-c:v','libx264','-preset','veryfast','-crf','26','-pix_fmt','yuv420p','-movflags','+faststart','-c:a','aac','-b:a','128k',output_name);const data=engine.FS('readFile',output_name);output_blob=new Blob([data.buffer],{type:'video/mp4'});extension='mp4';try{engine.FS('unlink',input_name);engine.FS('unlink',output_name)}catch{}}const url=URL.createObjectURL(output_blob);const link=document.createElement('a');link.href=url;link.download=`${(image_file.name||'video').split('.')[0]}_video.${extension}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);source.disconnect();await audio_context.close();document.getElementById('export_label').textContent='動画を書き出す';export_status.textContent=`${extension.toUpperCase()}の書き出しが完了しました`}catch(error){console.error(error);export_status.textContent=error.message||'書き出しに失敗しました'}finally{export_button.disabled=false}});
