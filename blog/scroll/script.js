const ANGLE_RANGE = 10; // degrees
const ANGLE_THRESHOLD = 1; // degrees

let alpha_start = null;
let beta_start = null;
let gamma_start = null;

let lastScroll_alpha = null;
let lastScroll_beta = null;
let lastScroll_gamma = null;

function resetOrientation() {
    alpha_start = null;
    beta_start = null;
    gamma_start = null;
}

window.addEventListener('deviceorientation', (event) => {
    if (alpha_start === null) {
        alpha_start = event.alpha;
    }
    if (beta_start === null) {
        beta_start = event.beta;
    }

    if (gamma_start === null) {
        gamma_start = event.gamma;
    }


    const alpha = event.alpha; // Z軸回転（0〜360°、コンパス方位）
    const beta = event.beta;   // X軸回転（上下の傾き、-180〜180°）
    const gamma = event.gamma; // Y軸回転（左右の傾き、-90〜90°）

    if (Math.abs(alpha - lastScroll_alpha) > ANGLE_THRESHOLD) {
        lastScroll_alpha = alpha;
        const scrollPercent = Math.floor((alpha / 360) * 100);
        scrollToPercent(scrollPercent);
    }
});

const pageHeight = document.documentElement.scrollHeight;


function scrollToPercent(percent) {
    const scrollPosition = (pageHeight - window.innerHeight) * (percent / 100);
    window.scrollTo({
        top: scrollPosition,
        behavior: 'auto'
    });
}
