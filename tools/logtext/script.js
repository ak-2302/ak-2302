const text = document.getElementById('text')

if (text) {
    const params = new URLSearchParams(window.location.search)
    let output = ''

    if (params.has('text')) {
        output = params.get('text') || ''
    }

    // '\n' を実際の改行に変換
    console.log(output)
    output = output.replace(/\\r?\\n/g, '\n')
    console.log(output)

    text.value = output

    // 追加: textarea 編集で自動的に URL 更新 & クリップボードにコピー（デバウンス）
    let debounceTimer = null
    function updateUrlAndCopy() {
        const p = new URLSearchParams(window.location.search)
        p.set('text', text.value)
        const newUrl = location.origin + location.pathname + '?' + p.toString()
        history.replaceState(null, '', newUrl)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(newUrl).catch(err => console.error('clipboard write failed', err))
        } else {
            // フォールバック
            const ta = document.createElement('textarea')
            ta.value = newUrl
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            try { document.execCommand('copy') } catch (e) { console.error(e) }
            document.body.removeChild(ta)
        }
    }
    function scheduleUpdate() {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(updateUrlAndCopy, 500)
    }
    text.addEventListener('input', scheduleUpdate)
}

function encode() {
    const textVal = document.getElementById('text').value
    const params = new URLSearchParams(window.location.search)
    params.set('text', textVal)
    // ページリロードせずに URL を更新
    const newUrl = location.origin + location.pathname + '?' + params.toString()
    history.replaceState(null, '', newUrl)
    // クリップボードにコピー
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(newUrl).catch(err => console.error('clipboard write failed', err))
    }
}
