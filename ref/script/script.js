(function () {
    "use strict";

    const CONTACT_ENDPOINT = "https://contact-worker.koyoarai93.workers.dev";
    const modal = document.getElementById("contentModal");
    const modalContent = document.getElementById("modalContent");
    const modalNumber = document.getElementById("modalNumber");
    const closeButtons = document.querySelectorAll("[data-modal-close]");
    const triggerMap = {
        PROFILE: { template: "profileContent", number: "01 / 04" },
        TOOL: { template: "toolContent", number: "02 / 04" },
        LINK: { template: "linkContent", number: "03 / 04" },
        CONTACT: { template: "contactContent", number: "04 / 04" }
    };
    let lastFocusedElement = null;

    const currentYear = document.getElementById("currentYear");
    const currentTime = document.getElementById("currentTime");

    if (currentYear) currentYear.textContent = new Date().getFullYear();

    function updateTime() {
        if (!currentTime) return;
        const time = new Intl.DateTimeFormat("ja-JP", {
            timeZone: "Asia/Tokyo",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(new Date());
        currentTime.textContent = `JST ${time}`;
    }

    function setupContactForm() {
        const form = document.getElementById("contactForm");
        if (!form) return;

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const status = document.getElementById("formStatus");
            const submitButton = document.getElementById("contactSend");
            const formData = new FormData(form);
            const payload = {
                name: formData.get("name")?.trim(),
                email: formData.get("email")?.trim(),
                message: formData.get("message")?.trim()
            };

            if (!payload.name || !payload.email || !payload.message) {
                status.textContent = "すべての項目を入力してください。";
                return;
            }

            submitButton.disabled = true;
            status.textContent = "送信中...";

            try {
                const response = await fetch(CONTACT_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Request failed");
                form.reset();
                status.textContent = "送信しました。";
            } catch {
                status.textContent = "送信できませんでした。時間をおいて再度お試しください。";
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    function openModal(label) {
        const content = triggerMap[label];
        const template = content && document.getElementById(content.template);
        if (!modal || !modalContent || !template) return;

        lastFocusedElement = document.activeElement;
        modalContent.replaceChildren(template.content.cloneNode(true));
        modalContent.querySelector("[data-modal-title]")?.setAttribute("id", "modalTitle");
        modalNumber.textContent = content.number;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.querySelector(".modal__close")?.focus();
        setupContactForm();
    }

    function closeModal() {
        if (!modal?.classList.contains("is-open")) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        lastFocusedElement?.focus();
    }

    window.addEventListener("sphere-select", (event) => openModal(event.detail.label));
    closeButtons.forEach((button) => button.addEventListener("click", closeModal));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
    });

    updateTime();
    window.setInterval(updateTime, 30000);
}());
