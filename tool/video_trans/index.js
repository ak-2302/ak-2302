const state = {
    files: [],
    selectedId: null,
    previewObjectUrl: null,
    uploadProgress: 0,
    outputProgress: 0,
    uploadBusy: false,
    outputBusy: false,
    outputMessage: 'まだ出力していません。',
};

const elements = {
    input: document.getElementById('video-input'),
    videoList: document.getElementById('video-list'),
    emptyState: document.getElementById('empty-state'),
    previewVideo: document.getElementById('preview-video'),
    previewPlaceholder: document.getElementById('preview-placeholder'),
    selectedName: document.getElementById('selected-name'),
    statCount: document.getElementById('stat-count'),
    uploadProgressLabel: document.getElementById('upload-progress-label'),
    uploadProgressBar: document.getElementById('upload-progress-bar'),
    outputProgressBar: document.getElementById('output-progress-bar'),
    outputStatusText: document.getElementById('output-status-text'),
    exportButton: document.getElementById('export-button'),
};

let ffmpegInstance = null;
let ffmpegFetchFile = null;
let ffmpegLoadPromise = null;

function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) {
        return '-';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDuration(duration) {
    if (!Number.isFinite(duration) || duration <= 0) {
        return '未取得';
    }

    const totalSeconds = Math.round(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value, index) => (index === 0 ? value : String(value).padStart(2, '0')))
        .join(':');
}

function inferExtension(file) {
    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    if (extension) {
        return extension;
    }

    if (file.type.includes('quicktime')) {
        return 'mov';
    }

    if (file.type.includes('x-matroska') || file.type.includes('matroska')) {
        return 'mkv';
    }

    if (file.type.includes('x-msvideo') || file.type.includes('avi')) {
        return 'avi';
    }

    return 'mp4';
}

function makeId(file) {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 10)}`;
}

function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function refreshOrder() {
    state.files.forEach((entry, index) => {
        entry.order = index + 1;
    });
}

function dedupeBySize(files) {
    const seenSizes = new Set();
    const kept = [];
    let removedCount = 0;

    for (const entry of files) {
        if (seenSizes.has(entry.file.size)) {
            removedCount += 1;
            continue;
        }

        seenSizes.add(entry.file.size);
        kept.push(entry);
    }

    return { kept, removedCount };
}

async function addFiles(fileList) {
    const acceptedFiles = Array.from(fileList).filter((file) => file.type.startsWith('video/'));
    if (acceptedFiles.length === 0) {
        return;
    }

    state.uploadBusy = true;
    state.uploadProgress = 0;
    renderAll();

    const nextFiles = [];
    for (const file of acceptedFiles) {
        nextFiles.push({
            id: makeId(file),
            file,
            name: file.name,
            duration: null,
            durationReady: false,
            durationLoading: false,
            selected: false,
            order: state.files.length + nextFiles.length + 1,
        });

        state.uploadProgress = Math.round((nextFiles.length / acceptedFiles.length) * 100);
        renderAll();
        await sleep(70);
    }

    state.files.push(...nextFiles);
    state.uploadBusy = false;
    state.uploadProgress = 100;

    if (!state.selectedId && state.files.length > 0) {
        selectFile(state.files[0].id);
    }

    refreshOrder();
    renderAll();
}

function selectFile(id) {
    state.selectedId = id;
    state.files.forEach((entry) => {
        entry.selected = entry.id === id;
    });

    renderPreview();
    renderAll();
}

function ensureDuration(entry) {
    if (entry.durationReady || entry.durationLoading) {
        return;
    }

    entry.durationLoading = true;

    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(entry.file);

    video.addEventListener('loadedmetadata', () => {
        entry.duration = video.duration;
        entry.durationReady = true;
        entry.durationLoading = false;
        URL.revokeObjectURL(objectUrl);
        renderAll();
        if (entry.id === state.selectedId) {
            renderPreview();
        }
    }, { once: true });

    video.addEventListener('error', () => {
        entry.duration = null;
        entry.durationReady = true;
        entry.durationLoading = false;
        URL.revokeObjectURL(objectUrl);
        renderAll();
    }, { once: true });

    video.src = objectUrl;
}

function renderAll() {
    refreshOrder();

    elements.statCount.textContent = String(state.files.length);
    elements.emptyState.hidden = state.files.length > 0;
    elements.uploadProgressLabel.textContent = `${state.uploadProgress}%`;
    elements.uploadProgressBar.style.width = `${state.uploadProgress}%`;
    elements.outputProgressBar.style.width = `${state.outputProgress}%`;
    elements.outputStatusText.textContent = state.outputBusy
        ? state.outputMessage
        : state.outputProgress > 0
            ? `出力完了: ${state.outputMessage}`
            : state.outputMessage;

    renderList();
}

function renderList() {
    elements.videoList.innerHTML = '';

    state.files.forEach((entry) => {
        ensureDuration(entry);

        const row = document.createElement('tr');
        row.dataset.id = entry.id;
        row.className = entry.selected ? 'is-selected' : '';

        row.innerHTML = `
            <td>${entry.name}</td>
            <td>${formatBytes(entry.file.size)}</td>
            <td>${formatDuration(entry.duration)}</td>
        `;

        row.addEventListener('click', () => selectFile(entry.id));
        elements.videoList.appendChild(row);
    });
}

function renderPreview() {
    const current = state.files.find((entry) => entry.id === state.selectedId);

    if (!current) {
        if (state.previewObjectUrl) {
            URL.revokeObjectURL(state.previewObjectUrl);
            state.previewObjectUrl = null;
        }

        elements.selectedName.textContent = '未選択';
        elements.previewPlaceholder.hidden = false;
        elements.previewVideo.hidden = true;
        elements.previewVideo.removeAttribute('src');
        elements.previewVideo.load();
        return;
    }

    if (state.previewObjectUrl) {
        URL.revokeObjectURL(state.previewObjectUrl);
    }

    state.previewObjectUrl = URL.createObjectURL(current.file);
    elements.previewVideo.src = state.previewObjectUrl;
    elements.previewVideo.hidden = false;
    elements.previewPlaceholder.hidden = true;
    elements.selectedName.textContent = current.name;
}

async function loadFfmpeg() {
    if (ffmpegLoadPromise) {
        return ffmpegLoadPromise;
    }

    if (!window.FFmpeg) {
        throw new Error('FFmpeg ライブラリを読み込めませんでした。');
    }

    const { createFFmpeg, fetchFile } = window.FFmpeg;
    ffmpegInstance = createFFmpeg({
        log: false,
    });
    ffmpegFetchFile = fetchFile;
    ffmpegLoadPromise = ffmpegInstance.load();
    await ffmpegLoadPromise;
    return ffmpegInstance;
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

async function runOutput() {
    if (state.files.length === 0 || state.outputBusy) {
        return;
    }

    state.outputBusy = true;
    state.outputProgress = 0;
    state.outputMessage = '重複削除を実行しています。';
    renderAll();

    const { kept, removedCount } = dedupeBySize(state.files);
    const sourceFiles = kept;

    if (sourceFiles.length === 0) {
        state.outputBusy = false;
        state.outputProgress = 0;
        state.outputMessage = '出力できる動画がありません。';
        renderAll();
        return;
    }

    state.outputMessage = removedCount > 0
        ? `重複を ${removedCount} 件削除しました。変換を開始しています。`
        : '重複なし。変換を開始しています。';
    renderAll();

    let ffmpeg;
    try {
        ffmpeg = await loadFfmpeg();
    } catch (error) {
        state.outputBusy = false;
        state.outputMessage = error.message || 'FFmpeg の初期化に失敗しました。';
        renderAll();
        return;
    }

    const zip = new JSZip();
    const totalFiles = sourceFiles.length;

    for (let index = 0; index < sourceFiles.length; index += 1) {
        const entry = sourceFiles[index];
        const inputExt = inferExtension(entry.file);
        const inputName = `input_${index + 1}.${inputExt}`;
        const outputName = `${String(index + 1).padStart(5, '0')}.mp4`;

        state.outputMessage = `変換中: ${entry.name} -> ${outputName}`;
        renderAll();

        try {
            ffmpeg.FS('writeFile', inputName, await ffmpegFetchFile(entry.file));
            await ffmpeg.run(
                '-i', inputName,
                '-c:v', 'libx264',
                '-preset', 'veryfast',
                '-crf', '28',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                '-c:a', 'aac',
                '-b:a', '128k',
                outputName
            );

            const outputData = ffmpeg.FS('readFile', outputName);
            zip.file(outputName, outputData);
            ffmpeg.FS('unlink', inputName);
            ffmpeg.FS('unlink', outputName);
        } catch (error) {
            state.outputMessage = `変換に失敗したファイルがあります: ${entry.name}`;
            renderAll();
        }

        state.outputProgress = Math.round(((index + 1) / totalFiles) * 100);
        renderAll();
    }

    state.outputMessage = 'ZIP を生成しています。';
    renderAll();

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'video-output.zip');

    state.outputBusy = false;
    state.outputProgress = 100;
    state.outputMessage = 'ZIP をダウンロードしました。';
    renderAll();
}

elements.input.addEventListener('change', (event) => {
    void addFiles(event.target.files || []);
    event.target.value = '';
});

elements.exportButton.addEventListener('click', () => {
    void runOutput();
});

elements.previewVideo.addEventListener('click', () => {
    if (elements.previewVideo.paused) {
        void elements.previewVideo.play();
    } else {
        elements.previewVideo.pause();
    }
});

renderAll();
renderPreview();
