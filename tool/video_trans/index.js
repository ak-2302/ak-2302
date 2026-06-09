const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'wmv', 'flv', 'mpeg', 'mpg']);

const state = {
    files: [],
    busy: false,
    results: [],
    archive: null,
    toastTimer: null,
};

const elements = {
    fileInput: document.getElementById('file-input'),
    folderInput: document.getElementById('folder-input'),
    dropZone: document.getElementById('drop-zone'),
    list: document.getElementById('video-list'),
    empty: document.getElementById('empty-state'),
    clearButton: document.getElementById('clear-button'),
    count: document.getElementById('stat-count'),
    size: document.getElementById('stat-size'),
    duplicates: document.getElementById('stat-duplicates'),
    outputCount: document.getElementById('stat-output'),
    dedupe: document.getElementById('dedupe-toggle'),
    padding: document.getElementById('padding-select'),
    start: document.getElementById('start-select'),
    renamePreview: document.getElementById('rename-preview'),
    sequenceOptions: document.getElementById('sequence-options'),
    zip: document.getElementById('zip-toggle'),
    zipNameField: document.getElementById('zip-name-field'),
    zipName: document.getElementById('zip-name-input'),
    convertButton: document.getElementById('convert-button'),
    statusTitle: document.getElementById('status-title'),
    statusText: document.getElementById('status-text'),
    progressFile: document.getElementById('progress-file'),
    progressLabel: document.getElementById('progress-label'),
    progressBar: document.getElementById('progress-bar'),
    resultPanel: document.getElementById('result-panel'),
    resultList: document.getElementById('result-list'),
    downloadAllButton: document.getElementById('download-all-button'),
    toast: document.getElementById('toast'),
};

let ffmpeg = null;
let fetchFile = null;
let ffmpegLoadPromise = null;

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** index);
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return '取得中';
    const rounded = Math.round(seconds);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const rest = rounded % 60;
    return hours
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
        : `${minutes}:${String(rest).padStart(2, '0')}`;
}

function isVideo(file) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return file.type.startsWith('video/') || VIDEO_EXTENSIONS.has(extension);
}

function makeId() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function getExtension(name) {
    const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    return VIDEO_EXTENSIONS.has(extension) ? extension : 'mp4';
}

function getBaseName(name) {
    return name.replace(/\.[^.]+$/, '') || 'video';
}

function sanitizeFileName(name) {
    return name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim() || 'video';
}

function uniqueName(candidate, usedNames) {
    let name = candidate;
    let suffix = 2;
    const extensionIndex = candidate.lastIndexOf('.');
    const base = extensionIndex > -1 ? candidate.slice(0, extensionIndex) : candidate;
    const extension = extensionIndex > -1 ? candidate.slice(extensionIndex) : '';
    while (usedNames.has(name.toLowerCase())) {
        name = `${base}_${suffix}${extension}`;
        suffix += 1;
    }
    usedNames.add(name.toLowerCase());
    return name;
}

async function calculateHash(file) {
    const data = await file.arrayBuffer();
    if (crypto.subtle) {
        const digest = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    // file:// など SubtleCrypto が使えない環境でも、ファイル名に依存せず内容を比較する。
    let hash = 2166136261;
    for (const byte of new Uint8Array(data)) {
        hash ^= byte;
        hash = Math.imul(hash, 16777619);
    }
    return `${file.size}-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function readDuration(entry) {
    const video = document.createElement('video');
    const url = URL.createObjectURL(entry.file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
        entry.duration = Number.isFinite(video.duration) ? video.duration : null;
        URL.revokeObjectURL(url);
        render();
    };
    video.onerror = () => {
        entry.duration = null;
        URL.revokeObjectURL(url);
        render();
    };
    video.src = url;
}

async function addFiles(fileList) {
    if (state.busy) return;
    const files = Array.from(fileList).filter(isVideo);
    if (!files.length) {
        showToast('対応する動画ファイルが見つかりませんでした。');
        return;
    }

    const entries = files.map((file) => ({
        id: makeId(),
        file,
        duration: undefined,
        hash: null,
        hashing: true,
    }));
    state.files.push(...entries);
    clearResults();
    entries.forEach(readDuration);
    render();

    await Promise.all(entries.map(async (entry) => {
        try {
            entry.hash = await calculateHash(entry.file);
        } catch {
            entry.hash = `${entry.file.size}-${entry.file.lastModified}`;
        }
        entry.hashing = false;
        render();
    }));

    showToast(`${entries.length}件の動画を追加しました。`);
}

function duplicateIds() {
    const seen = new Set();
    const duplicates = new Set();
    state.files.forEach((entry) => {
        if (!entry.hash) return;
        if (seen.has(entry.hash)) duplicates.add(entry.id);
        else seen.add(entry.hash);
    });
    return duplicates;
}

function sourceFiles() {
    if (!elements.dedupe.checked) return [...state.files];
    const seen = new Set();
    return state.files.filter((entry) => {
        if (!entry.hash || !seen.has(entry.hash)) {
            if (entry.hash) seen.add(entry.hash);
            return true;
        }
        return false;
    });
}

function selectedRenameRule() {
    return document.querySelector('input[name="rename-rule"]:checked').value;
}

function makeOutputNames(entries) {
    const used = new Set();
    const padding = Number(elements.padding.value);
    const start = Number(elements.start.value);
    return entries.map((entry, index) => {
        const candidate = selectedRenameRule() === 'sequence'
            ? `${String(index + start).padStart(padding, '0')}.mp4`
            : `${sanitizeFileName(getBaseName(entry.file.name))}.mp4`;
        return uniqueName(candidate, used);
    });
}

function updateRenamePreview() {
    const padding = Number(elements.padding.value);
    const start = Number(elements.start.value);
    const first = String(start).padStart(padding, '0');
    const second = String(start + 1).padStart(padding, '0');
    elements.renamePreview.textContent = `${first}.mp4, ${second}.mp4 ...`;
}

function createCell(text, className = '') {
    const cell = document.createElement('td');
    cell.textContent = text;
    if (className) cell.className = className;
    return cell;
}

function renderList() {
    elements.list.replaceChildren();
    const duplicates = duplicateIds();
    state.files.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.append(
            createCell(String(index + 1)),
            createCell(entry.file.name, 'file-name'),
            createCell(formatBytes(entry.file.size)),
            createCell(entry.duration === null ? '未取得' : formatDuration(entry.duration)),
            createCell(
                entry.hashing ? '確認中' : duplicates.has(entry.id) ? '重複' : '準備完了',
                duplicates.has(entry.id) ? 'duplicate-badge' : 'status-badge'
            )
        );
        const actionCell = document.createElement('td');
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-button';
        remove.setAttribute('aria-label', `${entry.file.name}を削除`);
        remove.textContent = '×';
        remove.addEventListener('click', () => removeFile(entry.id));
        actionCell.append(remove);
        row.append(actionCell);
        elements.list.append(row);
    });
}

function render() {
    const duplicateCount = duplicateIds().size;
    const outputCount = elements.dedupe.checked ? state.files.length - duplicateCount : state.files.length;
    elements.count.textContent = String(state.files.length);
    elements.size.textContent = formatBytes(state.files.reduce((sum, entry) => sum + entry.file.size, 0));
    elements.duplicates.textContent = String(duplicateCount);
    elements.outputCount.textContent = String(outputCount);
    elements.empty.hidden = state.files.length > 0;
    elements.clearButton.disabled = state.busy || state.files.length === 0;
    elements.convertButton.disabled = state.busy || state.files.length === 0 || state.files.some((entry) => entry.hashing);
    elements.convertButton.textContent = state.busy ? '変換中...' : 'MP4へ変換';
    elements.sequenceOptions.hidden = selectedRenameRule() !== 'sequence';
    elements.zipNameField.hidden = !elements.zip.checked;
    elements.downloadAllButton.textContent = state.archive ? 'ZIPをダウンロード' : 'すべてダウンロード';
    updateRenamePreview();
    renderList();
}

function removeFile(id) {
    if (state.busy) return;
    state.files = state.files.filter((entry) => entry.id !== id);
    clearResults();
    render();
}

function clearFiles() {
    if (state.busy) return;
    state.files = [];
    clearResults();
    setProgress(0, '待機中');
    elements.statusTitle.textContent = '変換の準備ができています';
    elements.statusText.textContent = '動画を追加すると変換を開始できます。';
    render();
}

function clearResults() {
    state.results.forEach((result) => URL.revokeObjectURL(result.url));
    if (state.archive?.url) URL.revokeObjectURL(state.archive.url);
    state.results = [];
    state.archive = null;
    elements.resultPanel.hidden = true;
    elements.resultList.replaceChildren();
}

function setProgress(percent, text) {
    elements.progressBar.style.width = `${percent}%`;
    elements.progressLabel.textContent = `${percent}%`;
    elements.progressFile.textContent = text;
}

function showToast(message) {
    window.clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 2600);
}

async function loadFfmpeg() {
    if (ffmpegLoadPromise) {
        await ffmpegLoadPromise;
        return ffmpeg;
    }
    if (!window.FFmpeg) throw new Error('FFmpegライブラリを読み込めませんでした。');
    const api = window.FFmpeg;
    ffmpeg = api.createFFmpeg({ log: false });
    fetchFile = api.fetchFile;
    ffmpegLoadPromise = ffmpeg.load();
    await ffmpegLoadPromise;
    return ffmpeg;
}

function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function triggerResultDownload(result) {
    const anchor = document.createElement('a');
    anchor.href = result.url;
    anchor.download = result.name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
}

function renderResults() {
    elements.resultList.replaceChildren();
    state.results.forEach((result) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        const name = document.createElement('span');
        name.textContent = result.name;
        const size = document.createElement('small');
        size.textContent = formatBytes(result.blob.size);
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '保存';
        button.addEventListener('click', () => triggerResultDownload(result));
        item.append(name, size, button);
        elements.resultList.append(item);
    });
    elements.resultPanel.hidden = false;
}

async function buildArchive() {
    if (!window.JSZip) throw new Error('ZIPライブラリを読み込めませんでした。');
    const zip = new window.JSZip();
    state.results.forEach((result) => zip.file(result.name, result.blob));
    const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        elements.statusText.textContent = `ZIPを作成中: ${Math.round(metadata.percent)}%`;
    });
    const baseName = sanitizeFileName(elements.zipName.value.replace(/\.zip$/i, '')) || 'converted-videos';
    state.archive = { blob, name: `${baseName}.zip`, url: URL.createObjectURL(blob) };
}

async function convertVideos() {
    if (state.busy || !state.files.length) return;
    state.busy = true;
    clearResults();
    render();
    elements.statusTitle.textContent = '変換しています';
    elements.statusText.textContent = '初回は変換エンジンの読み込みに時間がかかります。';
    setProgress(0, 'エンジンを準備中');

    try {
        const engine = await loadFfmpeg();
        const entries = sourceFiles();
        const names = makeOutputNames(entries);
        let failureCount = 0;

        for (let index = 0; index < entries.length; index += 1) {
            const entry = entries[index];
            const inputName = `input_${index}_${Date.now()}.${getExtension(entry.file.name)}`;
            const outputFsName = `output_${index}_${Date.now()}.mp4`;
            const percentBefore = Math.round((index / entries.length) * 90);
            setProgress(percentBefore, `${index + 1}/${entries.length} ${entry.file.name}`);
            elements.statusText.textContent = `${entry.file.name} を ${names[index]} に変換中`;

            try {
                engine.FS('writeFile', inputName, await fetchFile(entry.file));
                await engine.run(
                    '-i', inputName,
                    '-c:v', 'libx264',
                    '-preset', 'veryfast',
                    '-crf', '26',
                    '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart',
                    '-c:a', 'aac',
                    '-b:a', '128k',
                    outputFsName
                );
                const data = engine.FS('readFile', outputFsName);
                const blob = new Blob([data.buffer], { type: 'video/mp4' });
                state.results.push({ name: names[index], blob, url: URL.createObjectURL(blob) });
            } catch (error) {
                console.error(error);
                failureCount += 1;
            } finally {
                for (const fsName of [inputName, outputFsName]) {
                    try { engine.FS('unlink', fsName); } catch { /* File may not exist after a failed conversion. */ }
                }
            }
            setProgress(Math.round(((index + 1) / entries.length) * 90), `${index + 1}/${entries.length} 完了`);
        }

        if (!state.results.length) throw new Error('すべての動画の変換に失敗しました。');
        if (elements.zip.checked) {
            setProgress(95, 'ZIPを作成中');
            await buildArchive();
        }

        setProgress(100, '完了');
        elements.statusTitle.textContent = '変換が完了しました';
        elements.statusText.textContent = failureCount
            ? `${state.results.length}件完了、${failureCount}件失敗しました。`
            : `${state.results.length}件の動画を変換しました。`;
        renderResults();
        if (state.archive) triggerResultDownload(state.archive);
        showToast('変換が完了しました。');
    } catch (error) {
        console.error(error);
        elements.statusTitle.textContent = '変換できませんでした';
        elements.statusText.textContent = error.message || '変換中にエラーが発生しました。';
        setProgress(0, 'エラー');
        showToast(elements.statusText.textContent);
    } finally {
        state.busy = false;
        render();
    }
}

function downloadAll() {
    if (state.archive) {
        triggerResultDownload(state.archive);
        return;
    }
    state.results.forEach((result, index) => {
        window.setTimeout(() => triggerResultDownload(result), index * 180);
    });
}

[elements.fileInput, elements.folderInput].forEach((input) => {
    input.addEventListener('change', (event) => {
        void addFiles(event.target.files);
        event.target.value = '';
    });
});

['dragenter', 'dragover'].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.dropZone.classList.add('is-dragging');
    });
});

['dragleave', 'drop'].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.dropZone.classList.remove('is-dragging');
    });
});

elements.dropZone.addEventListener('drop', (event) => void addFiles(event.dataTransfer.files));
elements.clearButton.addEventListener('click', clearFiles);
elements.convertButton.addEventListener('click', () => void convertVideos());
elements.downloadAllButton.addEventListener('click', downloadAll);
elements.dedupe.addEventListener('change', () => { clearResults(); render(); });
elements.zip.addEventListener('change', () => { clearResults(); render(); });
elements.padding.addEventListener('change', () => { clearResults(); render(); });
elements.start.addEventListener('change', () => { clearResults(); render(); });
document.querySelectorAll('input[name="rename-rule"]').forEach((radio) => {
    radio.addEventListener('change', () => { clearResults(); render(); });
});

render();
