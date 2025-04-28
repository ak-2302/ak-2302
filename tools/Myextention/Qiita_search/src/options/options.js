// This file contains the JavaScript code to control the behavior of the options page.
// It handles saving and loading user settings.

document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    const inputField = document.getElementById('inputField');

    // Load saved settings
    chrome.storage.sync.get(['userSetting'], function(result) {
        if (result.userSetting) {
            inputField.value = result.userSetting;
        }
    });

    // Save settings on button click
    saveButton.addEventListener('click', function() {
        const userSetting = inputField.value;
        chrome.storage.sync.set({ userSetting: userSetting }, function() {
            console.log('Settings saved:', userSetting);
        });
    });
});