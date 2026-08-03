const museum_shell = document.getElementById('museum_shell');
const light_cursor = document.getElementById('light_cursor');
const clock = document.getElementById('clock');
const detail_number = document.getElementById('detail_number');
const detail_title = document.getElementById('detail_title');
const detail_date = document.getElementById('detail_date');
const detail_copy = document.getElementById('detail_copy');
const detail_index = document.getElementById('detail_index');
const specimens = [
  ['月明かり','2024.04.12','窓辺に落ちた月のかけらを、朝までそっと眺めていた。'],
  ['雨上がり','2024.05.21','雨が止んだあと、世界の輪郭がすこしだけ、やわらかくなる。'],
  ['遠い音','2024.06.03','夜の向こうから聞こえた、名前のない音を覚えている。'],
  ['匂いの記憶','2024.06.18','風に混ざった草の匂いが、遠い季節を連れてきた。'],
  ['帰り道','2024.07.02','灯りをひとつずつ辿って、知らない道を帰った。'],
  ['眠れなかった夜','2024.08.09','眠れない夜には、静かなものの形がよく見える。'],
  ['ささやき','2024.09.14','誰にも届かないくらいの声で、明日のことを話した。']
];
function update_clock(){ clock.textContent = new Date().toLocaleTimeString('ja-JP',{hour12:false}).replaceAll(':',' : '); }
setInterval(update_clock,1000); update_clock();
specimens.forEach((item,index)=>{
  const specimen=document.createElement('button'); specimen.className='specimen'; specimen.type='button'; specimen.setAttribute('aria-label',`${item[0]}の標本を見る`);
  specimen.innerHTML=`<span class="specimen_label">${String(index+1).padStart(2,'0')} ${item[0]}</span>`;
  specimen.addEventListener('click',()=>{ detail_number.textContent=String(index+1).padStart(2,'0'); detail_title.textContent=item[0]; detail_date.textContent=item[1]; detail_copy.textContent=item[2]; detail_index.textContent=String(index+1).padStart(2,'0'); document.querySelectorAll('.specimen').forEach(el=>el.classList.remove('selected')); specimen.classList.add('selected'); });
  document.getElementById('specimens').appendChild(specimen);
});
document.getElementById('close_button').addEventListener('click',()=>document.querySelector('.specimen.selected')?.classList.remove('selected'));
museum_shell.addEventListener('pointermove',(event)=>{ light_cursor.style.left=`${event.clientX}px`; light_cursor.style.top=`${event.clientY}px`; });
