// app1.js - JAVASCRIPT PURO
let alunos = [];
let degrees = [];
let classes = [];
let grafico = null;

// CONFIGURAÇÃO
const CONFIG = {
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
    
    try {
        // Carregar degrees do JSON
        await carregarDegrees();
        
        // Configurar classes
        classes = CONFIG.classes;
        
        // Carregar alunos do JSON
        await carregarAlunos();
        
        // Configurar eventos
        configurarEventos();
        
        // Atualizar filtro de degrees
        atualizarFiltroDegrees();
        
        // Renderizar
        renderizarTabela();
        
        console.log('✅ Sistema pronto!');
        mostrarNotificacao('Sistema carregado com sucesso!', 'success');
        
    } catch (erro) {
        console.error('❌ Erro ao iniciar:', erro);
        console.warn('⚠️ Usando dados de exemplo');
        usarDadosExemplo();
        renderizarTabela();
    }
}

/* ===== CARREGAR DEGREES DO JSON ===== */
async function carregarDegrees() {
    try {
        const resposta = await fetch('../data/degrees.json');
        if (!resposta.ok) throw new Error('Erro ao carregar degrees');
        
        degrees = await resposta.json();
        console.log(`🎓 ${degrees.length} degrees carregados do JSON`);
    } catch (erro) {
        console.warn('⚠️ Usando degrees de exemplo');
        // Fallback com todos os degrees originais
        degrees = [
            { id: 1, name: "Ensino Fundamental" },
            { id: 2, name: "1° ano do ensino médio" },
            { id: 3, name: "2° ano ensino médio" },
            { id: 4, name: "3° ano do ensino médio" },
            { id: 5, name: "Cursinho" },
            { id: 8, name: "4º ano do ensino fundamental" },
            { id: 9, name: "5º ano do ensino fundamental" },
            { id: 10, name: "6º ano do ensino fundamental" },
            { id: 11, name: "7º ano do ensino fundamental" },
            { id: 12, name: "8º ano do ensino fundamental" },
            { id: 13, name: "9º ano do ensino fundamental" },
            { id: 6, name: "Estudo em casa" },
            { id: 7, name: "Outros" }
        ];
    }
}

/* ===== ATUALIZAR FILTRO DE DEGREES ===== */
function atualizarFiltroDegrees() {
    const filtroDegree = document.getElementById('degreeFilter');
    if (filtroDegree) {
        filtroDegree.innerHTML = '<option value="">Todos os Degrees</option>' +
            degrees.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
}

/* ===== CARREGAR ALUNOS ===== */
async function carregarAlunos() {
    try {
        const resposta = await fetch('../data/students.json');
        if (!resposta.ok) throw new Error('Erro ao carregar alunos');
        
        const dados = await resposta.json();
        alunos = dados;
        
        console.log(`📊 ${alunos.length} alunos carregados`);
    } catch (erro) {
        console.warn('⚠️ Usando dados de exemplo');
        throw erro; // Propaga o erro para iniciar() usar dados de exemplo
    }
}

/* ===== USAR DADOS DE EXEMPLO ===== */
function usarDadosExemplo() {
    // Degrees de exemplo
    degrees = [
        { id: 1, name: "Ensino Fundamental" },
        { id: 2, name: "1° ano do ensino médio" },
        { id: 3, name: "2° ano ensino médio" },
        { id: 4, name: "3° ano do ensino médio" },
        { id: 5, name: "Cursinho" },
        { id: 8, name: "4º ano do ensino fundamental" },
        { id: 9, name: "5º ano do ensino fundamental" },
        { id: 10, name: "6º ano do ensino fundamental" },
        { id: 11, name: "7º ano do ensino fundamental" },
        { id: 12, name: "8º ano do ensino fundamental" },
        { id: 13, name: "9º ano do ensino fundamental" },
        { id: 6, name: "Estudo em casa" },
        { id: 7, name: "Outros" }
    ];
    
    // Alunos de exemplo
    alunos = [
        { id: 1, ra: 123456, name: "João Silva", degreeId: 1, classId: 1 },
        { id: 2, ra: 234567, name: "Maria Santos", degreeId: 2, classId: 2 },
        { id: 3, ra: 345678, name: "Pedro Oliveira", degreeId: 3, classId: 3 },
        { id: 4, ra: 456789, name: "Ana Costa", degreeId: 8, classId: 4 },
        { id: 5, ra: 567890, name: "Carlos Lima", degreeId: 6, classId: 5 },
        { id: 6, ra: 678901, name: "Juliana Alves", degreeId: 7, classId: 6 }
    ];
    
    classes = CONFIG.classes;
    atualizarFiltroDegrees();
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
        elementos.tabela.innerHTML = filtrados.map(aluno => {
            // Encontrar o nome do degree
            const degree = degrees.find(d => d.id === aluno.degreeId);
            const degreeNome = degree ? degree.name : `Degree ${aluno.degreeId}`;
            
            return `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.ra}</td>
                <td><input type="text" value="${aluno.name}" 
                    onchange="atualizarAluno(${aluno.id}, 'name', this.value)"></td>
                <td>
                    <select onchange="atualizarAluno(${aluno.id}, 'degreeId', this.value)">
                        ${degrees.map(d => `
                            <option value="${d.id}" ${d.id === aluno.degreeId ? 'selected' : ''}>
                                ${d.name}
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
            `;
        }).join('');
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
        contagem[d.name] = alunos.filter(a => a.degreeId === d.id).length;
    });
    
    const labels = Object.keys(contagem);
    const dados = Object.values(contagem);
    
    // Cores para todos os degrees
    const cores = [
        '#4A63E7', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
        '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#6f42c1',
        '#d63384', '#0dcaf0', '#ff6b6b', '#198754', '#0d6efd'
    ];
    
    if (grafico) {
        grafico.data.labels = labels;
        grafico.data.datasets[0].data = dados;
        grafico.data.datasets[0].backgroundColor = cores;
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
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
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