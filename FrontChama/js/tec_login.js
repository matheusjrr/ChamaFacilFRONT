document.addEventListener('DOMContentLoaded', () => {

    // Seleção dos elementos da tela de login
    const senhaInput = document.getElementById('senha');
    const toggleSenha = document.getElementById('toggleSenha');
    const iconSenha = document.getElementById('iconSenha');
    const btnEntrar = document.getElementById('btnEntrar');

    // Exibe/oculta o ícone do olho conforme o usuário digita
    senhaInput.addEventListener('input', () => {
        if (senhaInput.value.length > 0) {
            toggleSenha.classList.remove('hidden');
        } else {
            toggleSenha.classList.add('hidden');
            senhaInput.type = 'password'; // garante que volte oculto
            iconSenha.innerHTML = `
                <path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>
            `;
        }
    });

    // Alterna entre mostrar e ocultar a senha
    toggleSenha.addEventListener('click', () => {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text'; // mostra senha
            iconSenha.innerHTML = `
                <path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/>
                <circle cx="10" cy="10" r="3"/>
            `;
        } else {
            senhaInput.type = 'password'; // oculta senha
            iconSenha.innerHTML = `
                <path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>
            `;
        }
    });

    // Lógica principal do botão Entrar
    if (btnEntrar) {
        btnEntrar.addEventListener('click', async (e) => {
            e.preventDefault();

            const funcional = document.getElementById('funcional').value.trim();
            const senha = senhaInput.value.trim();

            // Validação campo funcional
            if (!funcional) {
                alert('Por favor, preencha o campo Funcional.');
                document.getElementById('funcional').focus();
                return;
            }

            // Validação senha
            if (!senha) {
                alert('Por favor, preencha a senha.');
                senhaInput.focus();
                return;
            }

            try {
                // Chamada à API de autenticação
                const response = await fetch('https://localhost:7271/api/v1/Tecnico/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        funcional: funcional,
                        senha: senha
                    })
                });

                if (!response.ok) {
                    alert('Credenciais incorretas. Tente novamente.');
                    return;
                }

                const tecnico = await response.json();

                // Verifica retorno válido
                if (!tecnico || tecnico.id_tecnico <= 0 || !tecnico.nome_tecnico) {
                    alert('Login inválido. Verifique suas credenciais.');
                    return;
                }

                // Objeto com dados essenciais para uso no sistema
                const tecnicoParaStorage = {
                    id: tecnico.id_tecnico,
                    nome: tecnico.nome_tecnico,
                    funcional: tecnico.funcional
                };

                // Armazena dados na sessão
                sessionStorage.setItem('tecnicoLogado', JSON.stringify(tecnicoParaStorage));

                alert(`Bem-vindo, ${tecnico.nome_tecnico}!`);

                // Redireciona para o FAQ do técnico 
                setTimeout(() => {
                    window.location.href = '../html/tec_faq.html';
                }, 200);

            } catch (error) {
                console.error('Erro ao conectar à API:', error);
                alert('Erro ao conectar ao servidor. Verifique se a API está rodando.');
            }
        });
    }
});
