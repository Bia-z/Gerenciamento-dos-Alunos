// app2.js - Tela 2: Gerenciamento de Professores

// ===== VARIÁVEIS GLOBAIS =====
let professores = [];
let materias = [];
let degrees = [];
let classes = [];
let relacionamentos = [];
let alunos = [];

// ===== MAPEAMENTO DE DEGREES =====
// Mapeamento de degrees antigos para os 5 simplificados
const MAPEAMENTO_DEGREES = {
    // Ensino Fundamental (id: 1)
    1: 1,   // Ensino Fundamental
    8: 1,   // 4º ano do ensino fundamental
    9: 1,   // 5º ano do ensino fundamental
    10: 1,  // 6º ano do ensino fundamental
    11: 1,  // 7º ano do ensino fundamental
    12: 1,  // 8º ano do ensino fundamental
    13: 1,  // 9º ano do ensino fundamental
    
    // Ensino Médio (id: 2)
    2: 2,   // 1° ano do ensino médio
    3: 2,   // 2° ano ensino médio
    4: 2,   // 3° ano do ensino médio
    
    // Cursinho (id: 3)
    5: 3,   // Cursinho
    
    // Estuda em Casa (id: 4)
    6: 4,   // Estudo em casa
    
    // Outros (id: 5)
    7: 5    // Outros
};

// Função para converter degreeId para formato simplificado
function converterDegreeParaSimplificado(degreeId) {
    return MAPEAMENTO_DEGREES[degreeId] || degreeId;
}

// ===== ELEMENTOS DOM =====
const elementos = {
    // Filtros
    filtroDegree: document.getElementById('filtroDegree'),
    filtroClass: document.getElementById('filtroClass'),
    filtroTeacher: document.getElementById('filtroTeacher'),
    btnFiltrar: document.getElementById('btnFiltrar'),
    btnLimpar: document.getElementById('btnLimpar'),
    
    // Tabela
    corpoTabela: document.getElementById('corpoTabela'),
    totalRelacionamentos: document.getElementById('totalRelacionamentos'),
    emptyStateRelacionamentos: document.getElementById('emptyStateRelacionamentos'),
    
    // Modal alunos
    modalAlunos: document.getElementById('modalAlunos'),
    modalDegreeNome: document.getElementById('modalDegreeNome'),
    modalAlunosLista: document.getElementById('modalAlunosLista'),
    
    // Formulário
    formNovoRelacionamento: document.getElementById('formNovoRelacionamento'),
    selectProfessor: document.getElementById('selectProfessor'),
    selectMateria: document.getElementById('selectMateria'),
    degreesContainer: document.getElementById('degreesContainer'),
    btnAddDegree: document.getElementById('btnAddDegree'),
    btnLimparForm: document.getElementById('btnLimparForm')
};

/* ===== VERIFICAR ELEMENTOS DOM ===== */
function verificarElementosDOM() {
    console.log('🔍 Verificando elementos DOM...');
    
    const elementosCriticos = [
        'corpoTabela',
        'totalRelacionamentos', 
        'emptyStateRelacionamentos',
        'filtroDegree',
        'filtroClass',
        'filtroTeacher'
    ];
    
    elementosCriticos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`${id}:`, elemento ? '✅ Encontrado' : '❌ Não encontrado');
    });
}

/* ===== INICIAR TUDO (com verificação de DOM) ===== */
function iniciarAposDOM() {
    console.log('🕐 Verificando estado do DOM...');
    
    if (document.readyState === 'loading') {
        console.log('📖 DOM ainda carregando, aguardando...');
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        console.log('✅ DOM já carregado, iniciando...');
        setTimeout(iniciar, 100);
    }
}

/* ===== INICIALIZAÇÃO PRINCIPAL ===== */
async function iniciar() {
    console.log('🚀 Iniciando Tela 2...');
    
    // Verificar elementos DOM
    verificarElementosDOM();
    
    try {
        // Verificar se elementos críticos existem
        if (!elementos.corpoTabela) {
            console.error('❌ Elemento corpoTabela não encontrado no DOM');
            mostrarNotificacao('Erro: Elemento da tabela não encontrado', 'error');
            return;
        }
        
        // Carregar todos os dados
        await carregarTodosDados();
        
        // Configurar eventos
        configurarEventos();
        
        // Inicializar formulário
        inicializarFormulario();
        
        // Renderizar tabela
        renderizarTabela();
        
        console.log('✅ Tela 2 pronta!');
        mostrarNotificacao('Sistema de professores carregado!', 'success');
        
    } catch (erro) {
        console.error('❌ Erro ao iniciar:', erro);
        mostrarNotificacao('Erro ao carregar dados', 'error');
    }
}

/* ===== CARREGAR DADOS ===== */
async function carregarTodosDados() {
    try {
        // Carregar professores
        const respProfessores = await fetch('../data/teachers.json');
        professores = await respProfessores.json();
        console.log(`👨‍🏫 ${professores.length} professores carregados`);
        
        // Carregar matérias
        const respMaterias = await fetch('../data/matters.json');
        materias = await respMaterias.json();
        console.log(`📚 ${materias.length} matérias carregadas`);
        
        // Degrees simplificados (5 categorias)
        degrees = [
            { id: 1, name: "Ensino Fundamental" },
            { id: 2, name: "Ensino Médio" },
            { id: 3, name: "Cursinho" },
            { id: 4, name: "Estuda em Casa" },
            { id: 5, name: "Outros" }
        ];
        console.log(`🎓 ${degrees.length} degrees configurados`);
        
        // Carregar classes
        const respClasses = await fetch('../data/classes.json');
        const classesData = await respClasses.json();
        classes = classesData.classes;
        console.log(`🏫 ${classes.length} classes carregadas`);
        
        // Carregar relacionamentos
        const respRelacionamentos = await fetch('../data/relationships.json');
        relacionamentos = await respRelacionamentos.json();
        console.log(`🔗 ${relacionamentos.length} relacionamentos carregados`);
        
        // Carregar alunos
        const respAlunos = await fetch('../data/students.json');
        alunos = await respAlunos.json();
        console.log(`👥 ${alunos.length} alunos carregados`);
        
        // Converter degrees antigos para os novos
        converterDegreesAntigos();
        
        // Preencher filtros
        preencherFiltros();
        
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        throw erro;
    }
}

/* ===== CONVERTER DEGREES ANTIGOS PARA OS 5 SIMPLIFICADOS ===== */
function converterDegreesAntigos() {
    // Converter degrees nos relacionamentos
    relacionamentos.forEach(rel => {
        rel.degrees?.forEach(degree => {
            const novoId = MAPEAMENTO_DEGREES[degree.degreeId];
            if (novoId) {
                degree.degreeId = novoId;
            }
        });
    });
    
    // Converter degrees nos alunos
    alunos.forEach(aluno => {
        const novoId = MAPEAMENTO_DEGREES[aluno.degreeId];
        if (novoId) {
            aluno.degreeId = novoId;
        }
    });
    
    console.log('✅ Degrees convertidos para formato simplificado');
}

/* ===== PREENCHER FILTROS ===== */
function preencherFiltros() {
    // Filtro de degrees
    if (elementos.filtroDegree) {
        elementos.filtroDegree.innerHTML = '<option value="">Todos os Degrees</option>' +
            degrees.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
    
    // Filtro de classes
    if (elementos.filtroClass) {
        elementos.filtroClass.innerHTML = '<option value="">Todas as Classes</option>' +
            classes.map((c, i) => `<option value="${i + 1}">${c.name}</option>`).join('');
    }
    
    // Filtro de professores
    if (elementos.filtroTeacher) {
        elementos.filtroTeacher.innerHTML = '<option value="">Todos os Professores</option>' +
            professores.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
}

/* ===== RENDERIZAR TABELA DE RELACIONAMENTOS ===== */
function renderizarTabela() {
    // Verificar se o elemento existe
    if (!elementos.corpoTabela) {
        console.error('❌ Elemento corpoTabela não encontrado');
        return;
    }
    
    // Aplicar filtros
    const relacionamentosFiltrados = filtrarRelacionamentos();
    
    // Atualizar contador
    if (elementos.totalRelacionamentos) {
        elementos.totalRelacionamentos.textContent = relacionamentosFiltrados.length;
    }
    
    // Mostrar/ocultar empty state
    if (relacionamentosFiltrados.length === 0) {
        elementos.corpoTabela.style.display = 'none';
        if (elementos.emptyStateRelacionamentos) {
            elementos.emptyStateRelacionamentos.style.display = 'block';
        }
    } else {
        elementos.corpoTabela.style.display = '';
        if (elementos.emptyStateRelacionamentos) {
            elementos.emptyStateRelacionamentos.style.display = 'none';
        }
        
        // Gerar HTML da tabela
        elementos.corpoTabela.innerHTML = relacionamentosFiltrados.map(rel => {
            // Encontrar professor
            const professor = professores.find(p => p.id === rel.teacherId) || { name: 'Desconhecido' };
            
            // Encontrar matéria
            const materia = materias.find(m => m.id === rel.matterId) || { name: 'Desconhecida' };
            
            // Gerar HTML dos degrees e classes
            const degreesHTML = gerarDegreesHTML(rel.degrees);
            
            return `
            <tr>
                <td>${rel.id}</td>
                <td>${professor.name}</td>
                <td>${materia.name}</td>
                <td>${degreesHTML}</td>
                <td>
                    <div class="acoes">
                        <button onclick="verAlunosDoRelacionamento(${rel.id})" class="btn-acao btn-ver-alunos">
                            <i class="fas fa-users"></i> Ver Alunos
                        </button>
                        <button onclick="editarRelacionamento(${rel.id})" class="btn-acao btn-editar">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="excluirRelacionamento(${rel.id})" class="btn-acao btn-excluir">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }
}

/* ===== GERAR HTML DOS DEGREES E CLASSES ===== */
function gerarDegreesHTML(degreesData) {
    if (!degreesData || degreesData.length === 0) {
        return '<span class="texto-vazio">Nenhum degree definido</span>';
    }
    
    return degreesData.map(degreeItem => {
        // Encontrar nome do degree
        const degree = degrees.find(d => d.id === degreeItem.degreeId);
        const degreeNome = degree ? degree.name : `Degree ${degreeItem.degreeId}`;
        
        // Gerar classes deste degree
        let classesHTML = '';
        if (degreeItem.classes && degreeItem.classes.length > 0) {
            const classesNomes = degreeItem.classes.map(classe => {
                const classIndex = (classe.classPosition || classe.classId || 1) - 1;
                return classes[classIndex]?.name || `Classe ${classIndex + 1}`;
            });
            
            classesHTML = classesNomes.map(nome => 
                `<span class="class-badge">${nome}</span>`
            ).join('');
        } else {
            classesHTML = '<span class="texto-vazio">Nenhuma classe</span>';
        }
        
        return `
        <div class="degree-item-tabela">
            <div class="degree-badge">${degreeNome}</div>
            <div class="classes-list">${classesHTML}</div>
        </div>
        `;
    }).join('');
}

/* ===== FILTRAR RELACIONAMENTOS ===== */
function filtrarRelacionamentos() {
    const degreeFiltro = elementos.filtroDegree ? elementos.filtroDegree.value : '';
    const classFiltro = elementos.filtroClass ? elementos.filtroClass.value : '';
    const teacherFiltro = elementos.filtroTeacher ? elementos.filtroTeacher.value : '';
    
    return relacionamentos.filter(rel => {
        // Filtro por professor
        if (teacherFiltro && rel.teacherId.toString() !== teacherFiltro) {
            return false;
        }
        
        // Filtro por degree
        if (degreeFiltro) {
            const temDegree = rel.degrees?.some(d => d.degreeId.toString() === degreeFiltro);
            if (!temDegree) return false;
        }
        
        // Filtro por classe
        if (classFiltro) {
            let temClasse = false;
            
            rel.degrees?.forEach(degree => {
                degree.classes?.forEach(classe => {
                    const classIndex = classe.classPosition || classe.classId || 1;
                    if (classIndex.toString() === classFiltro) {
                        temClasse = true;
                    }
                });
            });
            
            if (!temClasse) return false;
        }
        
        return true;
    });
}

/* ===== VER ALUNOS DO RELACIONAMENTO ===== */
function verAlunosDoRelacionamento(relacionamentoId) {
    const relacionamento = relacionamentos.find(r => r.id === relacionamentoId);
    if (!relacionamento) return;
    
    // Coletar todos os degrees do relacionamento
    const degreeIds = relacionamento.degrees?.map(d => d.degreeId) || [];
    
    // Encontrar alunos que estão em qualquer um desses degrees
    const alunosRelacionados = alunos.filter(aluno => 
        degreeIds.includes(aluno.degreeId)
    );
    
    // Coletar nomes dos degrees
    const degreeNomes = relacionamento.degrees.map(d => {
        const degree = degrees.find(de => de.id === d.degreeId);
        return degree ? degree.name : `Degree ${d.degreeId}`;
    });
    
    // Preencher modal
    if (elementos.modalDegreeNome) {
        elementos.modalDegreeNome.textContent = degreeNomes.join(', ');
    }
    
    if (alunosRelacionados.length === 0) {
        if (elementos.modalAlunosLista) {
            elementos.modalAlunosLista.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #718096;">
                        <i class="fas fa-user-slash fa-2x" style="margin-bottom: 15px;"></i>
                        <p>Nenhum aluno encontrado para este(s) degree(s)</p>
                    </td>
                </tr>
            `;
        }
    } else {
        if (elementos.modalAlunosLista) {
            elementos.modalAlunosLista.innerHTML = alunosRelacionados.map(aluno => {
                const classeNome = classes[aluno.classId - 1]?.name || `Classe ${aluno.classId}`;
                const degree = degrees.find(d => d.id === aluno.degreeId);
                const degreeNome = degree ? degree.name : `Degree ${aluno.degreeId}`;
                
                return `
                <tr>
                    <td>${aluno.id}</td>
                    <td>${aluno.name}</td>
                    <td>${aluno.ra}</td>
                    <td>${classeNome}</td>
                    <td>${degreeNome}</td>
                </tr>
                `;
            }).join('');
        }
    }
    
    // Mostrar modal
    if (elementos.modalAlunos) {
        elementos.modalAlunos.style.display = 'flex';
    }
}

/* ===== INICIALIZAR FORMULÁRIO ===== */
function inicializarFormulario() {
    // Preencher select de professores no formulário
    if (elementos.selectProfessor) {
        elementos.selectProfessor.innerHTML = '<option value="">Selecione um professor</option>' +
            professores.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    
    // Preencher select de matérias no formulário
    if (elementos.selectMateria) {
        elementos.selectMateria.innerHTML = '<option value="">Selecione uma matéria</option>' +
            materias.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }
    
    // Adicionar primeiro degree ao formulário
    adicionarDegreeAoFormulario();
}

/* ===== ADICIONAR DEGREE AO FORMULÁRIO ===== */
function adicionarDegreeAoFormulario() {
    if (!elementos.degreesContainer) return;
    
    const degreeItem = document.createElement('div');
    degreeItem.className = 'degree-item';
    
    // Gerar select de degrees
    const degreeSelect = document.createElement('select');
    degreeSelect.className = 'degree-select';
    degreeSelect.innerHTML = '<option value="">Selecione um degree</option>' +
        degrees.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    // Gerar checkboxes de classes
    const classesCheckboxes = document.createElement('div');
    classesCheckboxes.className = 'classes-checkboxes';
    
    classes.forEach((classe, index) => {
        const checkboxId = `class-${Date.now()}-${index}`;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.value = index + 1;
        
        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.textContent = classe.name;
        
        const container = document.createElement('div');
        container.className = 'class-checkbox';
        container.appendChild(checkbox);
        container.appendChild(label);
        
        classesCheckboxes.appendChild(container);
    });
    
    // Montar o degree item
    degreeItem.innerHTML = `
        <div class="degree-header">
            ${degreeSelect.outerHTML}
            <button type="button" class="btn-remover-degree" onclick="removerDegree(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="classes-container">
            <label>Classes:</label>
            ${classesCheckboxes.outerHTML}
        </div>
    `;
    
    elementos.degreesContainer.appendChild(degreeItem);
}

/* ===== REMOVER DEGREE DO FORMULÁRIO ===== */
function removerDegree(botao) {
    const degreeItem = botao.closest('.degree-item');
    if (elementos.degreesContainer && elementos.degreesContainer.children.length > 1) {
        degreeItem.remove();
    } else {
        mostrarNotificacao('É necessário ter pelo menos um degree', 'warning');
    }
}

/* ===== LIMPAR FORMULÁRIO ===== */
function limparFormulario() {
    if (elementos.formNovoRelacionamento) {
        elementos.formNovoRelacionamento.reset();
    }
    
    // Limpar degrees container e adicionar um novo
    if (elementos.degreesContainer) {
        elementos.degreesContainer.innerHTML = '';
        adicionarDegreeAoFormulario();
    }
    
    mostrarNotificacao('Formulário limpo!', 'info');
}

/* ===== SALVAR NOVO RELACIONAMENTO ===== */
function salvarNovoRelacionamento(e) {
    e.preventDefault();
    
    // Validar campos básicos
    const professorId = elementos.selectProfessor ? elementos.selectProfessor.value : '';
    const materiaId = elementos.selectMateria ? elementos.selectMateria.value : '';
    
    if (!professorId || !materiaId) {
        mostrarNotificacao('Selecione um professor e uma matéria', 'error');
        return;
    }
    
    // Coletar degrees e classes do formulário
    const degreesData = [];
    const degreeItems = elementos.degreesContainer ? 
        elementos.degreesContainer.querySelectorAll('.degree-item') : [];
    
    for (const degreeItem of degreeItems) {
        const degreeSelect = degreeItem.querySelector('.degree-select');
        const degreeId = degreeSelect ? degreeSelect.value : '';
        
        if (!degreeId) {
            mostrarNotificacao('Selecione um degree para todos os itens', 'error');
            return;
        }
        
        // Coletar classes selecionadas
        const classesSelecionadas = [];
        const checkboxes = degreeItem.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            classesSelecionadas.push({
                classPosition: parseInt(checkbox.value)
            });
        });
        
        if (classesSelecionadas.length === 0) {
            mostrarNotificacao('Selecione pelo menos uma classe para cada degree', 'error');
            return;
        }
        
        degreesData.push({
            degreeId: parseInt(degreeId),
            classes: classesSelecionadas
        });
    }
    
    // Criar novo relacionamento
    const novoId = relacionamentos.length > 0 ? Math.max(...relacionamentos.map(r => r.id)) + 1 : 1;
    
    const novoRelacionamento = {
        id: novoId,
        teacherId: parseInt(professorId),
        matterId: parseInt(materiaId),
        degrees: degreesData
    };
    
    // Adicionar ao array
    relacionamentos.push(novoRelacionamento);
    
    // Atualizar interface
    renderizarTabela();
    
    // Limpar formulário
    limparFormulario();
    
    // Mostrar notificação
    mostrarNotificacao('Novo relacionamento criado com sucesso!', 'success');
    
    console.log('Novo relacionamento:', novoRelacionamento);
}

/* ===== EDITAR RELACIONAMENTO ===== */
function editarRelacionamento(id) {
    const relacionamento = relacionamentos.find(r => r.id === id);
    if (!relacionamento) return;
    
    // Carregar dados no formulário
    if (elementos.selectProfessor) {
        elementos.selectProfessor.value = relacionamento.teacherId;
    }
    
    if (elementos.selectMateria) {
        elementos.selectMateria.value = relacionamento.matterId;
    }
    
    // Limpar degrees container
    if (elementos.degreesContainer) {
        elementos.degreesContainer.innerHTML = '';
    }
    
    // Adicionar degrees do relacionamento
    relacionamento.degrees.forEach(degreeItem => {
        adicionarDegreeAoFormulario();
        
        // Selecionar o último degree adicionado
        const lastDegree = elementos.degreesContainer.lastElementChild;
        const degreeSelect = lastDegree.querySelector('.degree-select');
        if (degreeSelect) {
            degreeSelect.value = degreeItem.degreeId;
        }
        
        // Marcar classes
        degreeItem.classes.forEach(classe => {
            const checkbox = lastDegree.querySelector(`input[value="${classe.classPosition || classe.classId}"]`);
            if (checkbox) checkbox.checked = true;
        });
    });
    
    mostrarNotificacao('Dados carregados no formulário. Atualize e salve.', 'info');
}

/* ===== EXCLUIR RELACIONAMENTO ===== */
function excluirRelacionamento(id) {
    if (confirm('Tem certeza que deseja excluir este relacionamento?')) {
        relacionamentos = relacionamentos.filter(r => r.id !== id);
        renderizarTabela();
        mostrarNotificacao('Relacionamento excluído com sucesso!', 'success');
    }
}

/* ===== CONFIGURAR EVENTOS ===== */
function configurarEventos() {
    // Filtros
    if (elementos.btnFiltrar) {
        elementos.btnFiltrar.addEventListener('click', renderizarTabela);
    }
    
    if (elementos.btnLimpar) {
        elementos.btnLimpar.addEventListener('click', () => {
            if (elementos.filtroDegree) elementos.filtroDegree.value = '';
            if (elementos.filtroClass) elementos.filtroClass.value = '';
            if (elementos.filtroTeacher) elementos.filtroTeacher.value = '';
            renderizarTabela();
            mostrarNotificacao('Filtros limpos!', 'info');
        });
    }
    
    // Filtro em tempo real
    if (elementos.filtroDegree) {
        elementos.filtroDegree.addEventListener('change', renderizarTabela);
    }
    
    if (elementos.filtroClass) {
        elementos.filtroClass.addEventListener('change', renderizarTabela);
    }
    
    if (elementos.filtroTeacher) {
        elementos.filtroTeacher.addEventListener('change', renderizarTabela);
    }
    
    // Modal
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (elementos.modalAlunos) {
                elementos.modalAlunos.style.display = 'none';
            }
        });
    }
    
    // Fechar modal clicando fora
    if (elementos.modalAlunos) {
        elementos.modalAlunos.addEventListener('click', (e) => {
            if (e.target === elementos.modalAlunos) {
                elementos.modalAlunos.style.display = 'none';
            }
        });
    }
    
    // Tecla ESC fecha modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elementos.modalAlunos && 
            elementos.modalAlunos.style.display === 'flex') {
            elementos.modalAlunos.style.display = 'none';
        }
    });
    
    // Botões do formulário
    if (elementos.btnAddDegree) {
        elementos.btnAddDegree.addEventListener('click', adicionarDegreeAoFormulario);
    }
    
    if (elementos.btnLimparForm) {
        elementos.btnLimparForm.addEventListener('click', limparFormulario);
    }
    
    if (elementos.formNovoRelacionamento) {
        elementos.formNovoRelacionamento.addEventListener('submit', salvarNovoRelacionamento);
    }
}

/* ===== NOTIFICAÇÕES ===== */
function mostrarNotificacao(mensagem, tipo = 'info') {
    const cores = {
        success: '#48bb78',
        error: '#f56565',
        info: '#4299e1',
        warning: '#ed8936'
    };
    
    const icones = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    // Remover notificações anteriores
    const notificacoesAnteriores = document.querySelectorAll('.notificacao-tela2');
    notificacoesAnteriores.forEach(n => n.remove());
    
    // Criar nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao-tela2';
    notificacao.style.cssText = `
        position: fixed;
        top: 25px;
        right: 25px;
        background: ${cores[tipo]};
        color: white;
        padding: 18px 25px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.4s ease;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 500;
        max-width: 400px;
    `;
    
    notificacao.innerHTML = `
        <i class="fas ${icones[tipo]}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.4s ease';
        setTimeout(() => notificacao.remove(), 400);
    }, 3000);
}

/* ===== DISPARAR INICIALIZAÇÃO ===== */
iniciarAposDOM();

/* ===== FUNÇÕES GLOBAIS ===== */
window.verAlunosDoRelacionamento = verAlunosDoRelacionamento;
window.editarRelacionamento = editarRelacionamento;
window.excluirRelacionamento = excluirRelacionamento;
window.adicionarDegreeAoFormulario = adicionarDegreeAoFormulario;
window.removerDegree = removerDegree;
window.limparFormulario = limparFormulario;
window.salvarNovoRelacionamento = salvarNovoRelacionamento;