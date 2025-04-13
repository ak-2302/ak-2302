document.getElementById("main").style.display = "none";
window.addEventListener("load", function () {
    setTimeout(function () {
        document.getElementById("loader").style.display = "none";
        document.getElementById("main").style.display = "flex";
    }, 3000); // 2秒（2000ミリ秒）待つ
});
content_twitter = document.getElementById("content_twitter");
content_github = document.getElementById("content_github");
content_qiita = document.getElementById("content_qiita");
content_twitter.style.display = "none";
content_github.style.display = "none";
content_qiita.style.display = "none";
let open_tab = null;
document.getElementById("tab_twitter").addEventListener("click", function () {
    if (open_tab != "tab_twitter") {
        open_tab = "tab_twitter";
        content_twitter.style.display = "block";
        content_github.style.display = "none";
        content_qiita.style.display = "none";
    } else {
        open_tab = null;
        content_twitter.style.display = "none";
        content_github.style.display = "none";
        content_qiita.style.display = "none";
    }
});
document.getElementById("tab_github").addEventListener("click", function () {
    if (open_tab != "tab_github") {
        open_tab = "tab_github";
        content_twitter.style.display = "none";
        content_github.style.display = "flex";
        content_qiita.style.display = "none";
    } else {
        open_tab = null;
        content_twitter.style.display = "none";
        content_github.style.display = "none";
        content_qiita.style.display = "none";
    }
});
document.getElementById("tab_qiita").addEventListener("click", function () {
    if (open_tab != "tab_qiita") {
        open_tab = "tab_qiita";
        content_twitter.style.display = "none";
        content_github.style.display = "none";
        content_qiita.style.display = "block";
    } else {
        open_tab = null;
        content_twitter.style.display = "none";
        content_github.style.display = "none";
        content_qiita.style.display = "none";
    }
});


function progress_cat() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    let cat = document.getElementById("cat");
    let cat_width = cat.offsetWidth;
    let cat_height = cat.offsetHeight;
    let cat2 = document.getElementById("cat2");
    let cat2_width = cat2.offsetWidth;
    let cat2_height = cat2.offsetHeight;
    cat.style.left = scrollPercent * (window.innerWidth - cat_width - cat2_width) / 100 + "px";
    cat.style.bottom = Math.max(0, Math.sin(scrollPercent / 100 * Math.PI * 5)) * cat_height / 4 + "px";
    cat2.style.bottom = Math.max(0, Math.sin(scrollPercent / 100 * Math.PI * 6)) * cat2_height / 4 + "px";
}


window.addEventListener("scroll", () => {
    progress_cat();
});
window.addEventListener("resize", () => {
    progress_cat();
})
window.addEventListener("click", () => {
    progress_cat();
})