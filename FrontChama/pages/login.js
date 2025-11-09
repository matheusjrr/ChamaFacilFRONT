document.addEventListener('DOMContentLoaded', () => {
    const authCard = document.getElementById('authCard');
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    const btnBack = document.getElementById('btnBack');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');


    function openRegister() {
        authCard.classList.add('register-active');
        // small delay to improve perceived motion
        setTimeout(() => { document.querySelector('.form-register').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
    }
    function openLogin() {
        authCard.classList.remove('register-active');
    }


    if (toRegister) toRegister.addEventListener('click', (e) => { e.preventDefault(); openRegister(); });
    if (toLogin) toLogin.addEventListener('click', (e) => { e.preventDefault(); openLogin(); });
    if (btnBack) btnBack.addEventListener('click', (e) => { e.preventDefault(); if (document.referrer) window.history.back(); else alert('Ação: voltar (demo)'); });


    // Simple validation and demo submit behaviour
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const func = document.getElementById('loginFunc').value.trim();
            const pass = document.getElementById('loginPass').value.trim();
            if (!func) { alert('Preencha a funcional.'); document.getElementById('loginFunc').focus(); return; }
            if (!pass) { alert('Preencha a senha.'); document.getElementById('loginPass').focus(); return; }
            // Demo: animation then reset
            authCard.style.transform = 'scale(0.995)';
            setTimeout(() => { authCard.style.transform = ''; alert('Login enviado (demo)'); }, 420);
        });
    }


    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const func = document.getElementById('regFunc').value.trim();
            const pass = document.getElementById('regPass').value.trim();
            if (!name) { alert('Preencha o nome.'); document.getElementById('regName').focus(); return; }
            if (!func) { alert('Preencha o funcional.'); document.getElementById('regFunc').focus(); return; }
            if (!pass || pass.length < 6) { alert('Senha precisa ter pelo menos 6 caracteres.'); document.getElementById('regPass').focus(); return; }
            // Demo create
            authCard.style.transform = 'translateY(-4px) scale(0.998)';
            setTimeout(() => { authCard.style.transform = ''; alert('Conta criada (demo).'); openLogin(); }, 500);
        });
    }
    const senhaInput = document.getElementById('senha');
    const toggleSenha = document.getElementById('toggleSenha');
    const iconSenha = document.getElementById('iconSenha');

    // Mostrar/ocultar o olho apenas se houver texto
    senhaInput.addEventListener('input', () => {
        if (senhaInput.value.length > 0) {
            toggleSenha.classList.remove('hidden');
        } else {
            toggleSenha.classList.add('hidden');
            // Garantir que o input volte a ser do tipo senha
            senhaInput.type = 'password';
            // Ícone de olho fechado
            iconSenha.innerHTML = `
      <path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>
    `;
        }
    });

    // Alternar visualização da senha
    toggleSenha.addEventListener('click', () => {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            iconSenha.innerHTML = `
      <path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/>
      <circle cx="10" cy="10" r="3"/>
    `;
        } else {
            senhaInput.type = 'password';
            iconSenha.innerHTML = `
      <path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>
    `;
        }
    });


});