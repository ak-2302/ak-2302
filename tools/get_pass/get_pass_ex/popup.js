const passwordDisplaySection = document.getElementById('passwords');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { password, color } = message;
    const temp = document.createElement('p');
    temp.innerText = `${color} ${password}`;
    passwordDisplaySection.appendChild(temp);
});

document.getElementById("highlightToggle").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.runtime.sendMessage({
            action: "highlightToggle",
            tabId: tabs[0].id
        });
    });
})

document.getElementById("update").addEventListener("click", () => {
    passwordDisplaySection.innerHTML = '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.runtime.sendMessage({
            action: "update",
            tabId: tabs[0].id
        });
    });
});
