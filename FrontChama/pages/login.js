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

    // proteção: garante que os elementos existam (se faltar, mostra erro no console)
    if (!funcionalInput || !senhaInput || !btnEntrar) {
        console.error('elementos essenciais do login não encontrados. verifica ids: funcional, senha, btnEntrar');
        return;
    }

    // mostrar/ocultar ícone do olho conforme input
    const toggleIconVisibility = () => {
        if (!toggleSenha) return;
        if (senhaInput.value.length > 0) toggleSenha.classList.remove('hidden');
        else {
            toggleSenha.classList.add('hidden');
            senhaInput.type = 'password';
            if (iconSenha) iconSenha.innerHTML = `<path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>`;
        }
    };
    senhaInput.addEventListener('input', toggleIconVisibility);
    toggleIconVisibility();

    // alterna visual da senha
    if (toggleSenha) {
        toggleSenha.addEventListener('click', () => {
            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
                if (iconSenha) iconSenha.innerHTML = `
          <path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/>
          <circle cx="10" cy="10" r="3"/>
        `;
            } else {
                senhaInput.type = 'password';
                if (iconSenha) iconSenha.innerHTML = `<path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>`;
            }
        });
    }

    // helper: reset de estilos/erros
    const resetErrosVisuais = () => {
        [funcionalInput, senhaInput].forEach(i => {
            i.classList.remove('input-error');
        });
        [erroFuncional, erroSenha, erroGeral].forEach(el => {
            if (el) el.classList.add('hidden');
        });
    };

    // valida local e faz fetch
    btnEntrar.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('clicou em entrar');

        resetErrosVisuais();
        let temErro = false;

        // valida funcional
        if (!funcionalInput.value.trim()) {
            funcionalInput.classList.add('input-error');
            if (erroFuncional) erroFuncional.classList.remove('hidden');
            temErro = true;
        } else {
            funcionalInput.classList.remove('input-error');
        }

        // valida senha
        if (!senhaInput.value.trim()) {
            senhaInput.classList.add('input-error');
            if (erroSenha) erroSenha.classList.remove('hidden');
            temErro = true;
        } else {
            senhaInput.classList.remove('input-error');
        }

        if (temErro) {
            console.log('validação local falhou');
            return;
        }

        // desabilita botão temporariamente (feedback)
        btnEntrar.disabled = true;
        btnEntrar.classList.add('opacity-60', 'cursor-not-allowed');

        const payload = {
            funcional: funcionalInput.value.trim(),
            senha: senhaInput.value.trim()
        };

        console.log('payload de login:', payload);

        try {
            const response = await fetch('https://localhost:7271/api/v1/Usuario/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('status da response:', response.status);

            if (!response.ok) {
                // se 400/401/etc -> mostra erro geral
                if (erroGeral) {
                    erroGeral.textContent = 'Funcional ou Senha incorretos';
                    erroGeral.classList.remove('hidden');
                }
                btnEntrar.disabled = false;
                btnEntrar.classList.remove('opacity-60', 'cursor-not-allowed');
                return;
            }

            const usuario = await response.json();
            console.log('usuario recebido:', usuario);

            if (!usuario || !usuario.id_usuario || usuario.id_usuario <= 0) {
                if (erroGeral) {
                    erroGeral.textContent = 'Login inválido. Verifique suas credenciais';
                    erroGeral.classList.remove('hidden');
                }
                btnEntrar.disabled = false;
                btnEntrar.classList.remove('opacity-60', 'cursor-not-allowed');
                return;
            }

            // sucesso: salva e redireciona
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            // opcional: efeito bonitinho antes do redirect
            btnEntrar.textContent = 'entrando...';
            setTimeout(() => window.location.href = 'faq.html', 250);

        } catch (err) {
            console.error('erro ao conectar à api:', err);
            // mostra mensagem amigável (pode ser CORS / SSL / server down)
            if (erroGeral) {
                erroGeral.textContent = 'Erro ao conectar ao servidor';
                erroGeral.classList.remove('hidden');
            }
            // reativa o botão
            btnEntrar.disabled = false;
            btnEntrar.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });
});
