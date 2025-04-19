const passwordFields = document.querySelectorAll('input[type="password"]');
const passwordFieldsStyle = Array.from(passwordFields).map(field => field.style);
const passwordFieldsStyleDefault = Array.from(passwordFields).map(field => field.style.backgroundColor);
const passwordFieldsColors = new Array(passwordFields.length);
const highLightColors = ['yellow', 'orange', 'red', 'blue', 'green'];
const highLightColorsEmoji = ['🟨', '🟧', '🟥', '🟦', '🟩'];
let boolHighlight = true;
let highLightState = false;
const highLightInterval = 1000;

function sendMessage() {
    for (let i = 0; i < passwordFields.length; i++) {
        passwordFieldsColors[i] = highLightColorsEmoji[i % highLightColorsEmoji.length];
        chrome.runtime.sendMessage({
            password: passwordFields[i].value,
            color: passwordFieldsColors[i]
        });
    }
}


// background から update 要請を受けたら再送信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "update") {
        sendMessage();
    } else if (message.action === "highlightToggle") {
        boolHighlight = !boolHighlight;
    }
});

function highlightPasswordFields() {
    if (boolHighlight) {
        if (highLightState) {
            for (let i = 0; i < passwordFieldsStyle.length; i++) {
                passwordFieldsStyle[i].backgroundColor = highLightColors[i % highLightColors.length];
            }
            highLightState = !highLightState;
        } else {
            for (let i = 0; i < passwordFieldsStyle.length; i++) {
                passwordFieldsStyle[i].backgroundColor = passwordFieldsStyleDefault[i];
            }
            highLightState = !highLightState;
        }
    } else {
        for (let i = 0; i < passwordFieldsStyle.length; i++) {
            passwordFieldsStyle[i].backgroundColor = passwordFieldsStyleDefault[i];
        }
    }
}

setInterval(highlightPasswordFields, highLightInterval);
