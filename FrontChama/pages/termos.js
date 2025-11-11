document.addEventListener('DOMContentLoaded', () => {
    const btnAgree = document.getElementById('btnAgree');
    const checkbox = document.getElementById('agreeCheckbox');
    const btnClose = document.getElementById('btnClose');

    // habilita/desabilita o botão conforme checkbox
    checkbox.addEventListener('change', () => {
        btnAgree.disabled = !checkbox.checked;
    });

    // ação do botão Concordo: redireciona para cadastro (pode alterar)
    btnAgree.addEventListener('click', () => {
        if (!checkbox.checked) return;
        // aqui poderia salvar registro de aceite via API; por enquanto redireciona
        window.location.href = 'cadastro1.html';
    });

    // botão X/voltar no canto superior - leva ao cadastro
    btnClose.addEventListener('click', () => {
        window.location.href = 'cadastro1.html';
    });
});