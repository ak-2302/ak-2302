let GITHUB_TOKEN = "";
let GITHUB_USERNAME = "";
let envVars = {};
let fetchedData = [];

let GITHUB_API_USE_COUNT = 0;
const GITHUB_API_COUNT = document.getElementById("github-api-count");
document.getElementById("file").addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n');
        lines.forEach(line => {
            if (!line || line.trim().startsWith('#')) return;
            const [key, ...rest] = line.split('=');
            const value = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
            if (key && value !== undefined) {
                envVars[key.trim()] = value;
            }
        });

        if ("GITHUB_TOKEN" in envVars) {
            GITHUB_TOKEN = envVars["GITHUB_TOKEN"];
            document.getElementById("github-token").value = GITHUB_TOKEN;
        }
        if ("GITHUB_USERNAME" in envVars) {
            GITHUB_USERNAME = envVars["GITHUB_USERNAME"];
            document.getElementById("github-username").value = GITHUB_USERNAME;
        }

        console.log("✅ 環境変数をファイルから読み込みました。");
    };
    reader.readAsText(file);
});

document.getElementById("load-github-info").addEventListener("click", async () => {
    // ファイルで取れてなければ手入力から取得
    if (!GITHUB_TOKEN) GITHUB_TOKEN = document.getElementById("github-token").value.trim();
    if (!GITHUB_USERNAME) GITHUB_USERNAME = document.getElementById("github-username").value.trim();

    if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
        alert("GitHubのトークンとユーザー名が必要です！");
        return;
    }

    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=all&per_page=100`;

    try {
        GITHUB_API_USE_COUNT++;
        GITHUB_API_COUNT.innerText = GITHUB_API_USE_COUNT;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const data = await response.json();
        fetchedData = data;

        const repoSelect = document.getElementById("github-repo");

        data.forEach(repo => {
            const option = document.createElement("option");
            option.value = repo.name;
            option.text = repo.name;
            repoSelect.add(option);
        });

        console.log("✅ リポジトリ取得完了");
        document.getElementById("load-github-info-text").style.display = "inline-block";
    } catch (err) {
        console.error("❌ リポジトリの取得に失敗:", err);
    }
});

document.getElementById("github-repo").addEventListener("change", () => {
    const selected = document.getElementById("github-repo").value;
    const info = fetchedData.find(repo => repo.name === selected);
    if (!info) return;

    document.getElementById("repo-name").innerText = info.name;
    document.getElementById("repo-url").innerText = info.html_url;
    document.getElementById("repo-size").innerText = info.size + " KB";
});

document.getElementById("download-repo").addEventListener("click", () => {
    downloadRepoAsZip();
});

async function downloadRepoAsZip() {
    const zip = new JSZip();
    const selected = document.getElementById("github-repo").value;

    // コンテンツを再帰的に取得してZIPに追加
    async function fetchAndZip(path = "") {
        const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${selected}/contents/${path}`;
        GITHUB_API_USE_COUNT++;
        GITHUB_API_COUNT.innerText = GITHUB_API_USE_COUNT;
        const res = await fetch(apiUrl, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json"
            }
        });
        const items = await res.json();

        for (const item of items) {
            if (item.type === "file") {
                const fileRes = await fetch(item.download_url);
                const blob = await fileRes.blob();
                const filePath = item.path;
                zip.file(filePath, blob);
            } else if (item.type === "dir") {
                await fetchAndZip(item.path);  // 再帰
            }
        }
    }

    await fetchAndZip("");

    // ZIPにまとめてダウンロード
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${selected}.zip`);
}
