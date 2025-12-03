let chamados = [];
let chamadosFiltrados = []; // <--- para exportação

// Elementos da página
const tabela = document.getElementById("tabelaDados");
const filtroStatus = document.getElementById("filtroStatus");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroUsuario = document.getElementById("filtroUsuario");

const btnExcel = document.getElementById("btnExcel");
const btnPdf = document.getElementById("btnPdf");

// ==========================
// Mapa de categorias
// ==========================
const categoriasMap = {
    2: "TI",
    3: "Equipamento",
    4: "Infraestrutura"
};

// ==========================
// Normaliza string
// ==========================
function normalizeForCompare(str) {
    if (!str && str !== 0) return "";
    return String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[_\-]+/g, " ")
        .trim();
}

// ==========================
// Tratar status
// ==========================
function tratarStatus(rawStatus) {
    if (!rawStatus && rawStatus !== 0) return "Indefinido";

    const norm = normalizeForCompare(rawStatus);

    if (norm.includes("pend") || norm === "aberto") return "Aberto";
    if (norm.includes("andamento") || norm.includes("emandamento")) return "Em andamento";
    if (norm.includes("concl") || norm.includes("finaliz")) return "Concluído";

    return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
}

// ==========================
// Popular filtro de usuários
// ==========================
function popularFiltroUsuarios() {
    const todosUsuarios = JSON.parse(sessionStorage.getItem('todosUsuarios')) || [];
    
    // Remove todas opções, exceto "Todos"
    filtroUsuario.innerHTML = '<option value="">Todos</option>';

    todosUsuarios.forEach(u => {
        const option = document.createElement('option');
        option.value = u.Nome_usuario;
        option.textContent = u.Nome_usuario;
        filtroUsuario.appendChild(option);
    });
}

// ==========================
// Buscar dados da API
// ==========================
async function carregarChamados() {
    try {
        const resposta = await fetch("https://localhost:7271/api/v1/Chamado");

        if (!resposta.ok) throw new Error("Erro ao buscar dados da API");

        const dados = await resposta.json();
        chamados = dados;
        chamadosFiltrados = dados;

        renderizarTabela(chamados);
        popularFiltroUsuarios(); // Atualiza filtro após carregar usuários
    } catch (erro) {
        console.error("Erro ao carregar chamados:", erro);
        tabela.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:15px; color:red;">
                    Erro ao carregar dados do servidor.
                </td>
            </tr>
        `;
    }
}

// ==========================
// Renderizar tabela
// ==========================
function renderizarTabela(lista) {
    chamadosFiltrados = lista; // <- salva filtrados
    tabela.innerHTML = "";

    // Recupera todos os usuários da sessão
    const todosUsuarios = JSON.parse(sessionStorage.getItem('todosUsuarios')) || [];

    if (!lista || lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:15px;">
                    Nenhum chamado encontrado.
                </td>
            </tr>`;
        return;
    }

    lista.forEach(ch => {
        const categoriaNome = categoriasMap[ch.id_categoria] ?? "Desconhecida";
        const displayStatus = tratarStatus(ch.status);

        // Busca o usuário correto pelo Id_usuario
        const usuarioEncontrado = todosUsuarios.find(u => u.Id_usuario === ch.id_usuario);
        const nomeUsuario = usuarioEncontrado ? usuarioEncontrado.Nome_usuario : "Sem nome";

        tabela.innerHTML += `
            <tr>
                <td>${ch.id_chamado}</td>
                <td>${nomeUsuario}</td>
                <td>${categoriaNome}</td>
                <td>${ch.descricao}</td>
                <td>${displayStatus}</td>
                <td>${new Date(ch.data_abertura ?? ch.data).toLocaleDateString("pt-BR")}</td>
            </tr>
        `;
    });
}

// ==========================
// Filtros
// ==========================
function aplicarFiltros() {
    let filtrado = [...chamados];

    const statusFiltro = filtroStatus.value;
    const categoria = filtroCategoria.value;
    const usuarioFiltro = filtroUsuario.value;

    // Recupera todos os usuários da sessão
    const todosUsuarios = JSON.parse(sessionStorage.getItem('todosUsuarios')) || [];

    if (statusFiltro) {
        filtrado = filtrado.filter(c =>
            normalizeForCompare(tratarStatus(c.status)) === normalizeForCompare(statusFiltro)
        );
    }

    if (categoria) {
        filtrado = filtrado.filter(c =>
            (categoriasMap[c.id_categoria] ?? "").toLowerCase() === categoria.toLowerCase()
        );
    }

    if (usuarioFiltro) {
        filtrado = filtrado.filter(c => {
            const usuarioEncontrado = todosUsuarios.find(u => u.Id_usuario === c.id_usuario);
            const nomeUsuario = usuarioEncontrado ? usuarioEncontrado.Nome_usuario : "";
            return nomeUsuario.toLowerCase() === usuarioFiltro.toLowerCase();
        });
    }

    renderizarTabela(filtrado);
}

// Eventos dos filtros
filtroStatus.addEventListener("change", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);
filtroUsuario.addEventListener("change", aplicarFiltros);

// ==========================
// Exportar Excel
// ==========================
btnExcel.addEventListener("click", () => {
    const todosUsuarios = JSON.parse(sessionStorage.getItem('todosUsuarios')) || [];

    const rows = chamadosFiltrados.map(ch => {
        const usuarioEncontrado = todosUsuarios.find(u => u.Id_usuario === ch.id_usuario);
        const nomeUsuario = usuarioEncontrado ? usuarioEncontrado.Nome_usuario : "Sem nome";

        return {
            "ID Chamado": ch.id_chamado,
            "Usuário": nomeUsuario,
            "Categoria": categoriasMap[ch.id_categoria] ?? "Desconhecida",
            "Descrição": ch.descricao,
            "Status": tratarStatus(ch.status),
            "Data Abertura": new Date(ch.data_abertura ?? ch.data).toLocaleDateString("pt-BR")
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const colWidths = Object.keys(rows[0]).map(key => {
        const maxLength = Math.max(
            key.length,
            ...rows.map(r => String(r[key]).length)
        );
        return { wch: maxLength + 2 };
    });
    worksheet['!cols'] = colWidths;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chamados");
    XLSX.writeFile(workbook, "chamados.xlsx");
});

// ==========================
// Exportar PDF
// ==========================
btnPdf.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const todosUsuarios = JSON.parse(sessionStorage.getItem('todosUsuarios')) || [];

    const rows = chamadosFiltrados.map(ch => {
        const usuarioEncontrado = todosUsuarios.find(u => u.Id_usuario === ch.id_usuario);
        const nomeUsuario = usuarioEncontrado ? usuarioEncontrado.Nome_usuario : "Sem nome";
        return [
            ch.id_chamado,
            nomeUsuario,
            categoriasMap[ch.id_categoria] ?? "Desconhecida",
            ch.descricao,
            tratarStatus(ch.status),
            new Date(ch.data_abertura ?? ch.data).toLocaleDateString("pt-BR")
        ];
    });

    doc.text("Relatório de Chamados", 14, 15);

    doc.autoTable({
        head: [["ID", "Usuário", "Categoria", "Descrição", "Status", "Data"]],
        body: rows,
        startY: 20
    });

    doc.save("chamados.pdf");
});

// ==========================
// Inicialização
// ==========================
carregarChamados();