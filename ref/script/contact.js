const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactText = document.getElementById('contactText');
const contactSubmit = document.getElementById('contactSubmit');

contactSubmit.addEventListener('click', () => {
    const name = contactName.value.trim();
    const email = contactEmail.value.trim();
    const text = contactText.value.trim();
});