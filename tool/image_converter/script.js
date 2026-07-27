const file_input = document.getElementById('file_input');
const drop_zone = document.getElementById('drop_zone');
const image_list = document.getElementById('image_list');
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
  [...file_list].filter(file => file.type.startsWith('image/')).forEach(file => files.push({ file, url: URL.createObjectURL(file), image: null, rotation:0, flip_h:false, flip_v:false }));
  render_files();
}
function render_files() {
  image_list.querySelectorAll('.image_card').forEach(card => card.remove());
  empty_state.hidden = files.length > 0;
  files.forEach((item,index) => {
    const card=document.createElement('article'); card.className='image_card'; card.dataset.index=index;
    card.innerHTML=`<div class="preview_frame"><img src="${item.url}" alt="${item.file.name}"></div><div class="card_info"><strong class="card_name" title="${item.file.name}">${item.file.name}</strong><div class="card_meta"><span>${format_bytes(item.file.size)}</span><span>${item.file.type.replace('image/','').toUpperCase()}</span></div><button class="remove_card" type="button">削除</button></div>`;
    card.querySelector('.remove_card').addEventListener('click',()=>{URL.revokeObjectURL(item.url);files.splice(index,1);render_files();});
    card.addEventListener('click',()=>{active_image=item;}); image_list.append(card);
  });
  $('stat_count').textContent=files.length; $('stat_input_size').textContent=format_bytes(files.reduce((sum,item)=>sum+item.file.size,0)); convert_button.disabled=!files.length;
}
function read_image(item) { return new Promise((resolve,reject)=>{ if(item.image) return resolve(item.image); const image=new Image(); image.onload=()=>{item.image=image;resolve(image)};image.onerror=reject;image.src=item.url; }); }
function get_settings(){return {mime:$('format_select').value,quality:Number($('quality_input').value)/100,width:Number($('width_input').value)||null,height:Number($('height_input').value)||null,lock:$('aspect_lock').checked,brightness:Number($('brightness_input').value),contrast:Number($('contrast_input').value),saturation:Number($('saturation_input').value),crop:$('crop_toggle').checked};}
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
function render_results(){result_list.innerHTML='';const before=files.reduce((sum,item)=>sum+item.file.size,0),after=results.reduce((sum,item)=>sum+item.blob.size,0);$('stat_output_size').textContent=format_bytes(after);$('stat_difference').textContent=`${after<=before?'−':''}${format_bytes(Math.abs(before-after))}`;$('result_summary').textContent=`${format_bytes(before)} → ${format_bytes(after)}`;results.forEach(result=>{const row=document.createElement('div');row.className='result_row';row.innerHTML=`<img class="result_thumb" src="${result.url}" alt=""><span title="${result.name}">${result.name}</span><small>${format_bytes(result.blob.size)}</small><a class="download_link" href="${result.url}" download="${result.name}">保存</a>`;result_list.append(row);});}

file_input.addEventListener('change',e=>add_files(e.target.files));
['dragenter','dragover'].forEach(event=>drop_zone.addEventListener(event,e=>{e.preventDefault();drop_zone.classList.add('is_dragging')}));['dragleave','drop'].forEach(event=>drop_zone.addEventListener(event,e=>{e.preventDefault();drop_zone.classList.remove('is_dragging')}));drop_zone.addEventListener('drop',e=>add_files(e.dataTransfer.files));
$('clear_button').addEventListener('click',()=>{files.splice(0).forEach(item=>URL.revokeObjectURL(item.url));results.splice(0).forEach(item=>URL.revokeObjectURL(item.url));render_files();result_panel.hidden=true;set_status('');$('stat_output_size').textContent='—';$('stat_difference').textContent='—';});
convert_button.addEventListener('click',convert);$('download_all_button').addEventListener('click',async()=>{if(!results.length)return;const zip=new JSZip();results.forEach(result=>zip.file(result.name,result.blob));const blob=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='converted-images.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('quality_input').addEventListener('input',e=>$('quality_value').textContent=`${e.target.value}%`);[['brightness','0'],['contrast','0'],['saturation','0']].forEach(([name])=>$(name+'_input').addEventListener('input',e=>$(name+'_value').textContent=e.target.value));
$('width_input').addEventListener('input',()=>{if(!$('aspect_lock').checked||!active_image?.image)return;const image=active_image.image;if($('width_input').value)$('height_input').value=Math.round(Number($('width_input').value)*image.naturalHeight/image.naturalWidth)});$('height_input').addEventListener('input',()=>{if(!$('aspect_lock').checked||!active_image?.image)return;const image=active_image.image;if($('height_input').value)$('width_input').value=Math.round(Number($('height_input').value)*image.naturalWidth/image.naturalHeight)});
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{if(!active_image){set_status('先にプレビュー画像を選択してください。',true);return}const action=button.dataset.action;if(action==='rotate_left')active_image.rotation-=90;if(action==='rotate_right')active_image.rotation+=90;if(action==='flip_h')active_image.flip_h=!active_image.flip_h;if(action==='flip_v')active_image.flip_v=!active_image.flip_v;set_status(`${active_image.file.name} の変換設定を更新しました。`);}));
