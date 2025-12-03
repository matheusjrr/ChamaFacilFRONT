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
    let chamadoEditando = null; // guarda o chamado que será editado

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

    // ==================== PREENCHER TABELA (ALTERADA COM CORES) ==================== //
    function populateTable(sectionId) {
        const tbody = document.querySelector(`#${sectionId} .chamado-tbody`);
        tbody.innerHTML = '';

        const filtered = sectionId === 'pendentes'
            ? chamados.filter(c => ['pendente', 'em-andamento'].includes(c.status.toLowerCase()))
            : chamados.filter(c => c.status.toLowerCase().includes("concl"));

        filtered.forEach(c => {
            const s = c.status.toLowerCase();
            const isConcluido = s.includes("concl");

            const displayStatus =
                s === 'em-andamento' ? 'Em andamento'
                : isConcluido ? 'Concluído'
                : c.status;

            const statusClass = !isConcluido ? 'pendente' : 'concluido';

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>#${c.id_chamado ?? c.numero_chamado}</td>
                <td>${categoriasMap[c.id_categoria]}</td>
                <td><span class="status ${statusClass}">${displayStatus}</span></td>
                <td>${new Date(c.data_abertura).toLocaleDateString()}</td>
                <td class="flex gap-2">
                    <button class="btn-chamado detalhes-btn">Detalhes</button>

                    ${
                        !isConcluido
                        ? `
                        <button class="btn-chamado editar-btn" style="background: #FACC15; color: white;">Editar</button>
                        <button class="btn-chamado excluir-btn" style="background: #DC2626; color: white;">Excluir</button>
                        `
                        : ""
                    }
                </td>
            `;

            tbody.appendChild(tr);

            tr.querySelector('.detalhes-btn').addEventListener('click', () => showModal(c));

            if (!isConcluido) {
                tr.querySelector('.editar-btn').addEventListener('click', () => abrirEdicao(c));
                tr.querySelector('.excluir-btn').addEventListener('click', () => excluirChamado(c));
            }
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

    fetchChamados('pendentes');
});

// ==================== CHATBOT (SEM MUDANÇAS!) ==================== //
const chatToggle = document.getElementById('chatToggle');
const chatModal = document.getElementById('chatModal');
const closeChat = document.getElementById('closeChat');
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// abre/fecha modal do chat
chatToggle.addEventListener('click', () => {
    chatModal.classList.toggle('hidden');
});

// fecha modal no botão ×
closeChat.addEventListener('click', () => {
    chatModal.classList.add('hidden');
});

// adiciona mensagem na tela
function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'msg flex items-end gap-2';

    if (sender === 'user') {
        msg.innerHTML = `
        <div class='ml-auto bg-gray-200 text-gray-800 px-3 py-2 rounded-2xl max-w-[75%] text-sm'>${text}</div>`;
    } else {
        msg.innerHTML = `
        <img src='../assets/zehelp.png' class='w-7 h-7 rounded-full'>
        <div class='bg-[#3B82F6] text-white px-3 py-2 rounded-2xl max-w-[75%] text-sm'>${text}</div>`;
    }

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// mostra indicador "digitando..."
function showTyping() {
    const typing = document.createElement('div');
    typing.id = "typing";
    typing.className = 'msg flex items-end gap-2';
    typing.innerHTML = `
    <img src='../assets/zehelp.png' class='w-7 h-7 rounded-full'>
    <div class='bg-[#3B82F6] text-white px-3 py-2 rounded-2xl max-w-[75%] text-sm'>digitando...</div>`;
    chatBox.appendChild(typing);
}

function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

// envia mensagem pra IA
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (!text || sendBtn.disabled) return;

    addMessage(text, "user");
    userInput.value = '';
    sendBtn.disabled = true;
    userInput.disabled = true;
    userInput.blur();

    showTyping();

    fetch('https://localhost:7271/api/ia/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: "usuario-chat" })
    })
        .then(r => r.json())
        .then(data => {
            removeTyping();
            addMessage(data.response || "Desculpe, não entendi sua mensagem 😢", "bot");
        })
        .catch(() => {
            removeTyping();
            addMessage("Ops! Algo deu errado ao falar com o assistente 🚨", "bot");
        })
        .finally(() => {
            sendBtn.disabled = false;
            userInput.disabled = false;
            userInput.focus();
        });
});

// permite ENTER
userInput.addEventListener('keypress', e => {
    if (e.key === "Enter") sendBtn.click();
});

// fecha chat se clicar fora
window.addEventListener('click', e => {
    if (!chatModal.contains(e.target) && e.target !== chatToggle) {
        chatModal.classList.add('hidden');
    }
});

// ==================== MODAL SAÍDA (SEM MUDANÇA!) ==================== //
const modalConfirm = document.getElementById("modalConfirm");
const btnConfirmarSair = document.getElementById("btnConfirmarSair");
const btnCancelarSair = document.getElementById("btnCancelarSair");

window.abrirModalSaida = () => modalConfirm.style.display = "flex";
const fecharModalSaida = () => modalConfirm.style.display = "none";

btnConfirmarSair.addEventListener("click", () => {
    sessionStorage.removeItem("usuarioLogado");
    window.location.href = "home.html";
});

btnCancelarSair.addEventListener("click", fecharModalSaida);
window.addEventListener("click", e => {
    if (e.target === modalConfirm) fecharModalSaida();
});