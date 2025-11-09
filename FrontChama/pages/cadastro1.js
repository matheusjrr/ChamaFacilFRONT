document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const nascimento = document.getElementById('nascimento').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const funcional = document.getElementById('funcional').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();
        const confirmarSenha = document.getElementById('confirmarSenha').value.trim();
        const termos = document.getElementById('termos').checked;

        if (!nome) return alert("Preencha seu nome completo.");
        if (!nascimento) return alert("Preencha sua data de nascimento.");
        if (!cpf || cpf.length !== 11) return alert("Informe um CPF válido (11 números).");
        if (!funcional) return alert("Preencha sua funcional.");
        if (!email.includes('@')) return alert("Digite um e-mail válido.");
        if (senha.length < 6) return alert("A senha deve ter pelo menos 6 caracteres.");
        if (senha !== confirmarSenha) return alert("As senhas não conferem.");
        if (!termos) return alert("Você precisa concordar com os Termos de Uso.");

        alert("Cadastro realizado com sucesso!");
        window.location.href = "faq.html"; // 🔹 redireciona para FAQ após o cadastro
    });
});