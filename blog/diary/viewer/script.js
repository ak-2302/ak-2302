function getMdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('md');
}

// mdの値を取得してHTMLに変換
const mdValue = getMdFromUrl();
const mdFileName = "./data/" + mdValue;

if (!mdValue) {
    console.warn('md パラメータが指定されていません');
} else {
    fetch(mdFileName)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${mdFileName}: ${response.status}`);
            return response.text();
        })
        .then(mdText => {
            // marked と DOMPurify を HTML に読み込んでおくこと
            const rawHtml = (window.marked) ? window.marked.parse(mdText) : mdText;
            const safeHtml = (window.DOMPurify) ? window.DOMPurify.sanitize(rawHtml) : rawHtml;
            const container = document.getElementById('md-viewer');
            if (container) {
                container.innerHTML = safeHtml;
                // highlight.js がある場合はコードブロックをハイライト
                if (window.hljs) {
                    container.querySelectorAll('pre code').forEach(block => {
                        try { window.hljs.highlightElement(block); } catch (e) { /* ignore */ }
                    });
                }
            } else {
                console.warn('#md-viewer が見つかりません');
            }
        })
        .catch(err => {
            console.error(err);
            const container = document.getElementById('md-viewer');
            if (container) container.textContent = 'Markdown を読み込めませんでした: ' + err.message;
        });
}
