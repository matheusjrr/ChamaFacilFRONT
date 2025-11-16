// home.js
document.addEventListener('DOMContentLoaded', () => {
    // ===================== LIMPA STORAGE ===================== //
    sessionStorage.clear();
    localStorage.clear();

    // ===================== EFEITO DE SCROLL NA NAVBAR ===================== //
    const header = document.querySelector("header");
    document.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");   // adiciona sombra/blur
        } else {
            header.classList.remove("scrolled"); // remove efeito
        }
    });

    // ===================== ANIMAÇÃO DE ELEMENTOS ===================== //
    const elements = document.querySelectorAll("[data-animate]");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-fadeIn"); // aplica animação
                observer.unobserve(entry.target); // evita repetir animação
            }
        });
    });
    elements.forEach(el => observer.observe(el));
});
