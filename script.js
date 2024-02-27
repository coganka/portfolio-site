const dynamicText = document.querySelector("h3 span");
const words = ["Programmer", "Backend Developer", "Game Developer"];

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
}

typeEffect();