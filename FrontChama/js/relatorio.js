// ==========================
// Variável global que armazena os chamados vindos da API
// ==========================
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

        tabela.innerHTML += `
            <tr>
                <td>${ch.id_chamado}</td>
                <td>${ch.id_usuario ?? ch.usuario ?? "Sem nome"}</td>
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
    const usuario = filtroUsuario.value;

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

    if (usuario) {
        filtrado = filtrado.filter(c =>
            (c.usuarioNome ?? c.usuario ?? c.id_usuario)?.toString().toLowerCase() === usuario.toLowerCase()
        );
    }

    renderizarTabela(filtrado);
}

// Eventos dos filtros
filtroStatus.addEventListener("change", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);
filtroUsuario.addEventListener("change", aplicarFiltros);

btnExcel.addEventListener("click", () => {
    const rows = chamadosFiltrados.map(ch => ({
        "ID Chamado": ch.id_chamado,
        "Usuário": ch.id_usuario ?? ch.usuario,
        "Categoria": categoriasMap[ch.id_categoria] ?? "Desconhecida",
        "Descrição": ch.descricao,
        "Status": tratarStatus(ch.status),
        "Data Abertura": new Date(ch.data_abertura ?? ch.data).toLocaleDateString("pt-BR")
    }));

    // Cria worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // 1) Ajusta largura das colunas automaticamente
    const colWidths = Object.keys(rows[0]).map(key => {
        const maxLength = Math.max(
            key.length,
            ...rows.map(r => String(r[key]).length)
        );
        return { wch: maxLength + 2 };
    });
    worksheet['!cols'] = colWidths;

    // 2) Ativa autofiltro
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

    // 3) Congela cabeçalho
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // 4) Estilo do cabeçalho (negrito + fundo cinza)
    const headerCells = Object.keys(rows[0]);
    headerCells.forEach((key, idx) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
        if (!worksheet[cellRef]) return;

        worksheet[cellRef].s = {
            fill: { fgColor: { rgb: "DDDDDD" } },
            font: { bold: true },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } }
            }
        };
    });

    // 5) Bordas para todas as células
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellRef];
            if (!cell) continue;

            cell.s = {
                ...cell.s,
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } }
                }
            };
        }
    }

    // Cria workbook e salva
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chamados");

    XLSX.writeFile(workbook, "chamados.xlsx");
});

// ==========================
// EXPORTAR PDF
// ==========================
btnPdf.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const rows = chamadosFiltrados.map(ch => [
        ch.id_chamado,
        ch.id_usuario ?? ch.usuario,
        categoriasMap[ch.id_categoria] ?? "Desconhecida",
        ch.descricao,
        tratarStatus(ch.status),
        new Date(ch.data_abertura ?? ch.data).toLocaleDateString("pt-BR")
    ]);

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

/* Botões agora funcionando */
