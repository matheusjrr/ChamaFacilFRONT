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

    // ==================== VARIÁVEIS ==================== //
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.chamado-section');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const btnFecharModal = document.getElementById('btnFecharModal');

    const modalEditar = document.getElementById("modalEditar");
    const closeModalEditar = document.getElementById("closeModalEditar");
    const btnSalvarEdicao = document.getElementById("btnSalvarEdicao");
    const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

    let chamados = [];
    let chamadoEditando = null; // 🔥 guarda o chamado que será editado

    const categoriasMap = { 2: 'TI', 3: 'Equipamento', 4: 'Infraestrutura' };

    // ==================== SEÇÕES ==================== //
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

    // ==================== MODAL DETALHES ==================== //
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    btnFecharModal.addEventListener('click', () => modal.style.display = 'none');

    // ==================== MODAL EDITAR ==================== //
    closeModalEditar.addEventListener("click", () => modalEditar.style.display = "none");
    btnCancelarEdicao.addEventListener("click", () => modalEditar.style.display = "none");

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
            status: 'Pendente',
            id_usuario: usuario.id_usuario,
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

    // ==================== BUSCAR CHAMADOS ==================== //
    function fetchChamados(sectionId) {
        fetch('https://localhost:7271/api/v1/Chamado')
            .then(r => r.json())
            .then(data => {
                chamados = data.filter(c => c.id_usuario === usuario.id_usuario);
                populateTable(sectionId);
            })
            .catch(err => console.error('Erro ao buscar chamados:', err));
    }

    // ==================== PREENCHER TABELA ==================== //
    function populateTable(sectionId) {
        const tbody = document.querySelector(`#${sectionId} .chamado-tbody`);
        tbody.innerHTML = '';

        const filtered = sectionId === 'pendentes'
            ? chamados.filter(c => ['pendente', 'em-andamento'].includes(c.status.toLowerCase()))
            : chamados.filter(c => ['concluido', 'concluído'].includes(c.status.toLowerCase()));

        filtered.forEach(c => {
            const s = c.status.toLowerCase();
            const statusClass = (s === 'pendente' || s === 'em-andamento') ? 'pendente' : 'concluido';
            const displayStatus =
                s === 'em-andamento'
                    ? 'Em andamento'
                    : (s.includes('conclu') ? 'Concluído' : c.status);

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>#${c.id_chamado ?? c.numero_chamado}</td>
                <td>${categoriasMap[c.id_categoria]}</td> 
                <td><span class="status ${statusClass}">${displayStatus}</span></td>
                <td>${new Date(c.data_abertura).toLocaleDateString()}</td>
                <td class="flex gap-2">

                    <button class="detalhes-btn btn-chamado">Detalhes</button>

                    <button class="btn-chamado bg-yellow-500 hover:bg-yellow-600 text-white editar-btn">
                        Editar
                    </button>

                    <button class="btn-chamado bg-red-600 hover:bg-red-700 text-white excluir-btn">
                        Excluir
                    </button>

                </td>
            `;

            tbody.appendChild(tr);

            tr.querySelector('.detalhes-btn').addEventListener('click', () => showModal(c));
            tr.querySelector('.editar-btn').addEventListener('click', () => abrirEdicao(c));
            tr.querySelector('.excluir-btn').addEventListener('click', () => excluirChamado(c));
        });
    }

    // ==================== EXIBIR MODAL DETALHES ==================== //
    function showModal(c) {
        document.getElementById('modal-id').textContent = `#${c.id_chamado ?? c.numero_chamado}`;
        document.getElementById('modal-categoria').textContent = categoriasMap[c.id_categoria];
        document.getElementById('modal-status').textContent = c.status;
        document.getElementById('modal-descricao').textContent = c.descricao;
        modal.style.display = 'flex';
    }

    // ==================== ABRIR EDIÇÃO ==================== //
    function abrirEdicao(chamado) {
        chamadoEditando = chamado;

        document.getElementById("editCategoria").value = chamado.id_categoria;
        document.getElementById("editDescricao").value = chamado.descricao;

        modalEditar.style.display = "flex";
    }

    // ==================== SALVAR EDIÇÃO ==================== //
    btnSalvarEdicao.addEventListener("click", () => {
        if (!chamadoEditando) return;

        const body = {
            ...chamadoEditando,
            id_categoria: parseInt(document.getElementById("editCategoria").value),
            descricao: document.getElementById("editDescricao").value
        };

        fetch(`https://localhost:7271/api/v1/Chamado/${chamadoEditando.id_chamado}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }).then(r => {
            if (!r.ok) throw new Error();
            alert("Chamado atualizado!");
            modalEditar.style.display = "none";
            fetchChamados("pendentes");
        });
    });

    // ==================== EXCLUIR CHAMADO ==================== //
    function excluirChamado(chamado) {
        if (!confirm("Tem certeza que deseja excluir?")) return;

        fetch(`https://localhost:7271/api/v1/Chamado/${chamado.id_chamado}`, {
            method: "DELETE"
        }).then(r => {
            if (!r.ok) throw new Error();
            alert("Chamado excluído!");
            fetchChamados("pendentes");
        });
    }

    // ==================== CARREGAR INICIAL ==================== //
    fetchChamados('pendentes');
});