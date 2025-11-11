document.addEventListener('DOMContentLoaded', () => {
  const chamadosList = document.getElementById('chamadosList');
  const searchInput = document.getElementById('searchInput');
  const statusCards = document.querySelectorAll('.status-card');

  const modal = document.getElementById('modalChamado');
  const closeModal = modal?.querySelector('.close');
  const modalId = document.getElementById('modalId');
  const modalCategoria = document.getElementById('modalCategoria');
  const modalStatus = document.getElementById('modalStatus');
  const modalDescricao = document.getElementById('modalDescricao');
  const modalTecnico = document.getElementById('modalTecnico');
  const modalObservacao = document.getElementById('modalObservacao');
  const btnToggleStatus = document.getElementById('btnToggleStatus');

  let chamados = [];
  let currentFilter = 'pendente';
  let currentSearch = '';

  // ===== Mapear IDs de categoria para nomes =====
  const categoriasMap = {
    2: 'TI',
    3: 'Equipamento',
    4: 'Infraestrutura'
  };

  // ===== Função para normalizar status =====
  function normalizeStatus(status) {
    return (status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // ===== Buscar chamados =====
  async function fetchChamados() {
    try {
      const response = await fetch("https://localhost:7271/api/v1/Chamado");
      if (!response.ok) throw new Error("Erro na requisição");
      chamados = await response.json();
      renderChamados();
      atualizarBadges();
    } catch (err) {
      console.error("Erro ao carregar chamados:", err);
    }
  }

  // ===== Renderizar lista de chamados =====
  function renderChamados() {
    chamadosList.innerHTML = '';

    chamados
      .filter(c => normalizeStatus(c.status) === currentFilter)
      .filter(c => {
        const termo = currentSearch.toLowerCase();
        const categoriaNome = categoriasMap[c.id_categoria] || '';
        return (
          c.id_chamado?.toString().includes(termo) ||
          categoriaNome.toLowerCase().includes(termo) ||
          (c.descricao || '').toLowerCase().includes(termo)
        );
      })
      .forEach(c => {
        const div = document.createElement('div');
        div.classList.add('chamado-card');
        div.innerHTML = `
          <div class="chamado-info">
            <span><strong>#${c.id_chamado ?? c.numero_chamado}</strong> - ${categoriasMap[c.id_categoria] || c.id_categoria}</span>
            <span class="chamado-status status-${normalizeStatus(c.status)}">${formatarStatus(c.status)}</span>
          </div>
          <button class="btn-chamado" data-id="${c.id_chamado}">Ver Detalhes</button>
        `;
        chamadosList.appendChild(div);
      });
  }

  // ===== Atualizar badges =====
  function atualizarBadges() {
    const pendentes = chamados.filter(c => normalizeStatus(c.status) === 'pendente').length;
    const emAndamento = chamados.filter(c => normalizeStatus(c.status) === 'em-andamento').length;
    const concluidos = chamados.filter(c => normalizeStatus(c.status) === 'concluido').length;

    statusCards.forEach(card => {
      const badge = card.querySelector('.badge');
      if (!badge) return;
      switch (card.dataset.status) {
        case 'pendente': badge.textContent = pendentes; break;
        case 'em-andamento': badge.textContent = emAndamento; break;
        case 'concluido': badge.textContent = concluidos; break;
      }
    });
  }

  // ===== Formatar status =====
  function formatarStatus(status) {
    switch (normalizeStatus(status)) {
      case 'pendente': return 'Pendente';
      case 'em-andamento': return 'Em andamento';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  }

  // ===== Filtro por status =====
  statusCards.forEach(card => {
    card.addEventListener('click', () => {
      statusCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentFilter = card.dataset.status;
      renderChamados();
    });
  });

  // ===== Pesquisa =====
  searchInput?.addEventListener('input', () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderChamados();
  });

  // ===== Abrir modal =====
  chamadosList.addEventListener('click', e => {
    if (e.target.classList.contains('btn-chamado')) {
      const id = e.target.dataset.id;
      const chamado = chamados.find(c => c.id_chamado == id);
      if (!chamado) return;

      modalId.textContent = `#${chamado.id_chamado} - Detalhes do Chamado`;
      modalCategoria.textContent = categoriasMap[chamado.id_categoria] || chamado.id_categoria;
      modalStatus.textContent = formatarStatus(chamado.status);
      modalDescricao.textContent = chamado.descricao;
      modalTecnico.textContent = chamado.tecnico || '-';
      modalObservacao.value = chamado.observacao || '';

      btnToggleStatus.dataset.id = chamado.id_chamado;
      atualizarBotaoStatus(chamado);

      modal.style.display = 'flex';
    }
  });

  // ===== Fechar modal =====
  closeModal?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // ===== Atualizar botão =====
  function atualizarBotaoStatus(chamado) {
    const status = normalizeStatus(chamado.status);
    if (status === 'pendente') {
      btnToggleStatus.textContent = 'Marcar como Em andamento';
      btnToggleStatus.className = 'btn-chamado status-em-andamento';
    } else if (status === 'em-andamento') {
      btnToggleStatus.textContent = 'Marcar como Concluído';
      btnToggleStatus.className = 'btn-chamado status-concluido';
    } else if (status === 'concluido') {
      btnToggleStatus.textContent = 'Reabrir (Em andamento)';
      btnToggleStatus.className = 'btn-chamado status-pendente';
    }
  }

  // ===== Atualizar status no backend =====
  btnToggleStatus?.addEventListener('click', async () => {
    try {
      const id = btnToggleStatus.dataset.id;
      const chamado = chamados.find(c => c.id_chamado == id);
      if (!chamado) return;

      let novoStatus = '';
      const status = normalizeStatus(chamado.status);
      if (status === 'pendente') novoStatus = 'em-andamento';
      else if (status === 'em-andamento') novoStatus = 'concluido';
      else if (status === 'concluido') novoStatus = 'em-andamento';

      const response = await fetch(`https://localhost:7271/api/v1/Chamado/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...chamado, status: novoStatus, observacao: modalObservacao.value })
      });
      if (!response.ok) throw new Error('Erro ao atualizar status');
      modal.style.display = 'none';
      fetchChamados();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  });

  // ===== Inicializar =====
  fetchChamados();
});
