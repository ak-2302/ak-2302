const CONTACT_ENDPOINT = "https://contact-worker.koyoarai93.workers.dev";
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById("contactSend");
    const formData = new FormData(contactForm);
    const payload = {
        name: formData.get("name")?.trim(),
        email: formData.get("email")?.trim(),
        message: formData.get("message")?.trim()
    };

    if (!payload.name || !payload.email || !payload.message) {
        formStatus.textContent = "すべての項目を入力してください。";
        return;
    }

    submitButton.disabled = true;
    formStatus.textContent = "送信中...";

    try {
        const response = await fetch(CONTACT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        contactForm.reset();
        formStatus.textContent = "送信しました。";
    } catch {
        formStatus.textContent = "送信できませんでした。時間をおいて再度お試しください。";
    } finally {
        submitButton.disabled = false;
    }
});
