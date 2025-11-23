document.addEventListener('DOMContentLoaded', () => {
    // ==================== CARREGAMENTO DO USUÁRIO ==================== //
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (!usuario) {
        alert('Nenhum usuário logado! Redirecionando para a home.');
        window.location.href = 'home.html';
        return;
    }

    const tecnicoNome = document.getElementById('tecnicoNome');
    if (usuario.nome) tecnicoNome.textContent = `Olá, ${usuario.nome}!`;

    // ==================== VARIÁVEIS DE NAVEGAÇÃO E MODAIS ==================== //
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.chamado-section');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const modalConfirm = document.getElementById('modalConfirm');
    const btnConfirmarSair = document.getElementById('btnConfirmarSair');
    const btnCancelarSair = document.getElementById('btnCancelarSair');
    const btnAbrirModalSaida = document.getElementById('btnAbrirModalSaida');
    let chamados = [];

    const categoriasMap = { 2: 'TI', 3: 'Equipamento', 4: 'Infraestrutura' };

    // ==================== NAVEGAÇÃO ENTRE SEÇÕES ==================== //
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sectionId = btn.getAttribute('data-section');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            if (sectionId !== 'novo-chamado') fetchChamados(sectionId);
        });
    });

    // ==================== MODAL DE DETALHES ==================== //
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    btnFecharModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // ==================== ENVIO DE NOVO CHAMADO ==================== //
    const form = document.getElementById('form-chamado');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const categoria = document.querySelector('.input-select-categoria').value;
        const descricao = document.querySelector('.input-descricao-categoria').value;
        if (!categoria || !descricao) return alert('Preencha todos os campos.');

        const body = {
            descricao,
            numero_chamado: Math.floor(Math.random() * 1000),
            data_abertura: new Date().toISOString(),
            status: 'pendente',
            id_usuario: usuario.id_usuario, // usa o id do usuário logado
            id_categoria: parseInt(categoria)
        };

        fetch('https://localhost:7271/api/v1/Chamado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(r => {
            if (!r.ok) throw new Error('Erro');
            alert('Chamado criado!');
            form.reset();
            fetchChamados('pendentes');
        });
    });

    // ==================== CARREGAMENTO E FILTRAGEM DE CHAMADOS ==================== //
    function fetchChamados(sectionId) {
        fetch('https://localhost:7271/api/v1/Chamado')
            .then(r => r.json())
            .then(data => {
                // Filtra apenas os chamados do usuário logado
                chamados = data.filter(c => c.id_usuario === usuario.id_usuario);
                populateTable(sectionId);
            })
            .catch(err => console.error('Erro ao buscar chamados:', err));
    }

    function populateTable(sectionId) {
        const tbody = document.querySelector(`#${sectionId} .chamado-tbody`);
        tbody.innerHTML = '';
        const filtered = sectionId === 'pendentes'
            ? chamados.filter(c => ['pendente', 'em-andamento'].includes(c.status.toLowerCase()))
            : chamados.filter(c => ['concluido', 'concluído'].includes(c.status.toLowerCase()));

        filtered.forEach(c => {
            const s = c.status.toLowerCase();
            const statusClass = (s === 'pendente' || s === 'em-andamento') ? 'pendente' : 'concluido';
            const displayStatus = s === 'em-andamento' ? 'Em andamento' : (s === 'concluido' || s === 'concluído' ? 'Concluído' : c.status);
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>#${c.id_chamado ?? c.numero_chamado}</td><td>${categoriasMap[c.id_categoria]}</td><td><span class="status ${statusClass}">${displayStatus}</span></td><td>${new Date(c.data_abertura).toLocaleDateString()}</td><td><button class="detalhes-btn btn-chamado">Ver Detalhes</button></td>`;
            tbody.appendChild(tr);

            tr.querySelector('.detalhes-btn').addEventListener('click', () => showModal(c));
        });
    }

    function showModal(c) {
        const s = c.status.toLowerCase();
        const displayStatus = s === 'em-andamento' ? 'Em andamento' : (s === 'concluido' || s === 'concluído' ? 'Concluído' : c.status);
        document.getElementById('modal-id').textContent = `#${c.id_chamado ?? c.numero_chamado}`;
        document.getElementById('modal-categoria').textContent = categoriasMap[c.id_categoria];
        document.getElementById('modal-status').textContent = displayStatus;
        document.getElementById('modal-descricao').textContent = c.descricao;
        modal.style.display = 'flex';
    }

    // ==================== MODAL DE SAÍDA ==================== //
    function abrirModalSaida() { modalConfirm.style.display = 'flex'; }
    function fecharModalSaida() { modalConfirm.style.display = 'none'; }

    btnAbrirModalSaida.addEventListener('click', e => { e.preventDefault(); abrirModalSaida(); });
    btnConfirmarSair.addEventListener('click', () => {
        sessionStorage.removeItem('usuarioLogado');
        window.location.href = 'home.html';
    });
    btnCancelarSair.addEventListener('click', fecharModalSaida);
    window.addEventListener('click', e => { if (e.target === modalConfirm) fecharModalSaida(); });

    // ==================== CARREGA CHAMADOS INICIAIS ==================== //
    fetchChamados('pendentes');
});
