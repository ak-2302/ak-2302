const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactText = document.getElementById('contactText');
const contactSubmit = document.getElementById('contactSubmit');

function postContact(name, email, text) {
    let valid = true;
    if (name.length < 1) {
        valid = false;
        alert("Please enter a valid name.");
    }
    if (!email.includes("@")) {
        valid = false;
        alert("Please enter a valid email address.");
    }
    if (text.length < 1) {
        valid = false;
        alert("Please enter a message.");
    }
    if (!valid) return;

    fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSeN11KNZxj4w-VaxPIvZRN9hoj7tIpegyyFmN3EOmNS5CCzfw/formResponse", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            "entry.33486175": name,
            "entry.345460095": email,
            "entry.1974290344": text
        })
    });
    alert("Your message has been sent. Thank you!");
    contactName.value = "";
    contactEmail.value = "";
    contactText.value = "";
    return;
}
