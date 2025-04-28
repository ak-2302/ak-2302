let searchTimeout; // タイマー用変数
const searchHistory = []; // 検索時刻を記録する配列

// 検索フォームを取得
const searchForm = document.querySelector('form[action="/search"]');

// 検索フォームが存在する場合、入力イベントリスナーを追加
if (searchForm) {
    const searchInput = searchForm.querySelector('input[name="q"]');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const query = event.target.value.trim(); // 入力された文字列を取得
            console.log(`現在の入力: ${query}`);

            // 入力が半角スペースまたは全角スペースで終わっている場合
            if (query.length > 0 && (query.endsWith(' ') || query.endsWith('　'))) {
                // 前回のタイマーをクリア
                clearTimeout(searchTimeout);

                // 一定秒数（例: 2秒）後に検索を実行
                searchTimeout = setTimeout(async () => {
                    try {
                        // Qiita API を使用して検索
                        const response = await fetch(`https://qiita.com/api/v2/items?query=${encodeURIComponent(query)}`, {
                            headers: {
                                'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // 必要に応じてアクセストークンを設定
                            }
                        });

                        if (response.ok) {
                            const results = await response.json();
                            console.log('検索結果:', results);

                            // 検索時刻を記録
                            const now = new Date();
                            searchHistory.push(now);

                            // 直近1時間の検索回数を計算
                            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                            const recentSearches = searchHistory.filter(time => time > oneHourAgo);
                            console.log(`直近1時間の検索回数: ${recentSearches.length}`);

                            // 必要に応じて、検索結果をページに表示する処理を追加
                        } else {
                            console.error('APIエラー:', response.status, response.statusText);
                        }
                    } catch (error) {
                        console.error('通信エラー:', error);
                    }
                }, 1000); // n秒待機
            } else {
                // 入力が条件を満たさない場合はタイマーをクリア
                clearTimeout(searchTimeout);
            }
        });
    }
}