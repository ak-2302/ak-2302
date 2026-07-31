const command_form = document.getElementById('command_form');
const command_input = document.getElementById('command_input');
const terminal_output = document.getElementById('terminal_output');

const responses = {
  'help': 'COMMANDS\n\n  pwd             現在の場所を表示\n  ls              ファイルとディレクトリを一覧表示\n  whoami          プロフィールを表示\n  date            現在日時を表示\n  uname           システム情報を表示\n  echo <text>     テキストを表示\n  ls ideas        アイデアの一覧を表示\n  ls tools        使用中のツールを表示\n  cat now.md      今取り組んでいることを表示\n  cat contact.txt 連絡先を表示\n  clear           画面をクリア',
  'ls': 'ideas/\ntools/\nnow.md\ncontact.txt',
  'whoami': 'ak-2302 — Designer / Developer / Collector of small ideas.',
  'uname': 'ak-studio 1.0.0 browser arm64',
  'ls ideas': '01 / 余白のある道具\n02 / 生活のログを残す\n03 / 音のない通知',
  'ls tools': 'markdown-html   image-converter   contact-worker',
  'cat now.md': '# NOW\n→ 小さなWebサイトをつくる\n→ 新しい音を集める\n→ 歩いて考える',
  'cat contact.txt': 'mail  /  hello@example.com\nweb   /  github.com/ak-2302',
};

function get_response(command) {
  if (command === 'pwd') return `${window.location.href.replace(/index\.html$/, '')}`;
  if (command === 'date') return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
  if (command.startsWith('echo ')) return command.slice(5);
  return responses[command];
}

function add_output(command, response) {
  const line = document.createElement('div');
  line.className = 'output_line';
  line.innerHTML = `<span class="green">ak@studio</span><span class="muted">:~$</span> <span class="command"></span>`;
  line.querySelector('.command').textContent = command;
  terminal_output.insertBefore(line, command_form);
  if (response) {
    const block = document.createElement('div');
    block.className = 'output_block';
    block.style.whiteSpace = 'pre-line';
    block.textContent = response;
    terminal_output.insertBefore(block, command_form);
  }
  terminal_output.scrollTop = terminal_output.scrollHeight;
}

command_form.addEventListener('submit', (event) => {
  event.preventDefault();
  const command = command_input.value.trim().toLowerCase();
  if (!command) return;
  if (command === 'clear') {
    [...terminal_output.children].forEach((child) => {
      if (child !== command_form) child.remove();
    });
  }
  else add_output(command, get_response(command) ?? `command not found: ${command}\ntry 'help' for available commands`);
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
