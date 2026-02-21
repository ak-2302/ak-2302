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

    fetch("https://docs.google.com/forms/d/e/フォームID/formResponse", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            "entry.123456789": name,
            "entry.987654321": email,
            "entry.111111111": text
        })
    });
    alert("Your message has been sent. Thank you!");
    contactName.value = "";
    contactEmail.value = "";
    contactText.value = "";
    return;
}
