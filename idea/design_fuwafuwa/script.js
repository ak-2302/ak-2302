const bubble_field = document.getElementById('bubble_field');
const bubble_count = document.getElementById('bubble_count');
const add_button = document.getElementById('add_button');
const page_shell = document.querySelector('.page_shell');
const arrival_screen = document.getElementById('arrival_screen');
const return_button = document.getElementById('return_button');

const palette = [
  ['#dcecff', '#b8d8fc'], ['#f9dbe9', '#f2b3d1'], ['#e9e0ff', '#d0bdf7'],
  ['#fff0cb', '#f6d78e'], ['#ddf2eb', '#b9dfd1']
];
const bubbles = [];
let next_id = 0;
let last_time = performance.now();
let quiet_time = 0;

function create_bubble(size = 6 + Math.random() * 5, angle = Math.random() * Math.PI * 2, distance = 14 + Math.random() * 32) {
  const [light, edge] = palette[Math.floor(Math.random() * palette.length)];
  const element = document.createElement('div');
  element.className = 'bubble';
  element.style.width = `${size}%`;
  element.style.aspectRatio = '1';
  element.style.background = `radial-gradient(circle at 34% 25%, rgba(255,255,255,.86) 0 7%, ${light} 38%, ${edge} 100%)`;
  element.setAttribute('aria-label', '泡');
  bubble_field.appendChild(element);
  const bubble = { element, x: 50 + Math.cos(angle) * distance, y: 50 + Math.sin(angle) * distance, vx: 0, vy: 0, radius: size / 2, id: next_id++ };
  element.style.left = `${bubble.x}%`;
  element.style.top = `${bubble.y}%`;
  bubbles.push(bubble);
  setup_drag(bubble);
}

function setup_drag(bubble) {
  let pointer = null;
  let moved = false;
  bubble.element.addEventListener('pointerdown', (event) => {
    quiet_time = 0;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    moved = false;
    bubble.element.setPointerCapture(event.pointerId);
    bubble.element.classList.add('dragging');
  });
  bubble.element.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 4) moved = true;
    const rect = bubble_field.getBoundingClientRect();
    bubble.x += (event.clientX - pointer.x) / rect.width * 100;
    bubble.y += (event.clientY - pointer.y) / rect.height * 100;
    bubble.vx = bubble.vy = 0;
    pointer.x = event.clientX; pointer.y = event.clientY;
  });
  bubble.element.addEventListener('pointerup', () => {
    const was_click = pointer && !moved;
    pointer = null; bubble.element.classList.remove('dragging');
    if (was_click) burst_bubble(bubble);
  });
}

function burst_bubble(bubble) {
  if (page_shell.classList.contains('is_transitioning')) return;
  const bubble_index = bubbles.indexOf(bubble);
  if (bubble_index !== -1) bubbles.splice(bubble_index, 1);
  bubble.element.style.pointerEvents = 'none';
  bubble.element.classList.add('bursting');
  bubble_count.textContent = bubbles.length;
  page_shell.classList.add('is_transitioning');
  window.setTimeout(() => {
    arrival_screen.classList.add('is_visible');
    arrival_screen.setAttribute('aria-hidden', 'false');
  }, 650);
}

function reset_page() {
  arrival_screen.classList.remove('is_visible');
  arrival_screen.setAttribute('aria-hidden', 'true');
  page_shell.classList.remove('is_transitioning');
  document.querySelectorAll('.bubble.bursting').forEach((element) => element.remove());
  bubble_count.textContent = bubbles.length;
}

function tick(time) {
  const dt = Math.min((time - last_time) / 1000, .04); last_time = time;
  quiet_time += dt;
  const settling = Math.max(.08, Math.exp(-quiet_time / 10));
  for (const bubble of bubbles) {
    const dx = 50 - bubble.x; const dy = 50 - bubble.y;
    bubble.vx += dx * (.16 * settling) * dt; bubble.vy += dy * (.16 * settling) * dt;
    for (const other of bubbles) {
      if (bubble === other) continue;
      const ox = bubble.x - other.x; const oy = bubble.y - other.y;
      const distance = Math.max(Math.hypot(ox, oy), .01);
      const minimum = bubble.radius + other.radius + 1.2;
      if (distance < minimum) {
        const overlap = minimum - distance;
        // 速度だけでなく位置も少しずつ押し戻すことで、反発を視覚的に安定させる。
        bubble.x += ox / distance * overlap * .12;
        bubble.y += oy / distance * overlap * .12;
        const force = overlap * 1.8;
        bubble.vx += ox / distance * force * dt * 9;
        bubble.vy += oy / distance * force * dt * 9;
      }
    }
    const distance_from_center = Math.hypot(dx, dy);
    if (distance_from_center > 44) { bubble.vx += dx * .03 * dt; bubble.vy += dy * .03 * dt; }
    const damping = .962 + settling * .023;
    bubble.vx *= damping; bubble.vy *= damping;
    bubble.x += bubble.vx * dt * 10; bubble.y += bubble.vy * dt * 10;
    bubble.x = Math.max(bubble.radius, Math.min(100 - bubble.radius, bubble.x));
    bubble.y = Math.max(bubble.radius, Math.min(100 - bubble.radius, bubble.y));
    bubble.element.style.left = `${bubble.x}%`;
    bubble.element.style.top = `${bubble.y}%`;
  }
  requestAnimationFrame(tick);
}

function add_bubble() { quiet_time = 0; create_bubble(5 + Math.random() * 5, Math.random() * Math.PI * 2, 39); bubble_count.textContent = bubbles.length; }
for (let i = 0; i < 18; i++) create_bubble(5.3 + Math.random() * 6.5, Math.random() * Math.PI * 2, 8 + Math.random() * 35);
add_button.addEventListener('click', add_bubble);
return_button.addEventListener('click', reset_page);
requestAnimationFrame(tick);
