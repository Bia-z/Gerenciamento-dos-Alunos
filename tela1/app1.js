// app1.js - JAVASCRIPT PURO
let alunos = [];
let degrees = [];
let classes = [];
let grafico = null;

// CONFIGURAÇÃO
const CONFIG = {
    degrees: [
        { id: 1, nome: "Ensino Fundamental" },
        { id: 2, nome: "Ensino Médio" },
        { id: 3, nome: "Cursinho" },
        { id: 4, nome: "Estuda em Casa" },
        { id: 5, nome: "Outros" }
    ],
    classes: ["A", "B", "C", "D", "E", "F"]
};

// ELEMENTOS DO DOM
const elementos = {
    filtroNome: document.getElementById('nameFilter'),
    filtroClass: document.getElementById('classFilter'),
    filtroDegree: document.getElementById('degreeFilter'),
    tabela: document.getElementById('tableBody'),
    btnFiltrar: document.getElementById('btnFiltrar'),
    btnLimpar: document.getElementById('btnLimpar'),
    btnGerar: document.getElementById('generateStudents'),
    btnGerarPrimeiros: document.getElementById('btnGerarPrimeiros'),
    totalAlunos: document.getElementById('totalAlunos'),
    totalCount: document.getElementById('totalCount'),
    filteredCount: document.getElementById('filteredCount'),
    emptyState: document.getElementById('emptyState'),
    canvas: document.getElementById('studentsChart')
};

/* ===== INICIALIZAÇÃO ===== */
async function iniciar() {
    console.log('🚀 Iniciando sistema...');
    
    // Configurar degrees e classes
    degrees = CONFIG.degrees;
    classes = CONFIG.classes;
    
    // Carregar alunos do JSON
    await carregarAlunos();
    
    // Configurar eventos
    configurarEventos();
    
    // Renderizar
    renderizarTabela();
    
    console.log('✅ Sistema pronto!');
    mostrarNotificacao('Sistema carregado com sucesso!', 'success');
}

/* ===== CARREGAR ALUNOS ===== */
async function carregarAlunos() {
    try {
        const resposta = await fetch('../data/students.json');
        if (!resposta.ok) throw new Error('Erro ao carregar alunos');
        
        const dados = await resposta.json();
        alunos = dados.map(aluno => ({
            ...aluno,
            // Garantir que os degrees sejam dos 5 simplificados
            degreeId: converterDegreeAntigo(aluno.degreeId)
        }));
        
        console.log(`📊 ${alunos.length} alunos carregados`);
    } catch (erro) {
        console.warn('⚠️ Usando dados de exemplo');
        criarDadosExemplo();
    }
}

/* ===== CONVERTER DEGREES ANTIGOS ===== */
function converterDegreeAntigo(degreeId) {
    const mapeamento = {
        1: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, // Ensino Fundamental
        2: 2, 3: 2, 4: 2, // Ensino Médio
        5: 3, // Cursinho
        6: 4, // Estuda em Casa
        7: 5  // Outros
    };
    return mapeamento[degreeId] || ((degreeId % 5) + 1);
}

/* ===== DADOS DE EXEMPLO ===== */
function criarDadosExemplo() {
    alunos = [
        { id: 1, ra: 123456, name: "João Silva", degreeId: 1, classId: 1 },
        { id: 2, ra: 234567, name: "Maria Santos", degreeId: 2, classId: 2 },
        { id: 3, ra: 345678, name: "Pedro Oliveira", degreeId: 1, classId: 3 },
        { id: 4, ra: 456789, name: "Ana Costa", degreeId: 3, classId: 4 },
        { id: 5, ra: 567890, name: "Carlos Lima", degreeId: 4, classId: 5 },
        { id: 6, ra: 678901, name: "Juliana Alves", degreeId: 5, classId: 6 }
    ];
}

/* ===== RENDERIZAR TABELA ===== */
function renderizarTabela() {
    // Aplicar filtros
    const filtrados = filtrarAlunos();
    
    // Atualizar contadores
    atualizarContadores(filtrados.length);
    
    // Mostrar/ocultar tabela
    if (filtrados.length === 0) {
        elementos.tabela.style.display = 'none';
        elementos.emptyState.style.display = 'block';
    } else {
        elementos.tabela.style.display = '';
        elementos.emptyState.style.display = 'none';
        
        // Gerar HTML da tabela
        elementos.tabela.innerHTML = filtrados.map(aluno => `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.ra}</td>
                <td><input type="text" value="${aluno.name}" 
                    onchange="atualizarAluno(${aluno.id}, 'name', this.value)"></td>
                <td>
                    <select onchange="atualizarAluno(${aluno.id}, 'degreeId', this.value)">
                        ${degrees.map(d => `
                            <option value="${d.id}" ${d.id === aluno.degreeId ? 'selected' : ''}>
                                ${d.nome}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <select onchange="atualizarAluno(${aluno.id}, 'classId', this.value)">
                        ${classes.map((c, i) => `
                            <option value="${i + 1}" ${(i + 1) === aluno.classId ? 'selected' : ''}>
                                ${c}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <button onclick="salvarAluno(${aluno.id})" class="btn-salvar">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // Atualizar gráfico
    atualizarGrafico();
}

/* ===== FILTRAR ALUNOS ===== */
function filtrarAlunos() {
    const nomeFiltro = elementos.filtroNome.value.toLowerCase();
    const classFiltro = elementos.filtroClass.value;
    const degreeFiltro = elementos.filtroDegree.value;
    
    return alunos.filter(aluno => {
        const nomeMatch = !nomeFiltro || aluno.name.toLowerCase().includes(nomeFiltro);
        const classMatch = !classFiltro || aluno.classId.toString() === classFiltro;
        const degreeMatch = !degreeFiltro || aluno.degreeId.toString() === degreeFiltro;
        
        return nomeMatch && classMatch && degreeMatch;
    });
}

/* ===== ATUALIZAR CONTADORES ===== */
function atualizarContadores(filtrados) {
    elementos.totalAlunos.textContent = alunos.length;
    elementos.totalCount.textContent = alunos.length;
    elementos.filteredCount.textContent = filtrados;
}

/* ===== ATUALIZAR ALUNO ===== */
function atualizarAluno(id, campo, valor) {
    const aluno = alunos.find(a => a.id === id);
    if (aluno) {
        aluno[campo] = campo === 'name' ? valor : parseInt(valor);
    }
}

/* ===== SALVAR ALUNO ===== */
function salvarAluno(id) {
    const aluno = alunos.find(a => a.id === id);
    if (aluno) {
        mostrarNotificacao(`Aluno "${aluno.name}" salvo com sucesso!`, 'success');
        renderizarTabela();
    }
}

/* ===== GERAR ALUNOS ALEATÓRIOS ===== */
function gerarAlunosAleatorios(quantidade = 300) {
    const ultimoId = alunos.length > 0 ? Math.max(...alunos.map(a => a.id)) : 0;
    
    const nomes = ["Ana", "João", "Maria", "Pedro", "Carlos", "Juliana", "Lucas", "Fernanda"];
    const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira"];
    
    for (let i = 1; i <= quantidade; i++) {
        const degreeAleatorio = degrees[Math.floor(Math.random() * degrees.length)];
        const classAleatoria = Math.floor(Math.random() * classes.length) + 1;
        const raAleatorio = 100000 + Math.floor(Math.random() * 900000);
        const nomeAleatorio = `${nomes[Math.floor(Math.random() * nomes.length)]} ${
            sobrenomes[Math.floor(Math.random() * sobrenomes.length)]
        }`;
        
        alunos.push({
            id: ultimoId + i,
            ra: raAleatorio,
            name: nomeAleatorio,
            degreeId: degreeAleatorio.id,
            classId: classAleatoria
        });
    }
    
    mostrarNotificacao(`${quantidade} novos alunos gerados! Total: ${alunos.length}`, 'success');
    renderizarTabela();
}

/* ===== ATUALIZAR GRÁFICO ===== */
function atualizarGrafico() {
    const ctx = elementos.canvas.getContext('2d');
    
    // Contar alunos por degree
    const contagem = {};
    degrees.forEach(d => {
        contagem[d.nome] = alunos.filter(a => a.degreeId === d.id).length;
    });
    
    const labels = Object.keys(contagem);
    const dados = Object.values(contagem);
    const cores = ['#4A63E7', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
    
    if (grafico) {
        grafico.data.labels = labels;
        grafico.data.datasets[0].data = dados;
        grafico.update();
    } else {
        grafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Alunos por Degree',
                    data: dados,
                    backgroundColor: cores,
                    borderColor: 'white',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
}

/* ===== NOTIFICAÇÕES ===== */
function mostrarNotificacao(mensagem, tipo = 'info') {
    const cores = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    
    // Criar notificação
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

/* ===== EVENTOS ===== */
function configurarEventos() {
    // Filtros
    elementos.btnFiltrar.addEventListener('click', renderizarTabela);
    elementos.btnLimpar.addEventListener('click', () => {
        elementos.filtroNome.value = '';
        elementos.filtroClass.value = '';
        elementos.filtroDegree.value = '';
        renderizarTabela();
        mostrarNotificacao('Filtros limpos!', 'info');
    });
    
    // Gerar alunos
    elementos.btnGerar.addEventListener('click', () => {
        if (confirm('Gerar 300 novos alunos aleatoriamente?')) {
            gerarAlunosAleatorios(300);
        }
    });
    
    elementos.btnGerarPrimeiros.addEventListener('click', () => {
        gerarAlunosAleatorios(50);
    });
    
    // Filtro em tempo real
    elementos.filtroNome.addEventListener('input', renderizarTabela);
    elementos.filtroClass.addEventListener('change', renderizarTabela);
    elementos.filtroDegree.addEventListener('change', renderizarTabela);
}

/* ===== ANIMAÇÕES ===== */
function adicionarAnimacoes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/* ===== INICIAR TUDO ===== */
adicionarAnimacoes();
document.addEventListener('DOMContentLoaded', iniciar);

/* ===== FUNÇÕES GLOBAIS (para usar no HTML) ===== */
window.salvarAluno = salvarAluno;
window.atualizarAluno = atualizarAluno;
window.gerarAlunosAleatorios = gerarAlunosAleatorios;