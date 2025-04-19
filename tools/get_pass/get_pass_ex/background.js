chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[background] message:", message);

    if (message.action === "update" && message.tabId) {
        chrome.tabs.sendMessage(message.tabId, { action: "update" });
    } else if (message.action === "highlightToggle") {
        chrome.tabs.sendMessage(message.tabId, { action: "highlightToggle" });
    }
});
