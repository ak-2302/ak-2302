const state = {
    files: [],
    selectedId: null,
    objectUrl: null,
};

const elements = {
    input: document.getElementById('video-input'),
    clearAll: document.getElementById('clear-all'),
    extensionMode: document.getElementById('extension-mode'),
    renameMode: document.getElementById('rename-mode'),
    duplicateMode: document.getElementById('duplicate-mode'),
    removeDuplicates: document.getElementById('remove-duplicates'),
    applyRenaming: document.getElementById('apply-renaming'),
    normalizeExtension: document.getElementById('normalize-extension'),
    exportManifest: document.getElementById('export-manifest'),
    videoList: document.getElementById('video-list'),
    outputList: document.getElementById('output-list'),
    emptyState: document.getElementById('empty-state'),
    previewVideo: document.getElementById('preview-video'),
    previewPlaceholder: document.getElementById('preview-placeholder'),
    selectedName: document.getElementById('selected-name'),
    previewStatus: document.getElementById('preview-status'),
    previewOutputName: document.getElementById('preview-output-name'),
    previewFormat: document.getElementById('preview-format'),
    statCount: document.getElementById('stat-count'),
    statDuplicates: document.getElementById('stat-duplicates'),
    statOutput: document.getElementById('stat-output'),
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

function stripExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex <= 0) {
        return fileName;
    }

    return fileName.slice(0, lastDotIndex);
}

function getExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex <= 0) {
        return '';
    }

    return fileName.slice(lastDotIndex + 1).toLowerCase();
}

function makeId(file) {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 10)}`;
}

function addFiles(fileList) {
    const nextFiles = Array.from(fileList)
        .filter((file) => file.type.startsWith('video/'))
        .map((file, index) => ({
            id: makeId(file),
            file,
            originalName: file.name,
            outputName: file.name,
            outputExtension: getExtension(file.name) || inferExtension(file.type),
            duration: null,
            durationReady: false,
            durationLoading: false,
            duplicate: false,
            duplicateKey: '',
            selected: false,
            order: state.files.length + index + 1,
        }));

    state.files.push(...nextFiles);

    if (!state.selectedId && state.files.length > 0) {
        selectFile(state.files[0].id);
    }

    refreshDerivedState();
    renderAll();
}

function inferExtension(type) {
    if (!type) {
        return 'mp4';
    }

    if (type.includes('mp4')) {
        return 'mp4';
    }

    if (type.includes('quicktime')) {
        return 'mov';
    }

    if (type.includes('matroska')) {
        return 'mkv';
    }

    return 'mp4';
}

function duplicateKeyFor(entry) {
    if (elements.duplicateMode.value === 'name-size-lastModified') {
        return `${entry.originalName}::${entry.file.size}::${entry.file.lastModified}`;
    }

    return `${entry.originalName}::${entry.file.size}`;
}

function refreshDerivedState() {
    const seen = new Map();

    state.files.forEach((entry) => {
        entry.duplicateKey = duplicateKeyFor(entry);
        entry.duplicate = false;
    });

    state.files.forEach((entry) => {
        const existing = seen.get(entry.duplicateKey);
        if (!existing) {
            seen.set(entry.duplicateKey, entry);
            return;
        }

        entry.duplicate = true;
    });

    state.files.forEach((entry) => {
        entry.outputName = buildOutputName(entry);
        entry.outputExtension = buildOutputExtension(entry);
    });
}

function buildOutputExtension(entry) {
    const mode = elements.extensionMode.value;
    if (mode === 'keep') {
        return getExtension(entry.outputName) || inferExtension(entry.file.type);
    }

    return mode;
}

function buildOutputName(entry) {
    const renameMode = elements.renameMode.value;
    const baseName = stripExtension(entry.originalName);
    const extension = elements.extensionMode.value === 'keep'
        ? getExtension(entry.originalName) || inferExtension(entry.file.type)
        : elements.extensionMode.value;

    if (renameMode === 'sequence') {
        return `video_${String(entry.order).padStart(3, '0')}.${extension}`;
    }

    if (renameMode === 'timestamp') {
        const stamp = new Date(entry.file.lastModified || Date.now())
            .toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .replace('Z', '');
        return `${baseName}_${stamp}.${extension}`;
    }

    return `${baseName}.${extension}`;
}

function selectFile(id) {
    state.selectedId = id;
    state.files.forEach((entry) => {
        entry.selected = entry.id === id;
    });
    renderPreview();
    renderAll();
}

function removeDuplicates() {
    const kept = new Set();
    state.files = state.files.filter((entry) => {
        if (kept.has(entry.duplicateKey)) {
            return false;
        }

        kept.add(entry.duplicateKey);
        return true;
    });

    if (!state.files.find((entry) => entry.id === state.selectedId)) {
        state.selectedId = state.files[0]?.id ?? null;
    }

    refreshOrder();
    refreshDerivedState();
    renderAll();
    renderPreview();
}

function refreshOrder() {
    state.files.forEach((entry, index) => {
        entry.order = index + 1;
    });
}

function applyRenaming() {
    refreshOrder();
    refreshDerivedState();
    renderAll();
    renderPreview();
}

function normalizeExtension() {
    refreshDerivedState();
    renderAll();
    renderPreview();
}

function clearAll() {
    state.files = [];
    state.selectedId = null;
    if (state.objectUrl) {
        URL.revokeObjectURL(state.objectUrl);
        state.objectUrl = null;
    }

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
    refreshDerivedState();

    elements.statCount.textContent = String(state.files.length);
    elements.statDuplicates.textContent = String(state.files.filter((entry) => entry.duplicate).length);
    elements.statOutput.textContent = String(state.files.length);
    elements.emptyState.hidden = state.files.length > 0;

    renderList();
    renderOutput();
}

function renderList() {
    elements.videoList.innerHTML = '';

    state.files.forEach((entry) => {
        ensureDuration(entry);

        const row = document.createElement('tr');
        row.dataset.id = entry.id;
        row.className = [entry.selected ? 'is-selected' : '', entry.duplicate ? 'is-duplicate' : '']
            .filter(Boolean)
            .join(' ');

        row.innerHTML = `
			<td><span class="status-chip ${entry.duplicate ? 'is-duplicate' : 'is-keep'}">${entry.duplicate ? '重複候補' : '保持'}</span></td>
			<td>${entry.originalName}</td>
			<td>${formatBytes(entry.file.size)}</td>
			<td>${formatDuration(entry.duration)}</td>
			<td>${getExtension(entry.originalName) || inferExtension(entry.file.type)}</td>
			<td>${entry.outputName}</td>
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
        elements.previewStatus.textContent = '待機中';
        elements.previewOutputName.textContent = '-';
        elements.previewFormat.textContent = '-';
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
    elements.selectedName.textContent = current.originalName;
    elements.previewStatus.textContent = current.duplicate ? '重複候補' : '保持';
    elements.previewOutputName.textContent = current.outputName;
    elements.previewFormat.textContent = buildOutputExtension(current).toUpperCase();
}

function renderOutput() {
    elements.outputList.innerHTML = '';

    state.files.forEach((entry) => {
        const item = document.createElement('li');
        item.innerHTML = `
			<div>
				<div class="output-name">${entry.outputName}</div>
				<div class="output-meta">元: ${entry.originalName} / ${formatBytes(entry.file.size)}</div>
			</div>
			<div class="output-meta">${entry.duplicate ? '重複候補' : '出力対象'}</div>
		`;
        elements.outputList.appendChild(item);
    });
}

function exportManifest() {
    const manifest = state.files.map((entry) => ({
        originalName: entry.originalName,
        outputName: entry.outputName,
        size: entry.file.size,
        type: entry.file.type,
        duplicate: entry.duplicate,
        duration: entry.duration,
    }));

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'video-output-manifest.json';
    link.click();
    URL.revokeObjectURL(link.href);
}

elements.input.addEventListener('change', (event) => {
    addFiles(event.target.files || []);
    event.target.value = '';
});

elements.clearAll.addEventListener('click', clearAll);
elements.removeDuplicates.addEventListener('click', removeDuplicates);
elements.applyRenaming.addEventListener('click', applyRenaming);
elements.normalizeExtension.addEventListener('click', normalizeExtension);
elements.exportManifest.addEventListener('click', exportManifest);

[elements.extensionMode, elements.renameMode, elements.duplicateMode].forEach((element) => {
    element.addEventListener('change', () => {
        refreshDerivedState();
        renderAll();
        renderPreview();
    });
});

refreshDerivedState();
renderAll();
renderPreview();
