document.addEventListener('DOMContentLoaded', () => {
    const senhaInput = document.getElementById('senha');
    const toggleSenha = document.getElementById('toggleSenha');
    const iconSenha = document.getElementById('iconSenha');
    const btnEntrar = document.getElementById('btnEntrar');

    // === Mostrar/Ocultar ícone do olho ===
    senhaInput.addEventListener('input', () => {
        if (senhaInput.value.length > 0) {
            toggleSenha.classList.remove('hidden');
        } else {
            toggleSenha.classList.add('hidden');
            senhaInput.type = 'password';
            iconSenha.innerHTML = `
                <path d="M1 1l18 18M10 10a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m0 0a3 3 0 0 1 3-3"/>
            `;
        }
    });

    // === Alternar visualização da senha ===
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

    // === Lógica principal do login ===
    if (btnEntrar) {
        btnEntrar.addEventListener('click', async (e) => {
            e.preventDefault();

            const funcional = document.getElementById('funcional').value.trim();
            const senha = senhaInput.value.trim();

            // 🔒 Validações locais
            if (!funcional) {
                alert('Por favor, preencha o campo Funcional.');
                document.getElementById('funcional').focus();
                return;
            }

            if (!senha) {
                alert('Por favor, preencha a senha.');
                senhaInput.focus();
                return;
            }

            try {
                // 🔗 Chamada à API de login do técnico
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

                // 🧩 Verifica se retornou um técnico válido
                if (!tecnico || tecnico.id_tecnico <= 0 || !tecnico.nome_tecnico) {
                    alert('Login inválido. Verifique suas credenciais.');
                    return;
                }

                // ✅ Cria objeto apenas com os campos que queremos armazenar
                const tecnicoParaStorage = {
                    id: tecnico.id_tecnico,
                    nome: tecnico.nome_tecnico,
                    funcional: tecnico.funcional
                };

                // ✅ Salva apenas os dados necessários na sessão
                sessionStorage.setItem('tecnicoLogado', JSON.stringify(tecnicoParaStorage));

                alert(`Bem-vindo, ${tecnico.nome_tecnico}!`);

                // 🔁 Redireciona após o alerta (com pequeno atraso)
                setTimeout(() => {
                    window.location.href = 'tec_faq.html';
                }, 200);

            } catch (error) {
                console.error('Erro ao conectar à API:', error);
                alert('Erro ao conectar ao servidor. Verifique se a API está rodando.');
            }
        });
    }
});
