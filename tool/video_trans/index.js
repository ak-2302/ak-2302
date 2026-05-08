const state = {
    files: [],
    selectedId: null,
    objectUrl: null,
    uploadProgress: 0,
    outputProgress: 0,
    uploadBusy: false,
    outputBusy: false,
};

const elements = {
    input: document.getElementById('video-input'),
    clearAll: document.getElementById('clear-all'),
    exportButton: document.getElementById('export-button'),
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
};

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

function makeId(file) {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 10)}`;
}

async function addFiles(fileList) {
    const acceptedFiles = Array.from(fileList)
        .filter((file) => file.type.startsWith('video/'));

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

        await new Promise((resolve) => window.setTimeout(resolve, 60));
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

function refreshOrder() {
    state.files.forEach((entry, index) => {
        entry.order = index + 1;
    });
}

function selectFile(id) {
    state.selectedId = id;
    state.files.forEach((entry) => {
        entry.selected = entry.id === id;
    });
    renderPreview();
    renderAll();
}

function clearAll() {
    state.files = [];
    state.selectedId = null;
    if (state.objectUrl) {
        URL.revokeObjectURL(state.objectUrl);
        state.objectUrl = null;
    }

    state.uploadProgress = 0;
    state.outputProgress = 0;
    state.uploadBusy = false;
    state.outputBusy = false;

    elements.previewVideo.removeAttribute('src');
    elements.previewVideo.load();
    elements.input.value = '';
    renderAll();
    renderPreview();
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
        ? `出力中... ${state.outputProgress}%`
        : state.outputProgress > 0
            ? `出力完了: ${state.outputProgress}%`
            : 'まだ出力していません。';

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
        if (state.objectUrl) {
            URL.revokeObjectURL(state.objectUrl);
            state.objectUrl = null;
        }

        elements.selectedName.textContent = '未選択';
        elements.previewPlaceholder.hidden = false;
        elements.previewVideo.hidden = true;
        elements.previewVideo.removeAttribute('src');
        elements.previewVideo.load();
        return;
    }

    if (state.objectUrl) {
        URL.revokeObjectURL(state.objectUrl);
    }

    state.objectUrl = URL.createObjectURL(current.file);
    elements.previewVideo.src = state.objectUrl;
    elements.previewVideo.hidden = false;
    elements.previewPlaceholder.hidden = true;
    elements.selectedName.textContent = current.name;
}

async function simulateOutput() {
    if (state.files.length === 0 || state.outputBusy) {
        return;
    }

    state.outputBusy = true;
    state.outputProgress = 0;
    renderAll();

    const totalSteps = Math.max(state.files.length, 4);

    for (let step = 1; step <= totalSteps; step += 1) {
        state.outputProgress = Math.round((step / totalSteps) * 100);
        renderAll();
        await new Promise((resolve) => window.setTimeout(resolve, 90));
    }

    state.outputBusy = false;
    state.outputProgress = 100;
    renderAll();
}

elements.input.addEventListener('change', (event) => {
    addFiles(event.target.files || []);
    event.target.value = '';
});

elements.clearAll.addEventListener('click', clearAll);
elements.exportButton.addEventListener('click', simulateOutput);

renderAll();
renderPreview();
