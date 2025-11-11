// Sombra e blur na navbar ao rolar
document.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// Animação de entrada suave ao aparecer na tela
const elements = document.querySelectorAll("[data-animate]");
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
            observer.unobserve(entry.target);
        }
    });
});
elements.forEach((el) => observer.observe(el));