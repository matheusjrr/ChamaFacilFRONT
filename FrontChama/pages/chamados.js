// Troca de seções
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.chamado-section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const sectionId = btn.getAttribute('data-section');
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    });
});

// Modal
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const detalheBtns = document.querySelectorAll('.detalhes-btn');

detalheBtns.forEach(btn => {
    btn.addEventListener('click', () => modal.style.display = 'flex');
});
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
});

// Envio de chamado (simulação)
const form = document.getElementById('form-chamado');
form.addEventListener('submit', e => {
    e.preventDefault();
    alert('Chamado enviado com sucesso!');
    form.reset();
});