document.addEventListener('DOMContentLoaded', () => {
    const chamadosList = document.getElementById('chamadosList');
    const searchInput = document.getElementById('searchInput');
    const statusCards = document.querySelectorAll('.status-card');

    const modal = document.getElementById('modalChamado');
    const closeModal = modal.querySelector('.close');
    const modalId = document.getElementById('modalId');
    const modalCategoria = document.getElementById('modalCategoria');
    const modalStatus = document.getElementById('modalStatus');
    const modalDescricao = document.getElementById('modalDescricao');
    const modalTecnico = document.getElementById('modalTecnico');
    const btnToggleStatus = document.getElementById('btnToggleStatus');

    let currentFilter = 'pendente';
    let currentSearch = '';

    // Chamados de exemplo (mock)
    const chamadosData = [
        { id: '#001', categoria: 'TI', status: 'pendente', descricao: 'Computador não liga', tecnico: 'João' },
        { id: '#002', categoria: 'Equipamento', status: 'concluido', descricao: 'Mouse quebrado', tecnico: 'Maria' },
        { id: '#003', categoria: 'Infraestrutura', status: 'em-andamento', descricao: 'Internet lenta', tecnico: 'Carlos' },
        { id: '#004', categoria: 'TI', status: 'pendente', descricao: 'Erro ao abrir sistema', tecnico: 'João' },
        { id: '#005', categoria: 'Equipamento', status: 'concluido', descricao: 'Teclado com defeito', tecnico: 'Maria' }
    ];

    // ===== Renderização da lista =====
    function renderChamados() {
        chamadosList.innerHTML = '';
        chamadosData
            .filter(c => c.status === currentFilter)
            .filter(c => (c.id + c.categoria + c.descricao + c.tecnico).toLowerCase().includes(currentSearch))
            .forEach(c => {
                const div = document.createElement('div');
                div.classList.add('chamado-card');
                div.innerHTML = `
                    <div class="chamado-info">
                        <span><strong>${c.id}</strong> - ${c.categoria}</span>
                        <span class="chamado-status status-${c.status}">${formatarStatus(c.status)}</span>
                    </div>
                    <button class="btn-chamado" data-id="${c.id}">Ver Detalhes</button>
                `;
                chamadosList.appendChild(div);
            });
    }

    // ===== Função auxiliar para formatar status =====
    function formatarStatus(status) {
        switch (status) {
            case 'pendente': return 'Pendente';
            case 'em-andamento': return 'Em andamento';
            case 'concluido': return 'Concluído';
            default: return status;
        }
    }

    renderChamados();

    // ===== Filtro por status =====
    statusCards.forEach(card => {
        card.addEventListener('click', () => {
            statusCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentFilter = card.getAttribute('data-status');
            renderChamados();
        });
    });

    // ===== Pesquisa =====
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.trim().toLowerCase();
        renderChamados();
    });

    // ===== Modal de detalhes =====
    chamadosList.addEventListener('click', e => {
        if (e.target.classList.contains('btn-chamado')) {
            const id = e.target.getAttribute('data-id');
            const chamado = chamadosData.find(c => c.id === id);

            // Corrigido o uso de template literal
            modalId.textContent = `${chamado.id} - Detalhes do Chamado`;
            modalCategoria.textContent = chamado.categoria;
            modalStatus.textContent = formatarStatus(chamado.status);
            modalDescricao.textContent = chamado.descricao;
            modalTecnico.textContent = chamado.tecnico;

            atualizarBotaoStatus(chamado);

            btnToggleStatus.dataset.id = chamado.id;
            modal.style.display = 'flex';
        }
    });

    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // ===== Atualização dinâmica do botão =====
    function atualizarBotaoStatus(chamado) {
        if (chamado.status === 'pendente') {
            btnToggleStatus.textContent = 'Marcar como Em andamento';
            btnToggleStatus.className = 'btn-chamado status-em-andamento';
        } else if (chamado.status === 'em-andamento') {
            btnToggleStatus.textContent = 'Marcar como Concluído';
            btnToggleStatus.className = 'btn-chamado status-concluido';
        } else if (chamado.status === 'concluido') {
            btnToggleStatus.textContent = 'Reabrir (Em andamento)';
            btnToggleStatus.className = 'btn-chamado status-pendente';
        }
    }

    // ===== Alternar status =====
    btnToggleStatus.addEventListener('click', () => {
        const id = btnToggleStatus.dataset.id;
        const chamado = chamadosData.find(c => c.id === id);

        if (chamado.status === 'pendente') {
            chamado.status = 'em-andamento';
        } else if (chamado.status === 'em-andamento') {
            chamado.status = 'concluido';
        } else if (chamado.status === 'concluido') {
            chamado.status = 'em-andamento';
        }

        modal.style.display = 'none';
        renderChamados();
    });
});
