const command_form = document.getElementById('command_form');
const command_input = document.getElementById('command_input');
const terminal_output = document.getElementById('terminal_output');

const responses = {
  'help': 'available: whoami, ls ideas, ls tools, cat now.md, cat contact.txt, clear',
  'whoami': 'ak-2302 — Designer / Developer / Collector of small ideas.',
  'ls ideas': '01 / 余白のある道具\n02 / 生活のログを残す\n03 / 音のない通知',
  'ls tools': 'markdown-html   image-converter   contact-worker',
  'cat now.md': '# NOW\n→ 小さなWebサイトをつくる\n→ 新しい音を集める\n→ 歩いて考える',
  'cat contact.txt': 'mail  /  hello@example.com\nweb   /  github.com/ak-2302',
};

function add_output(command, response) {
  const line = document.createElement('div');
  line.className = 'output_line';
  line.innerHTML = `<span class="green">ak@studio</span><span class="muted">:~$</span> <span class="command"></span>`;
  line.querySelector('.command').textContent = command;
  terminal_output.append(line);
  if (response) {
    const block = document.createElement('div');
    block.className = 'output_block';
    block.style.whiteSpace = 'pre-line';
    block.textContent = response;
    terminal_output.append(block);
  }
  const next = document.createElement('div');
  next.className = 'output_line';
  next.innerHTML = '<span class="green">ak@studio</span><span class="muted">:~$</span> <span class="cursor_block"></span>';
  terminal_output.append(next);
  terminal_output.scrollTop = terminal_output.scrollHeight;
}

command_form.addEventListener('submit', (event) => {
  event.preventDefault();
  const command = command_input.value.trim().toLowerCase();
  if (!command) return;
  if (command === 'clear') { terminal_output.innerHTML = ''; }
  else add_output(command, responses[command] ?? `command not found: ${command}\ntry 'help' for available commands`);
  command_input.value = '';
});

document.querySelectorAll('.tree_item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.tree_item').forEach((node) => node.classList.remove('is_active'));
    item.classList.add('is_active');
    command_input.value = item.dataset.command;
    command_form.requestSubmit();
    command_input.focus();
  });
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    command_input.focus();
  }
});
