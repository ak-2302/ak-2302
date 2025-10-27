const table = document.getElementById('table');
table.querySelector("thead").querySelector("tr").querySelector("th").contentEditable = true; // ヘッダーを編集可能にする
table.querySelector("tbody").querySelector("tr").querySelector("td").contentEditable = true; // データを編集可能にする

function clearTable() {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // テーブルのデータ部分をクリア
}

function addRow() {
    const tbody = table.querySelector('tbody');
    const row = document.createElement('tr');
    const columnCount = table.querySelector('thead tr').children.length; // ヘッダーの列数を取得

    for (let i = 0; i < columnCount; i++) {
        const cell = document.createElement('td');
        cell.textContent = `Data ${tbody.children.length + 1}-${i + 1}`; // データを設定
        row.appendChild(cell);
    }

    tbody.appendChild(row); // 新しい行を追加
}

function addColumn() {
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // ヘッダーに新しい列を追加
    const headerCell = document.createElement('th');
    headerCell.textContent = `Header ${thead.children.length + 1}`;
    thead.appendChild(headerCell);

    // 各行に新しいセルを追加
    Array.from(tbody.children).forEach((row, rowIndex) => {
        const cell = document.createElement('td');
        cell.textContent = `Data ${rowIndex + 1}-${thead.children.length}`;
        row.appendChild(cell);
    });
}

function deleteRow() {
    const tbody = table.querySelector('tbody');
    if (tbody.children.length > 0) {
        tbody.removeChild(tbody.lastElementChild); // 最後の行を削除
    }
}

function deleteColumn() {
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    if (thead.children.length > 0) {
        // ヘッダーの最後の列を削除
        thead.removeChild(thead.lastElementChild);

        // 各行の最後のセルを削除
        Array.from(tbody.children).forEach(row => {
            if (row.children.length > 0) {
                row.removeChild(row.lastElementChild);
            }
        });
    }
}