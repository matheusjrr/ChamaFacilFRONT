document.addEventListener('DOMContentLoaded', () => {
    // Seleção dos elementos principais
    const form = document.getElementById('cadastroForm');
    const btn = form.querySelector('button[type="submit"]');
    const nomeInput = document.getElementById('nome');
    const funcionalInput = document.getElementById('funcional');
    const senhaInput = document.getElementById('senha');
    const confirmarInput = document.getElementById('confirmarSenha');
    const termosInput = document.getElementById('termos');

    // Elementos de erro
    const erroNome = document.getElementById('erroNome');
    const erroFuncional = document.getElementById('erroFuncional');
    const erroSenha = document.getElementById('erroSenha');
    const erroConfirmar = document.getElementById('erroConfirmar');
    const erroTermos = document.getElementById('erroTermos');

    // Reseta visual e mensagens antes de validar
    const resetErros = () => {
        [nomeInput, funcionalInput, senhaInput, confirmarInput].forEach(input => {
            input.classList.remove('input-error');
            input.classList.add('input-normal');
        });

        [erroNome, erroFuncional, erroSenha, erroConfirmar, erroTermos].forEach(el => {
            el.classList.add('hidden');
        });
    };

    // Evento principal de envio do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resetErros();
        let temErro = false;

        // Valores dos campos
        const nome = nomeInput.value.trim();
        const funcional = funcionalInput.value.trim();
        const senha = senhaInput.value;
        const confirmar = confirmarInput.value;
        const termos = termosInput.checked;

        // Validações básicas
        if (!nome) {
            nomeInput.classList.add('input-error');
            erroNome.classList.remove('hidden');
            temErro = true;
        }

        if (!funcional) {
            funcionalInput.classList.add('input-error');
            erroFuncional.classList.remove('hidden');
            temErro = true;
        }

        if (senha.length < 6) {
            senhaInput.classList.add('input-error');
            erroSenha.classList.remove('hidden');
            temErro = true;
        }

        if (senha !== confirmar) {
            confirmarInput.classList.add('input-error');
            erroConfirmar.classList.remove('hidden');
            temErro = true;
        }

        if (!termos) {
            erroTermos.classList.remove('hidden');
            temErro = true;
        }

        if (temErro) return;

        // Feedback visual de carregamento
        btn.disabled = true;
        btn.textContent = 'Cadastrando...';
        btn.classList.add('opacity-60', 'cursor-not-allowed');

        try {
            // Envio da requisição para o backend
            const response = await fetch("https://localhost:7271/api/v1/Usuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Nome_usuario: nome,
                    Funcional: funcional,
                    Senha: senha
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erro ao cadastrar.");
            }

            // Sucesso visual
            btn.textContent = 'Sucesso!';
            btn.classList.remove('opacity-60', 'cursor-not-allowed');
            btn.classList.add('bg-green-600');

            // Redirecionamento corrigido 
            setTimeout(() => {
                window.location.href = "html/faq.html";
            }, 1200);

        } catch (error) {
            alert("Erro: " + error.message);

            // Volta o botão ao normal
            btn.disabled = false;
            btn.textContent = 'CADASTRAR';
            btn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    });

    // Define o estilo inicial dos inputs
    [nomeInput, funcionalInput, senhaInput, confirmarInput].forEach(input => {
        input.classList.add('input-normal');
    });
});
