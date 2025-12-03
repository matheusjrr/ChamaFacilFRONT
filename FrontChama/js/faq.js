document.addEventListener('DOMContentLoaded', () => {
    const faqList = document.getElementById('faqList');
    const searchInput = document.getElementById('searchInput');

    if (!faqList) {
        console.error('Elemento #faqList não encontrado.');
        return;
    }

    const faqData = [
        { q: 'Não estou conseguindo acessar meu login. O que fazer?', a: 'Verifique se você está usando a funcional e senha corretas. Caso tenha esquecido a senha, use a opção de recuperação. Se o problema persistir, abra um chamado informando o erro ou entre em contato com o suporte.' },
        { q: 'O sistema está fora do ar. Como proceder?', a: 'Confirme a conectividade de internet e aguarde alguns minutos. Se o problema persistir, verifique avisos na área de manutenção ou abra um chamado informando horário e mensagem de erro.' },
        { q: 'Esqueci minha senha. Como recuperar?', a: 'Use a opção "Recuperar senha" na tela de login. Você receberá instruções por e-mail cadastrado. Caso não receba, abra um chamado informando sua funcional.' },
        { q: 'Como abrir um chamado de suporte técnico?', a: 'Acesse a aba "Chamado" → "Novo Chamado". Preencha categoria, descrição detalhada e anexos (se houver). Depois clique em Enviar.' },
        { q: 'Como acompanhar o status do meu chamado?', a: 'Vá em "Pendentes" para ver chamados abertos ou "Concluídos" para finalizados. Cada chamado mostra histórico de atualizações e responsável.' },
        { q: 'Preciso cancelar um chamado. Como fazer?', a: 'Abra o chamado e clique em "Cancelar" (se disponível). Caso já esteja em atendimento, entre em contato com o responsável para solicitar o cancelamento.' },
        { q: 'Meu computador não liga. Como reportar esse problema?', a: 'Abra um chamado em "Problemas Gerais" descrevendo sintomas, modelo da máquina e horário aproximado. Anexe fotos se necessário.' }
    ];

    // Monta a FAQ dinamicamente
    faqData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('faq-item');
        div.innerHTML = `
            <button class="faq-q" aria-expanded="false">
                ${item.q}
                <span class="icon"><i class="fa-solid fa-chevron-down"></i></span>
            </button>
            <div class="faq-a" hidden>
                <p>${item.a}</p>
            </div>
        `;
        faqList.appendChild(div);
    });

    // Alternar respostas ao clicar
    faqList.addEventListener('click', e => {
        const btn = e.target.closest('.faq-q');
        if (!btn) return;

        const answer = btn.parentElement.querySelector('.faq-a');
        const icon = btn.querySelector('.icon i');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', String(!isOpen));
        answer.hidden = isOpen;

        if (icon) {
            icon.classList.replace(
                isOpen ? 'fa-chevron-up' : 'fa-chevron-down',
                isOpen ? 'fa-chevron-down' : 'fa-chevron-up'
            );
        }
    });

    // Filtro de pesquisa
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.trim().toLowerCase();
            document.querySelectorAll('.faq-item').forEach(item => {
                const q = item.querySelector('.faq-q').textContent.toLowerCase();
                const a = item.querySelector('.faq-a').textContent.toLowerCase();
                item.style.display = (q.includes(term) || a.includes(term)) ? '' : 'none';
            });
        });
    }
});