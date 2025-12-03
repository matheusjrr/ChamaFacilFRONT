document.addEventListener('DOMContentLoaded', () => {
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
        // usa somente a classe 'hidden' para mostrar/ocultar (não mexer no style.display)
        if (senhaInput.value.length > 0) {
            toggleSenha.classList.remove('hidden'); /* mostra o botão do olho */
            // sincroniza o ícone quando começa a digitar (deve começar como "senha oculta")
            if (iconSenha) {
                if (senhaInput.type === 'password') {
                    // ícone de olho ABERTO (indica que ao clicar vai mostrar)
                    iconSenha.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    `;
                } else {
                    // ícone de olho RISCADO/FECHADO (senha visível)
                    iconSenha.innerHTML = `
                        <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="2" y1="2" x2="22" y2="22"></line>
                    `;
                }
            }
        } else {
            toggleSenha.classList.add('hidden'); /* esconde o botão do olho se o input estiver vazio */
            senhaInput.type = "password"; /* garante que volta pra password quando limpa */

            // reseta ícone para estado padrão (olho aberto)
            if (iconSenha) {
                iconSenha.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
            }
        }
    };

    // ---------- INICIALIZAÇÃO CORRETA DO ESTADO (IMPORTANTE) ----------
    // Garante que o botão do olho comece escondido e que o input seja password.
    // NÃO usar style.display aqui; usar a classe 'hidden' apenas.
    toggleSenha.classList.add('hidden'); /* inicia escondido pra não bugar no 1º digito */
    senhaInput.type = 'password'; /* garante o tipo inicial */

    // inicializa visibilidade conforme possível valor já presente no input
    toggleIconVisibility();

    // monitora digitação do input de senha
    senhaInput.addEventListener('input', toggleIconVisibility); /* ativa/oculta o olho quando digita */

    // clique do botão do olho alterna entre texto e password
    toggleSenha.addEventListener('click', (e) => {
        e.preventDefault(); /* evita bugs de comportamento padrão do botão */

        if (senhaInput.type === 'password') {
            senhaInput.type = 'text'; /* muda pra texto (senha visível) */
            // olho riscado/fechado para indicar que agora clicar vai esconder
            iconSenha.innerHTML = `
                <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="2" y1="2" x2="22" y2="22"></line>
            `;
        } else {
            senhaInput.type = 'password'; /* muda pra password (senha oculta) */
            // olho aberto para indicar que clicar vai mostrar
            iconSenha.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }

        senhaInput.focus(); /* mantém o foco no input */
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

    // Limpa dados se usuário voltar para home 
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'home.html';
        });
    }
});