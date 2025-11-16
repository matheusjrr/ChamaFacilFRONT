document.addEventListener('DOMContentLoaded', () => {
    // Captura dos elementos
    const funcionalInput = document.getElementById('funcional');
    const senhaInput = document.getElementById('senha');
    const toggleSenha = document.getElementById('toggleSenha');
    const iconSenha = document.getElementById('iconSenha');
    const btnEntrar = document.getElementById('btnEntrar');

    const erroFuncional = document.getElementById('erroFuncional');
    const erroSenha = document.getElementById('erroSenha');
    const erroGeral = document.getElementById('erroGeral');

    if (!funcionalInput || !senhaInput || !btnEntrar) {
        console.error('IDs essenciais não encontrados: funcional, senha, btnEntrar');
        return;
    }

    // Controle do botão "olho" da senha
    const toggleIconVisibility = () => {
        if (!toggleSenha) return;

        if (senhaInput.value.length > 0) {
            toggleSenha.classList.remove('hidden');
        } else {
            toggleSenha.classList.add('hidden');
            senhaInput.type = 'password';
            if (iconSenha) {
                iconSenha.innerHTML = `<path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>`;
            }
        }
    };

    senhaInput.addEventListener('input', toggleIconVisibility);
    toggleIconVisibility();

    // Alterna mostrar/ocultar senha
    if (toggleSenha) {
        toggleSenha.addEventListener('click', () => {
            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
                iconSenha.innerHTML = `<path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/><circle cx="10" cy="10" r="3"/>`;
            } else {
                senhaInput.type = 'password';
                iconSenha.innerHTML = `<path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>`;
            }
        });
    }

    // Limpa mensagens e bordas de erro
    const resetErrosVisuais = () => {
        [funcionalInput, senhaInput].forEach(i => i.classList.remove('input-error'));
        [erroFuncional, erroSenha, erroGeral].forEach(el => el?.classList.add('hidden'));
    };

    // Botão Entrar
    btnEntrar.addEventListener('click', async (e) => {
        e.preventDefault();
        resetErrosVisuais();

        let temErro = false;

        if (!funcionalInput.value.trim()) {
            funcionalInput.classList.add('input-error');
            erroFuncional.classList.remove('hidden');
            temErro = true;
        }

        if (!senhaInput.value.trim()) {
            senhaInput.classList.add('input-error');
            erroSenha.classList.remove('hidden');
            temErro = true;
        }

        if (temErro) return;

        btnEntrar.disabled = true;
        btnEntrar.classList.add('opacity-60', 'cursor-not-allowed');

        const payload = {
            funcional: funcionalInput.value.trim(),
            senha: senhaInput.value.trim()
        };

        try {
            const response = await fetch('https://localhost:7271/api/v1/Usuario/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                erroGeral.textContent = 'Funcional ou Senha incorretos';
                erroGeral.classList.remove('hidden');
                btnEntrar.disabled = false;
                btnEntrar.classList.remove('opacity-60', 'cursor-not-allowed');
                return;
            }

            const usuario = await response.json();

            if (!usuario || !usuario.id_usuario || usuario.id_usuario <= 0) {
                erroGeral.textContent = 'Login inválido.';
                erroGeral.classList.remove('hidden');
                btnEntrar.disabled = false;
                btnEntrar.classList.remove('opacity-60', 'cursor-not-allowed');
                return;
            }

            // Limpa dados antigos
            sessionStorage.clear();
            localStorage.clear();

            // Salva no sessionStorage
            sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));

            btnEntrar.textContent = 'Entrando...';
            setTimeout(() => window.location.href = 'faq.html', 250);

        } catch (err) {
            console.error('Erro ao conectar à API:', err);
            erroGeral.textContent = 'Erro ao conectar ao servidor';
            erroGeral.classList.remove('hidden');
            btnEntrar.disabled = false;
            btnEntrar.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });

    // Limpa dados se usuário voltar para home (opcional)
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'home.html';
        });
    }
});
