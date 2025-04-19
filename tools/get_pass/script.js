
document.getElementById("file").addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n');
        const is_in_tag = false;
        const is_in_password_section = false;
        const password_section_html = [];
        const tag_start = [];
        lines.forEach(line => {
            var index = 0;
            if (line.includes('password')) {
                for (let i = 0; i < line.length; i++) {
                    if (line.slice(i, i + 7) == 'password') {
                        if (isInsideTag(line, i)) {
                            index = i;
                        } else {
                            continue;
                        }
                    }

                }
            }
        })
        console.log(result_html);
    };
    reader.readAsText(file);
});

/**
 * 指定位置がHTMLタグ（<...>）の内側かどうかを判定する
 * @param {string} str - HTML風の文字列
 * @param {number} index - チェックしたい文字のインデックス
 * @returns {boolean} - タグの内側なら true、外なら false
 */
function isInsideTag(str, index) {
    let inside = false;

    for (let i = 0; i <= index && i < str.length; i++) {
        if (str[i] === '<') {
            inside = true;
        } else if (str[i] === '>') {
            inside = false;
        }
    }

    return inside;
}