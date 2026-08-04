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
let mediabunny_promise = null;

function format_time(seconds){if(!Number.isFinite(seconds))return '00:00';return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`}
function update_state(){const ready=image_file&&audio_file;export_button.disabled=!ready;export_status.textContent=ready?'準備完了。MP4を書き出せます':'画像と音声を追加してください'}
function draw_frame(){if(!image_object)return;const ratio=Math.max(preview_canvas.width/image_object.width,preview_canvas.height/image_object.height);const w=image_object.width*ratio,h=image_object.height*ratio;canvas_context.fillStyle='#07111a';canvas_context.fillRect(0,0,preview_canvas.width,preview_canvas.height);canvas_context.drawImage(image_object,(preview_canvas.width-w)/2,(preview_canvas.height-h)/2,w,h)}
function read_image(file){image_file=file;document.getElementById('image_name').textContent=file.name;image_drop_zone.classList.add('has_file');image_object=new Image();image_object.onload=()=>{draw_frame();empty_preview.style.display='none';preview_frame.classList.add('has_preview')};image_object.src=URL.createObjectURL(file);update_state()}
function read_audio(file){audio_file=file;document.getElementById('audio_name').textContent=file.name;audio_drop_zone.classList.add('has_file');audio_element.src=URL.createObjectURL(file);audio_element.load();audio_element.onloadedmetadata=()=>{document.getElementById('total_time').textContent=format_time(audio_element.duration);update_state()};update_state()}
async function load_mediabunny(){if(!mediabunny_promise)mediabunny_promise=import('https://cdn.jsdelivr.net/npm/mediabunny@1.31.0/+esm');return mediabunny_promise}
image_input.addEventListener('change',()=>{if(image_input.files[0])read_image(image_input.files[0])});audio_input.addEventListener('change',()=>{if(audio_input.files[0])read_audio(audio_input.files[0])});
play_button.addEventListener('click',()=>{if(audio_element.paused){audio_element.play();play_button.textContent='Ⅱ'}else{audio_element.pause();play_button.textContent='▶'}});
audio_element.addEventListener('timeupdate',()=>{document.getElementById('current_time').textContent=format_time(audio_element.currentTime);document.getElementById('timeline_progress').style.width=`${(audio_element.currentTime/audio_element.duration)*100||0}%`});audio_element.addEventListener('ended',()=>{play_button.textContent='▶'});
export_button.addEventListener('click',async()=>{if(!image_file||!audio_file)return;export_button.disabled=true;document.getElementById('export_label').textContent='書き出し中…';export_status.textContent='MP4エンジンを準備しています';try{const{Output,Mp4OutputFormat,BufferTarget,CanvasSource,AudioBufferSource,QUALITY_HIGH}=await load_mediabunny();const audio_context=new AudioContext();const audio_buffer=await audio_context.decodeAudioData(await audio_file.arrayBuffer());const output=new Output({format:new Mp4OutputFormat(),target:new BufferTarget()});const video_source=new CanvasSource(preview_canvas,{codec:'avc',bitrate:QUALITY_HIGH});const audio_source=new AudioBufferSource({codec:'aac',bitrate:QUALITY_HIGH});output.addVideoTrack(video_source);output.addAudioTrack(audio_source);await output.start();const duration=audio_buffer.duration;const frame_duration=1/30;for(let time=0;time<duration;time+=frame_duration){draw_frame();await video_source.add(time,Math.min(frame_duration,duration-time));if(time%1<frame_duration)export_status.textContent=`MP4を書き出し中… ${Math.round(time/duration*100)}%`}await audio_source.add(audio_buffer);await output.finalize();const blob=new Blob([output.target.buffer],{type:'video/mp4'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`${(image_file.name||'video').split('.')[0]}_video.mp4`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);await audio_context.close();document.getElementById('export_label').textContent='動画を書き出す';export_status.textContent='MP4の書き出しが完了しました'}catch(error){console.error(error);export_status.textContent=`書き出しに失敗しました: ${error.message||'変換エラー'}`}finally{export_button.disabled=false}});
