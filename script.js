// === Smooth anchor scrolling for inner scroller ===
document.addEventListener('DOMContentLoaded', () => {
const scroller = document.querySelector('.main-container');
const headerHVar = getComputedStyle(document.documentElement)
    .getPropertyValue('--header-h')
    .trim();
const headerH = parseInt(headerHVar) || 72;

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target || !scroller) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + scroller.scrollTop - headerH;
    scroller.scrollTo({ top, behavior: 'smooth' });
    });
});
});

// === Typewriter effect (your original code) ===
const dynamicText = document.querySelector("h3 span");
const words = ["Programmer", "Backend Dev", "Game Dev"];

let wordIdx = 0;
let charIdx = 0;
let isDeleting = false;

const typeEffect = () => {
    const curWord = words[wordIdx];
    const curChar = curWord.substring(0, charIdx);
    dynamicText.textContent = curChar;

    if (!isDeleting && charIdx < curWord.length) {
        charIdx++;
        setTimeout(typeEffect, 150);
    } else if (isDeleting && charIdx > 0) {
        charIdx--;
        setTimeout(typeEffect, 100);
    } else {
        isDeleting = !isDeleting;
        wordIdx = !isDeleting ? (wordIdx + 1) % words.length : wordIdx;
        setTimeout(typeEffect, 1200);
    }
};

typeEffect();
