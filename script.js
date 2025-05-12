const MENU_ITEM_RADIUS = 200;
const MENU_ITEM_AWAY = 400;
const MENU_ITEM_MARGIN = 20;
let interval;
const DefaultCSS = {
    position: "fixed",
    pointerEvents: "auto",
    width: `${MENU_ITEM_RADIUS}px`,
    height: `${MENU_ITEM_RADIUS}px`,
    top: `calc(50vh - ${MENU_ITEM_RADIUS / 2}px)`,
    left: `calc(50vw - ${MENU_ITEM_RADIUS / 2}px)`,
    borderRadius: "50%",
    border: "2px solid aliceblue",
    background: "transparent",
    boxShadow: "0 0 20px 5px rgba(255, 255, 255, 0.6)",
    transition: "all 3s ease-in-out",
    transform: "none",
};
const ActiveCSS = {
    pointerEvents: "auto",
    width: "80%",
    height: "80%",
    top: "10%",
    left: "10%",
    position: "fixed",
    borderRadius: "0px",
    transition: "all 0.3s ease-in-out",
    zIndex: 10,
};
const iframes = document.querySelectorAll("iframe");
iframes.forEach((iframe) => iframe.onload = () => {
    iframe.contentWindow.scrollTo(0, 0);
    iframe.scrolling = "no";
});


function setCSS(element, css) {
    for (const property in css) {
        element.style[property] = css[property];
    }
}



// LOADER
updateLoaderProgress(); // ローダーの進行状況を更新する関数を呼び出す
function updateLoaderProgress() {
    let startTime = performance.now();

    function update() {
        const elapsed = performance.now() - startTime;
        const percentage = Math.min((elapsed / 2000) * 100, 100); // 最大3秒で100%

        // 進行状況を表示
        document.getElementById('loader-rate').innerText = `${Math.floor(percentage)}%`;
        document.getElementById('loader-circle').style.background = `conic-gradient(wheat 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg 360deg)`;
        if (percentage < 100) {
            requestAnimationFrame(update); // まだ100%に到達していない場合、再帰的に呼び出す
        } else {
            document.getElementById("loader-text").innerText = "Complete!";
            setTimeout(() => {
                hideLoader(); // 1秒後にローダーを非表示にする
            }, 1000); // 1秒後に非表示
        }
    }

    update(); // 初期呼び出し
}
function hideLoader() {
    const loader = document.getElementById("loader");
    loader.style.transition = "opacity 0.5s ease-in-out";
    loader.style.opacity = "0"; // フェードアウト
    setTimeout(() => {
        loader.style.display = "none"; // 完全に非表示にする
    }, 500); // フェードアウトの時間と同じだけ待つ
    setTimeout(() => {
        setPosition(menuItems, 0);
        interval = setInterval(function () {
            setPosition(menuItems, 0);
        }, 4000);
    }, 200);
}











let menuItemOffset = 0;
function setPosition(items, value) {
    const length = items.length;
    const angle = (2 * Math.PI) / length;
    for (let i = 0; i < length; i++) {
        const item = items[i];
        i2 = menuItemOffset + i;
        i %= length;
        const x = Math.cos(i2 * angle) * (MENU_ITEM_RADIUS + MENU_ITEM_MARGIN + value);
        const y = Math.sin(i2 * angle) * (MENU_ITEM_RADIUS + MENU_ITEM_MARGIN + value);
        item.style.left = "calc(50vw + " + x + "px" + ` - ${MENU_ITEM_RADIUS / 2}px` + ")";
        item.style.top = "calc(50vh + " + y + "px" + ` - ${MENU_ITEM_RADIUS / 2}px` + ")";
    }
    menuItemOffset += 1;
}


const menuItems = document.querySelectorAll(".menu-item");
let activeItem = null;
menuItems.forEach((item) => {
    setCSS(item, DefaultCSS);
});

menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        clearInterval(interval);
        activeItem = item;
        setPosition(menuItems, MENU_ITEM_AWAY);
        setCSS(item, ActiveCSS);
        const iframe = item.querySelector("iframe");
        iframe.style.pointerEvents = "auto";
        iframe.scrolling = "yes";
        iframe.style.transform = "scale(0.95)";
        document.getElementById("menu-title").style.color = "#222";
    });
});

document.addEventListener("click", (event) => {
    if (activeItem) {
        if (!activeItem.contains(event.target)) {
            setCSS(activeItem, DefaultCSS);
            const iframe = activeItem.querySelector("iframe");
            iframe.style.pointerEvents = "none";
            iframe.contentWindow.scrollTo(0, 0);
            iframe.scrolling = "no";
            iframe.style.transform = "scale(0.75)";
            setPosition(menuItems, 0); // メニューアイテムの位置を再設定
            interval = setInterval(function () {
                setPosition(menuItems, 0);
            }, 4000);
            activeItem = null;
            document.getElementById("menu-title").style.color = "aliceblue";
        }
    }
});



