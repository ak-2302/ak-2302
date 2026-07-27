const file_input = document.getElementById('file_input');
const drop_zone = document.getElementById('drop_zone');
const empty_state = document.getElementById('empty_state');
const convert_button = document.getElementById('convert_button');
const result_panel = document.getElementById('result_panel');
const result_list = document.getElementById('result_list');
const status_message = document.getElementById('status_message');
const files = [];
const results = [];
let active_image = null;

const $ = (id) => document.getElementById(id);
const format_bytes = (bytes) => { if (!bytes) return '0 B'; const units=['B','KB','MB','GB']; const i=Math.min(Math.floor(Math.log(bytes)/Math.log(1024)),units.length-1); return `${(bytes/1024**i).toFixed(i ? 1 : 0)} ${units[i]}`; };
const extension_for = (mime) => ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[mime] || 'png');
const set_status = (message, error=false) => { status_message.textContent=message; status_message.classList.toggle('error',error); };

function add_files(file_list) {
  const file = [...file_list].find(candidate => candidate.type.startsWith('image/'));
  if (!file) return;
  files.splice(0).forEach(item => URL.revokeObjectURL(item.url));
  files.push({ file, url: URL.createObjectURL(file), image: null, rotation:0, flip_h:false, flip_v:false, zoom:1, pan_x:0, pan_y:0 });
  render_files();
}
function render_files() {
  const item = files[0];
  empty_state.hidden = Boolean(item);
  canvas_stage?.classList.toggle('has_image', Boolean(item));
  $('canvas_image').hidden = !item;
  if (item) {
    $('canvas_image').src = item.url;
    $('canvas_file_name').textContent = item.file.name;
    $('canvas_size').textContent = format_bytes(item.file.size);
    $('canvas_image').onload = () => { $('canvas_dimensions').textContent = `${$('canvas_image').naturalWidth} × ${$('canvas_image').naturalHeight}px`; item.image = $('canvas_image'); update_preview(); };
    active_image = item;
  } else { $('canvas_file_name').textContent='未選択'; $('canvas_dimensions').textContent='—'; $('canvas_size').textContent='—'; active_image=null; }
  convert_button.disabled=!files.length;
}
function read_image(item) { return new Promise((resolve,reject)=>{ if(item.image) return resolve(item.image); const image=new Image(); image.onload=()=>{item.image=image;resolve(image)};image.onerror=reject;image.src=item.url; }); }
function get_settings(){return {mime:$('format_select').value,quality:Number($('quality_input').value)/100,width:Number($('width_input').value)||null,height:Number($('height_input').value)||null,lock:$('aspect_lock').checked,brightness:Number($('brightness_input').value),contrast:Number($('contrast_input').value),saturation:Number($('saturation_input').value),crop:$('crop_toggle').checked};}
function update_preview(){const image=$('canvas_image');if(!active_image||image.hidden)return;const settings=get_settings();image.style.filter=`brightness(${100+settings.brightness}%) contrast(${100+settings.contrast}%) saturate(${100+settings.saturation}%) drop-shadow(0 14px 20px #0008)`;image.style.transform=`translate(${active_image.pan_x}px,${active_image.pan_y}px) rotate(${active_image.rotation}deg) scale(${active_image.zoom*(active_image.flip_h?-1:1)},${active_image.zoom*(active_image.flip_v?-1:1)})`;image.classList.toggle('preview_crop',settings.crop);if(settings.width||settings.height){const natural_width=image.naturalWidth,natural_height=image.naturalHeight;let width=settings.width,height=settings.height;if(width&&!height&&settings.lock)height=Math.round(width*natural_height/natural_width);if(height&&!width&&settings.lock)width=Math.round(height*natural_width/natural_height);image.style.width=width?`${width}px`:'';image.style.height=height?`${height}px`:'';}else{image.style.width='';image.style.height='';}}
function canvas_for(image,item,settings){
  let source_w=image.naturalWidth, source_h=image.naturalHeight;
  if(settings.crop){const side=Math.min(source_w,source_h);const sx=(source_w-side)/2,sy=(source_h-side)/2;const crop=document.createElement('canvas');crop.width=side;crop.height=side;crop.getContext('2d').drawImage(image,sx,sy,side,side,0,0,side,side);image=crop;source_w=side;source_h=side;}
  const quarter=(item.rotation%360+360)%360/90; const swapped=quarter%2===1; let width=settings.width||(swapped?source_h:source_w); let height=settings.height||(swapped?source_w:source_h);
  if(settings.width&&!settings.height&&settings.lock) height=Math.round(width*(source_h/source_w)); if(settings.height&&!settings.width&&settings.lock) width=Math.round(height*(source_w/source_h));
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');
  ctx.save();ctx.translate(width/2,height/2);ctx.rotate(item.rotation*Math.PI/180);ctx.scale(item.flip_h?-1:1,item.flip_v?-1:1);ctx.filter=`brightness(${100+settings.brightness}%) contrast(${100+settings.contrast}%) saturate(${100+settings.saturation}%)`;
  const draw_w=swapped?height:width,draw_h=swapped?width:height;ctx.drawImage(image,-draw_w/2,-draw_h/2,draw_w,draw_h);ctx.restore();return canvas;
}
function canvas_blob(canvas,mime,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('このブラウザでは形式に対応していません')),mime,quality));}
async function convert(){
  if(!files.length)return; const settings=get_settings(); results.length=0; convert_button.disabled=true; result_list.innerHTML=''; result_panel.hidden=false; set_status('変換しています…');
  try { for(let i=0;i<files.length;i++){const item=files[i];const image=await read_image(item);const canvas=canvas_for(image,item,settings);const blob=await canvas_blob(canvas,settings.mime,settings.quality);const base=item.file.name.replace(/\.[^.]+$/,'');results.push({blob,name:`${base}.${extension_for(settings.mime)}`,source:item.file.name,url:URL.createObjectURL(blob)});} render_results();set_status(`${results.length}枚の変換が完了しました。`); }
  catch(error){set_status(error.message,true);} finally{convert_button.disabled=false;}
}
function render_results(){result_list.innerHTML='';const before=files.reduce((sum,item)=>sum+item.file.size,0),after=results.reduce((sum,item)=>sum+item.blob.size,0);$('result_summary').textContent=`${format_bytes(before)} → ${format_bytes(after)}`;results.forEach(result=>{const row=document.createElement('div');row.className='result_row';row.innerHTML=`<img class="result_thumb" src="${result.url}" alt=""><span title="${result.name}">${result.name}</span><small>${format_bytes(result.blob.size)}</small><a class="download_link" href="${result.url}" download="${result.name}">保存</a>`;result_list.append(row);});}

file_input.addEventListener('change',e=>add_files(e.target.files));
const canvas_stage = document.getElementById('canvas_stage');
canvas_stage.addEventListener('click', () => { if (!files.length) file_input.click(); });
canvas_stage.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !files.length) { event.preventDefault(); file_input.click(); } });
['dragenter','dragover'].forEach(event=>canvas_stage.addEventListener(event,e=>{e.preventDefault();canvas_stage.classList.add('is_dragging')}));
['dragleave','drop'].forEach(event=>canvas_stage.addEventListener(event,e=>{e.preventDefault();canvas_stage.classList.remove('is_dragging')}));
canvas_stage.addEventListener('drop',e=>{ if (!files.length) add_files(e.dataTransfer.files); });
let pointer_drag=null;let pinch_state=null;
function distance_between(first,second){return Math.hypot(first.clientX-second.clientX,first.clientY-second.clientY);}
function set_zoom(value){if(!active_image)return;active_image.zoom=Math.min(4,Math.max(.25,value));update_preview();}
canvas_stage.addEventListener('pointerdown',event=>{if(!active_image)return;event.preventDefault();canvas_stage.setPointerCapture(event.pointerId);pointer_drag={pointer_id:event.pointerId,start_x:event.clientX,start_y:event.clientY,pan_x:active_image.pan_x,pan_y:active_image.pan_y};});
canvas_stage.addEventListener('pointermove',event=>{if(!pointer_drag||pointer_drag.pointer_id!==event.pointerId||!active_image)return;event.preventDefault();active_image.pan_x=pointer_drag.pan_x+event.clientX-pointer_drag.start_x;active_image.pan_y=pointer_drag.pan_y+event.clientY-pointer_drag.start_y;update_preview();});
['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas_stage.addEventListener(type,()=>{pointer_drag=null;}));
canvas_stage.addEventListener('wheel',event=>{if(!active_image)return;event.preventDefault();set_zoom(active_image.zoom*(event.deltaY>0?.9:1.1));},{passive:false});
canvas_stage.addEventListener('touchstart',event=>{if(event.touches.length===2&&active_image){event.preventDefault();pinch_state={distance:distance_between(event.touches[0],event.touches[1]),zoom:active_image.zoom};}},{passive:false});
canvas_stage.addEventListener('touchmove',event=>{if(event.touches.length===2&&pinch_state&&active_image){event.preventDefault();set_zoom(pinch_state.zoom*distance_between(event.touches[0],event.touches[1])/pinch_state.distance);}},{passive:false});
canvas_stage.addEventListener('touchend',event=>{if(event.touches.length<2)pinch_state=null;});
const settings_panel = document.getElementById('settings_panel');
const tool_popover = document.getElementById('tool_popover');
const tool_buttons = [...document.querySelectorAll('.tool_menu_button')];
const tool_panels = [...document.querySelectorAll('.tool_panel')];
function close_tool_menu(){ tool_popover.hidden=true; tool_buttons.forEach(button=>button.setAttribute('aria-expanded','false')); }
tool_buttons.forEach(button=>button.addEventListener('click', event=>{
  event.stopPropagation();
  const panel_name=button.dataset.tool;
  const is_open=!tool_popover.hidden && tool_popover.querySelector(`[data-panel="${panel_name}"]`)?.hidden===false;
  tool_panels.forEach(panel=>panel.hidden=panel.dataset.panel!==panel_name);
  tool_popover.hidden=is_open;
  tool_buttons.forEach(item=>item.setAttribute('aria-expanded',String(!is_open && item===button)));
}));
tool_panels.forEach(panel=>panel.addEventListener('click',event=>event.stopPropagation()));
document.addEventListener('click', event=>{ if(!settings_panel.contains(event.target)) close_tool_menu(); });
tool_panels.forEach(panel=>panel.hidden=true);
$('clear_button').addEventListener('click',()=>{files.splice(0).forEach(item=>URL.revokeObjectURL(item.url));results.splice(0).forEach(item=>URL.revokeObjectURL(item.url));render_files();result_panel.hidden=true;set_status('');});
convert_button.addEventListener('click',convert);$('download_all_button').addEventListener('click',async()=>{if(!results.length)return;const zip=new JSZip();results.forEach(result=>zip.file(result.name,result.blob));const blob=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='converted-images.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('quality_input').addEventListener('input',e=>{$('quality_value').textContent=`${e.target.value}%`;update_preview();});[['brightness','0'],['contrast','0'],['saturation','0']].forEach(([name])=>$(name+'_input').addEventListener('input',e=>{$(name+'_value').textContent=e.target.value;update_preview();}));
$('width_input').addEventListener('input',()=>{if(active_image?.image&&$('aspect_lock').checked&&$('width_input').value)$('height_input').value=Math.round(Number($('width_input').value)*active_image.image.naturalHeight/active_image.image.naturalWidth);update_preview();});$('height_input').addEventListener('input',()=>{if(active_image?.image&&$('aspect_lock').checked&&$('height_input').value)$('width_input').value=Math.round(Number($('height_input').value)*active_image.image.naturalWidth/active_image.image.naturalHeight);update_preview();});$('aspect_lock').addEventListener('change',update_preview);$('crop_toggle').addEventListener('change',update_preview);
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{if(!active_image){set_status('先にプレビュー画像を選択してください。',true);return}const action=button.dataset.action;if(action==='rotate_left')active_image.rotation-=90;if(action==='rotate_right')active_image.rotation+=90;if(action==='flip_h')active_image.flip_h=!active_image.flip_h;if(action==='flip_v')active_image.flip_v=!active_image.flip_v;update_preview();set_status(`${active_image.file.name} の変換設定を更新しました。`);}));
