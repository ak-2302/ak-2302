document.getElementById("uploadMov").addEventListener("submit", function (event) {
    event.preventDefault(); // フォームのデフォルト動作を防止

    const fileInput = document.getElementById("fileInputMov");
    const file = fileInput.files[0]; // 選択されたファイルを取得

    if (file) {
        console.log("ファイル名:", file.name);
        console.log("ファイルサイズ:", file.size, "バイト");
        console.log("ファイルタイプ:", file.type);

        // ファイルを読み込む例 (テキストファイルの場合)
        const reader = new FileReader();
        reader.onload = function (e) {
            console.log("ファイル内容:", e.target.result);
        };
    } else {
        console.log("ファイルが選択されていません。");
    }
});
document.getElementById("uploadMidi").addEventListener("submit", function (event) {
    event.preventDefault(); // フォームのデフォルト動作を防止

    const fileInput = document.getElementById("fileInputMidi");
    const file = fileInput.files[0]; // 選択されたファイルを取得

    if (file) {
        console.log("ファイル名:", file.name);
        console.log("ファイルサイズ:", file.size, "バイト");
        console.log("ファイルタイプ:", file.type);

        // ファイルを読み込む
        const reader = new FileReader();
        reader.onload = function (e) {
            const midiData = e.target.result;

            // MIDI.jsのプラグインを読み込み、成功したら再生
            MIDI.loadPlugin({
                onsuccess: function () {
                    console.log("MIDIファイルが読み込まれました。");
                    MIDI.Player.loadFile(midiData, function () {
                        MIDI.Player.start(); // MIDIの再生を開始
                    });
                },
                onerror: function () {
                    console.log("MIDIプラグインの読み込みに失敗しました。");
                }
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        console.log("ファイルが選択されていません。");
    }
});