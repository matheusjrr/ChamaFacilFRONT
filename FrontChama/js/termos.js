document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos da interface
    const btnAgree = document.getElementById('btnAgree');
    const checkbox = document.getElementById('agreeCheckbox');
    const btnClose = document.getElementById('btnClose');

    // Habilita ou desabilita o botão conforme o checkbox é marcado
    checkbox.addEventListener('change', () => {
        btnAgree.disabled = !checkbox.checked;
    });

    // Ao clicar em "Concordo", valida e redireciona para a página de cadastro
    btnAgree.addEventListener('click', () => {
        if (!checkbox.checked) return; // segurança extra
        window.location.href = '../html/cadastro1.html'; // navegação após aceite
    });

    // Botão de fechar/voltar no modal - também redireciona para cadastro
    btnClose.addEventListener('click', () => {
        window.location.href = '../html/cadastro1.html';
    });
});
