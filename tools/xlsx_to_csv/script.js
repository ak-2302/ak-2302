
document.getElementById('file').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // 最初のシート名を取得
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // CSVに変換
        const csv = XLSX.utils.sheet_to_csv(worksheet);


        // ダウンロードさせたい場合：
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (file.name || "output") + ".csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    reader.readAsArrayBuffer(file);
});