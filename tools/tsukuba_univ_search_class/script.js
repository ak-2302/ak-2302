function getPageURL() {
    return encodeURIComponent(window.location.href);
}

function shareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=筑波大教室検索はこちら！&url=${getPageURL()}`;
    window.open(url, '_blank');
}

function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${getPageURL()}`;
    window.open(url, '_blank');
}

function copyURL() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => alert("URLをコピーしました！"))
        .catch(() => alert("コピーに失敗しました"));
}









let csvArray = [];
document.getElementById('file').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;

        // PapaParse でパース
        const result = Papa.parse(text.trim(), {
            skipEmptyLines: true,
        });

        csvArray = result.data; // 2次元配列として取得
        console.log("csv処理完了:", csvArray);
        document.getElementById("invisible-until-upload").style.display = "flex";
        // ここでcsvArrayを使って処理できます（保存、表示など）
    };

    reader.readAsText(file, 'UTF-8');
});







document.getElementById('search-button').addEventListener('click', function () {
    const searchText = document.getElementById('search-input').value;
    search(searchText);
})

function search(searchText) {
    console.log(searchText, "検索");
    // 2列目が searchText に一致する行をすべて返す
    var results = csvArray.filter(row => row[1] === searchText);
    console.log(results[0]);
    clearAllSearchItems();
    for (let i = 0; i < results.length; i++) {
        addSearchItem(results[i][0], results[i][1], results[i][7]);
    }

}







function clearAllSearchItems() {
    const elementsContainer = document.querySelector('.elements');
    elementsContainer.innerHTML = ''; // 全部削除
    console.log("クリア")
}



function addSearchItem(classIdText, classNameText, classroomNameText) {
    var newElement = document.createElement('div');
    newElement.classList.add('element');

    var classInfo = document.createElement('div');
    classInfo.classList.add('class-info');

    var classId = document.createElement('div');
    classId.classList.add('class-id');
    classId.textContent = classIdText;

    var className = document.createElement('div');
    className.classList.add('class-name');
    className.textContent = classNameText;

    var classroomName = document.createElement('div');
    classroomName.classList.add('classroom-name');
    classroomName.textContent = classroomNameText;

    // 構造を組み立てる
    classInfo.appendChild(classId);
    classInfo.appendChild(className);
    newElement.appendChild(classInfo);
    newElement.appendChild(classroomName);

    // 既存の要素に追加
    document.querySelector('.elements').appendChild(newElement);
    console.log("追加")
}