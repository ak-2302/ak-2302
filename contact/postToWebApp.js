// Google Apps ScriptのWebアプリURL
var WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby7Wn9CjcwWU2cJ1w591NQzy6RUPwT58rkj7JKxBnjVblVu3kk1dHYLqS2AaQ7tcs3CWQ/exec';

// フォーム送信イベントでPOSTリクエストを送信
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var formData = new FormData(form);
        fetch(WEBAPP_URL, {
            method: 'POST',
            body: formData // Content-Typeは自動で設定される
        })
            .then(function (response) {
                console.log('HTTP status:', response.status);
                return response.json().catch(function (err) {
                    console.error('レスポンスJSONパースエラー:', err);
                    throw new Error('レスポンスがJSONではありません');
                });
            })
            .then(function (data) {
                console.log('送信成功:', data);
                alert('送信完了: ' + JSON.stringify(data));
                form.reset();
            })
            .catch(function (error) {
                console.error('送信エラー:', error);
                alert('送信エラー: ' + error);
            });
    });
});