document.addEventListener('DOMContentLoaded', () => {
    // elementos
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

    // Função que controla visibilidade do botão do olho
    const toggleIconVisibility = () => {
        if (!toggleSenha) return;
        if (senhaInput.value.length > 0) {
            // mostra o botão do olho
            toggleSenha.classList.remove('hidden');
            toggleSenha.style.pointerEvents = 'auto';

            // sincroniza o ícone quando começa a digitar (deve começar como "senha oculta")
            if (iconSenha) {
                if (senhaInput.type === 'password') {
                    // ícone de olho FECHADO / riscado (representa senha escondida)
                    iconSenha.innerHTML = `
                        <path d="M2 2l16 16"/>
                        <path d="M1 10s4-7 9-7 5 2.5 7 5"/>
                        <path d="M14 14a9.94 9.94 0 0 1-4 .97c-5 0-9-7-9-7a13.94 13.94 0 0 1 3.98-4.09"/>
                    `;
                } else {
                    // ícone de olho ABERTO (senha visível)
                    iconSenha.innerHTML = `
                        <path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/>
                        <circle cx="10" cy="10" r="3"/>
                    `;
                }
            }
        } else {
            // esconde o botão e garante que o input volte a password
            toggleSenha.classList.add('hidden');

            // reseta ícone para o padrão correto (sempre oculto)
            if (iconSenha) {
                // coloca o SVG padrão (olho fechado/oculto)
                iconSenha.innerHTML = `
                    <path d="M2 2l16 16"/>
                    <path d="M1 10s4-7 9-7 9 7 9 7-1.43 2.5-3.5 4.22"/>
                `;
            }
            senhaInput.type = 'password';
        }
    };

    // inicializa visibilidade
    toggleIconVisibility();

    // atualiza quando digita
    senhaInput.addEventListener('input', toggleIconVisibility);

    // alterna mostrar/ocultar senha ao clicar no botão
    toggleSenha.addEventListener('click', (e) => {
    e.preventDefault();

    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        // olho aberto
        iconSenha.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    } else {
        senhaInput.type = 'password';
        // olho riscado COM a bolinha
        iconSenha.innerHTML = `
            <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"></path>
            <circle cx="12" cy="12" r="3"></circle>
            <line x1="2" y1="2" x2="22" y2="22"></line>
        `;
    }

    senhaInput.focus();
});


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
