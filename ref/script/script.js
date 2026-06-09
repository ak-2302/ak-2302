const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
    }, { threshold: 0.1 });

    revealElements.forEach((element) => observer.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

const currentYear = document.getElementById("currentYear");
const currentTime = document.getElementById("currentTime");

if (currentYear) currentYear.textContent = new Date().getFullYear();

function updateTime() {
    if (!currentTime) return;
    currentTime.textContent = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(new Date());
}

updateTime();
setInterval(updateTime, 30000);
