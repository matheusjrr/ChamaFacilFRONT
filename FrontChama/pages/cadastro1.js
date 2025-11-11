document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');

    // Cria a div de mensagens dinamicamente
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = "w-full mb-4 p-3 text-center rounded font-semibold hidden"; // hidden por padrão
    form.prepend(mensagemDiv); // adiciona acima do formulário

    const mostrarMensagem = (msg, tipo = "erro") => {
        mensagemDiv.textContent = msg;
        mensagemDiv.classList.remove("hidden", "bg-red-500", "bg-green-500", "text-white");
        if (tipo === "erro") {
            mensagemDiv.classList.add("bg-red-500", "text-white");
        } else if (tipo === "sucesso") {
            mensagemDiv.classList.add("bg-green-500", "text-white");
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const funcional = document.getElementById('funcional').value.trim();
        const senha = document.getElementById('senha').value.trim();
        const confirmarSenha = document.getElementById('confirmarSenha').value.trim();
        const termos = document.getElementById('termos').checked;

        // Validações
        if (!nome) return mostrarMensagem("Preencha seu nome completo.");
        if (!funcional) return mostrarMensagem("Preencha sua funcional.");
        if (senha.length < 6) return mostrarMensagem("A senha deve ter pelo menos 6 caracteres.");
        if (senha !== confirmarSenha) return mostrarMensagem("As senhas não conferem.");
        if (!termos) return mostrarMensagem("Você precisa concordar com os Termos de Uso.");

        try {
            const response = await fetch("https://localhost:7271/api/v1/Usuario", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Nome_usuario: nome,
                    Funcional: funcional,
                    Senha: senha
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erro ao cadastrar usuário.");
            }

            mostrarMensagem("Cadastro realizado com sucesso!", "sucesso");

            // Redireciona após 1.5s para o FAQ
            setTimeout(() => {
                window.location.href = "faq.html";
            }, 1500);

        } catch (error) {
            mostrarMensagem("Erro: " + error.message);
        }
    });
});
