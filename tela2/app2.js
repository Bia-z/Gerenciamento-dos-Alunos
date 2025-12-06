// app2.js - Tela 2: Gerenciamento de Professores

// ===== VARIÁVEIS GLOBAIS =====
let professores = [];
let materias = [];
let degrees = [];
let classes = [];
let relacionamentos = [];
let alunos = [];

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
        
        // Carregar degrees COMPLETOS do arquivo JSON
        const respDegrees = await fetch('../data/degrees.json');
        degrees = await respDegrees.json();
        console.log(`🎓 ${degrees.length} degrees carregados do JSON`);
        
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
        
        // Preencher filtros
        preencherFiltros();
        
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        throw erro;
    }
}

/* ===== PREENCHER FILTROS ===== */
function preencherFiltros() {
    // Filtro de degrees - use todos do JSON
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
        // Encontrar nome do degree ORIGINAL do JSON
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

/* ===== VER ALUNOS DO RELACIONAMENTO (COM DESTAQUE) ===== */
function verAlunosDoRelacionamento(relacionamentoId) {
    const relacionamento = relacionamentos.find(r => r.id === relacionamentoId);
    if (!relacionamento) return;
    
    // Coletar todas as combinações de degreeId e classId do relacionamento
    const combinacoes = [];
    relacionamento.degrees?.forEach(degree => {
        degree.classes?.forEach(classe => {
            const classId = classe.classPosition || classe.classId || 1;
            combinacoes.push({
                degreeId: degree.degreeId,
                classId: classId
            });
        });
    });
    
    // Encontrar alunos que estão em QUALQUER uma dessas combinações
    const alunosRelacionados = alunos.filter(aluno => {
        return combinacoes.some(combinacao => 
            aluno.degreeId === combinacao.degreeId && 
            aluno.classId === combinacao.classId
        );
    });
    
    // Coletar nomes dos degrees ORIGINAIS
    const degreeNomes = relacionamento.degrees.map(d => {
        const degree = degrees.find(de => de.id === d.degreeId);
        return degree ? degree.name : `Degree ${d.degreeId}`;
    });
    
    // Preencher modal COM DESTAQUE
    if (elementos.modalDegreeNome) {
        elementos.modalDegreeNome.textContent = degreeNomes.join(' • ');
    }
    
    if (alunosRelacionados.length === 0) {
        if (elementos.modalAlunosLista) {
            elementos.modalAlunosLista.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 60px; color: #718096; background: #f8f9fa;">
                        <i class="fas fa-user-slash fa-3x" style="margin-bottom: 25px; color: #dee2e6;"></i>
                        <h4 style="color: #6c757d; font-weight: 600; margin-bottom: 15px;">Nenhum aluno encontrado</h4>
                        <p style="font-size: 16px;">Não há alunos para este(s) degree(s) e classe(s)</p>
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
                <tr style="border-bottom: 1px solid #e9ecef;">
                    <td style="font-weight: 700; color: #060181;">${aluno.id}</td>
                    <td style="font-weight: 600;">${aluno.name}</td>
                    <td style="color: #f74a4b; font-weight: 600;">${aluno.ra}</td>
                    <td><span class="class-badge">${classeNome}</span></td>
                    <td><span class="degree-badge">${degreeNome}</span></td>
                </tr>
                `;
            }).join('');
        }
    }
    
    // Mostrar modal com animação
    if (elementos.modalAlunos) {
        abrirModal();
        
        // Adicionar classe para destacar o modal
        elementos.modalAlunos.querySelector('.modal-content').classList.add('modal-destaque');
        
        // Forçar o modal para o topo
        elementos.modalAlunos.scrollTop = 0;
        
        // Adicionar animação de entrada
        elementos.modalAlunos.querySelector('.modal-content').style.animation = 'modalEntrada 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }
}

/* ===== ABRIR MODAL FIXO NO CENTRO (VERSÃO SIMPLES) ===== */
function abrirModal() {
    if (elementos.modalAlunos) {
        // 1. Remover o modal de dentro do container (se estiver lá)
        const container = document.querySelector('.container');
        if (container && container.contains(elementos.modalAlunos)) {
            document.body.appendChild(elementos.modalAlunos);
        }
        
        // 2. Aplicar estilos para ficar fixo no centro
        elementos.modalAlunos.style.position = 'fixed';
        elementos.modalAlunos.style.top = '0';
        elementos.modalAlunos.style.left = '0';
        elementos.modalAlunos.style.width = '100%';
        elementos.modalAlunos.style.height = '100%';
        elementos.modalAlunos.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        elementos.modalAlunos.style.zIndex = '9999';
        elementos.modalAlunos.style.display = 'flex';
        elementos.modalAlunos.style.alignItems = 'center';
        elementos.modalAlunos.style.justifyContent = 'center';
        elementos.modalAlunos.style.padding = '20px';
        elementos.modalAlunos.style.overflowY = 'auto';
        
        // 3. Ajustar o conteúdo do modal para ser responsivo
        const modalContent = elementos.modalAlunos.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.margin = 'auto';
            modalContent.style.maxHeight = '85vh';
            modalContent.style.overflowY = 'auto';
            modalContent.style.animation = 'modalEntrada 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        // 4. Remover qualquer blur/opacidade do modal
        elementos.modalAlunos.style.filter = 'none';
        elementos.modalAlunos.style.opacity = '1';
        
        // 5. Bloquear scroll da página
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-aberto');
        
        console.log('✅ Modal aberto no centro da tela');
    }
}

/* ===== FECHAR MODAL (VERSÃO SIMPLES) ===== */
function fecharModal() {
    if (elementos.modalAlunos) {
        // 1. Esconder o modal
        elementos.modalAlunos.style.display = 'none';
        
        // 2. Resetar posição (mas manter no body)
        elementos.modalAlunos.style.position = '';
        elementos.modalAlunos.style.top = '';
        elementos.modalAlunos.style.left = '';
        elementos.modalAlunos.style.width = '';
        elementos.modalAlunos.style.height = '';
        elementos.modalAlunos.style.backgroundColor = '';
        
        // 3. Liberar scroll da página
        document.body.style.overflow = '';
        document.body.classList.remove('modal-aberto');
        
        console.log('✅ Modal fechado');
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
    
    // Gerar select de degrees COM TODOS OS ORIGINAIS
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
    if (!relacionamento) {
        mostrarNotificacao('Relacionamento não encontrado', 'error');
        return;
    }
    
    // Encontrar professor
    const professor = professores.find(p => p.id === relacionamento.teacherId);
    if (!professor) {
        mostrarNotificacao('Professor não encontrado', 'error');
        return;
    }
    
    // Abrir modal de edição
    abrirModalEdicao(relacionamento, professor);
}

/* ===== ABRIR MODAL DE EDIÇÃO ===== */
function abrirModalEdicao(relacionamento, professor) {
    // Criar modal de edição
    let modalEdicao = document.getElementById('modalEdicao');
    
    // Se não existir, criar
    if (!modalEdicao) {
        modalEdicao = document.createElement('div');
        modalEdicao.id = 'modalEdicao';
        modalEdicao.className = 'modal';
        document.body.appendChild(modalEdicao);
    }
    
    // Encontrar matéria
    const materia = materias.find(m => m.id === relacionamento.matterId);
    const materiaNome = materia ? materia.name : 'Desconhecida';
    
    // Gerar HTML do modal
    modalEdicao.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header" style="background: #060181;">
                <h3><i class="fas fa-edit"></i> Editar Relacionamento</h3>
                <button class="close-modal" onclick="fecharModalEdicao()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="formEditarRelacionamento">
                    <div class="form-grid">
                        <!-- PROFESSOR -->
                        <div class="form-group">
                            <label for="editarProfessor"><i class="fas fa-user-tie"></i> Professor</label>
                            <input type="text" id="editarProfessor" class="form-select" 
                                value="${professor.name}" required>
                        </div>
                        
                        <!-- MATÉRIA -->
                        <div class="form-group">
                            <label for="editarMateria"><i class="fas fa-book"></i> Matéria</label>
                            <select id="editarMateria" class="form-select" required>
                                <option value="">Selecione uma matéria</option>
                                ${materias.map(m => `
                                    <option value="${m.id}" ${m.id === relacionamento.matterId ? 'selected' : ''}>
                                        ${m.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <!-- DEGREES E CLASSES -->
                    <div class="form-section">
                        <h4><i class="fas fa-graduation-cap"></i> Degrees e Classes Relacionadas</h4>
                        <div id="editarDegreesContainer" class="degrees-container">
                            ${gerarDegreesEdicaoHTML(relacionamento.degrees)}
                        </div>
                        
                        <button type="button" class="btn-add" onclick="adicionarDegreeEdicao()">
                            <i class="fas fa-plus"></i> Adicionar Degree
                        </button>
                    </div>
                    
                    <!-- BOTÕES DO FORMULÁRIO DE EDIÇÃO -->
                    <div class="form-botoes">
                        <button type="submit" class="btn-submit" style="background: #060181;">
                            <i class="fas fa-save"></i> Salvar Alterações
                        </button>
                        <button type="button" class="btn-limpar" onclick="fecharModalEdicao()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                    
                    <input type="hidden" id="editarRelacionamentoId" value="${relacionamento.id}">
                </form>
            </div>
        </div>
    `;
    
    // Mostrar modal
    modalEdicao.style.display = 'flex';
    document.body.classList.add('modal-aberto');
    
    // Configurar evento do formulário
    const form = document.getElementById('formEditarRelacionamento');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarEdicaoRelacionamento(relacionamento.id);
        });
    }
    
    // Configurar fechar modal clicando fora
    modalEdicao.addEventListener('click', (e) => {
        if (e.target === modalEdicao) {
            fecharModalEdicao();
        }
    });
}

/* ===== GERAR HTML DOS DEGREES PARA EDIÇÃO ===== */
function gerarDegreesEdicaoHTML(degreesData) {
    if (!degreesData || degreesData.length === 0) {
        // Adicionar um degree vazio
        return gerarDegreeItemEdicaoHTML(null);
    }
    
    return degreesData.map(degreeItem => 
        gerarDegreeItemEdicaoHTML(degreeItem)
    ).join('');
}

/* ===== GERAR HTML DE UM DEGREE PARA EDIÇÃO ===== */
function gerarDegreeItemEdicaoHTML(degreeItem) {
    const degreeId = degreeItem ? degreeItem.degreeId : '';
    const classesSelecionadas = degreeItem ? degreeItem.classes.map(c => c.classPosition || c.classId || 1) : [];
    
    // HTML para checkboxes de classes
    let classesCheckboxes = '';
    classes.forEach((classe, index) => {
        const classId = index + 1;
        const checked = classesSelecionadas.includes(classId) ? 'checked' : '';
        classesCheckboxes += `
            <div class="class-checkbox">
                <input type="checkbox" value="${classId}" ${checked}>
                <label>${classe.name}</label>
            </div>
        `;
    });
    
    return `
    <div class="degree-item">
        <div class="degree-header">
            <select class="degree-select">
                <option value="">Selecione um degree</option>
                ${degrees.map(d => `
                    <option value="${d.id}" ${d.id == degreeId ? 'selected' : ''}>
                        ${d.name}
                    </option>
                `).join('')}
            </select>
            <button type="button" class="btn-remover-degree" onclick="removerDegreeEdicao(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="classes-container">
            <label>Classes:</label>
            <div class="classes-checkboxes">
                ${classesCheckboxes}
            </div>
        </div>
    </div>
    `;
}

/* ===== ADICIONAR DEGREE NA EDIÇÃO ===== */
function adicionarDegreeEdicao() {
    const container = document.getElementById('editarDegreesContainer');
    if (!container) return;
    
    container.innerHTML += gerarDegreeItemEdicaoHTML(null);
}

/* ===== REMOVER DEGREE NA EDIÇÃO ===== */
function removerDegreeEdicao(botao) {
    const degreeItem = botao.closest('.degree-item');
    const container = document.getElementById('editarDegreesContainer');
    
    if (container && container.children.length > 1) {
        degreeItem.remove();
    } else {
        mostrarNotificacao('É necessário ter pelo menos um degree', 'warning');
    }
}

/* ===== SALVAR EDIÇÃO DO RELACIONAMENTO ===== */
function salvarEdicaoRelacionamento(relacionamentoId) {
    const relacionamentoIndex = relacionamentos.findIndex(r => r.id === relacionamentoId);
    if (relacionamentoIndex === -1) {
        mostrarNotificacao('Relacionamento não encontrado', 'error');
        return;
    }
    
    // Coletar dados do formulário
    const novoNomeProfessor = document.getElementById('editarProfessor')?.value.trim();
    const novaMateriaId = document.getElementById('editarMateria')?.value;
    
    if (!novoNomeProfessor || !novaMateriaId) {
        mostrarNotificacao('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    // Coletar degrees e classes
    const degreesData = [];
    const degreeItems = document.querySelectorAll('#editarDegreesContainer .degree-item');
    
    for (const degreeItem of degreeItems) {
        const degreeSelect = degreeItem.querySelector('.degree-select');
        const degreeId = degreeSelect?.value;
        
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
    
    // Atualizar professor
    const professorIndex = professores.findIndex(p => p.id === relacionamentos[relacionamentoIndex].teacherId);
    if (professorIndex !== -1) {
        professores[professorIndex].name = novoNomeProfessor;
    }
    
    // Atualizar relacionamento
    relacionamentos[relacionamentoIndex] = {
        ...relacionamentos[relacionamentoIndex],
        matterId: parseInt(novaMateriaId),
        degrees: degreesData
    };
    
    // Fechar modal
    fecharModalEdicao();
    
    // Atualizar interface
    renderizarTabela();
    
    // Mostrar notificação
    mostrarNotificacao('Relacionamento atualizado com sucesso!', 'success');
    
    console.log('Relacionamento atualizado:', relacionamentos[relacionamentoIndex]);
}

/* ===== FECHAR MODAL DE EDIÇÃO ===== */
function fecharModalEdicao() {
    const modal = document.getElementById('modalEdicao');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-aberto');
    }
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
        closeModalBtn.addEventListener('click', fecharModal);
    }
    
    // Fechar modal clicando fora
    if (elementos.modalAlunos) {
        elementos.modalAlunos.addEventListener('click', (e) => {
            if (e.target === elementos.modalAlunos) {
                fecharModal();
            }
        });
    }
    
    // Tecla ESC fecha modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elementos.modalAlunos && 
            elementos.modalAlunos.style.display === 'flex') {
            fecharModal();
        }
        
        if (e.key === 'Escape' && document.getElementById('modalEdicao') && 
            document.getElementById('modalEdicao').style.display === 'flex') {
            fecharModalEdicao();
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

/* ===== ANIMAÇÕES CSS ===== */
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

/* ===== DISPARAR INICIALIZAÇÃO ===== */
adicionarAnimacoes();
iniciarAposDOM();

/* ===== FUNÇÕES GLOBAIS ===== */
window.verAlunosDoRelacionamento = verAlunosDoRelacionamento;
window.editarRelacionamento = editarRelacionamento;
window.excluirRelacionamento = excluirRelacionamento;
window.adicionarDegreeAoFormulario = adicionarDegreeAoFormulario;
window.removerDegree = removerDegree;
window.limparFormulario = limparFormulario;
window.salvarNovoRelacionamento = salvarNovoRelacionamento;
window.adicionarDegreeEdicao = adicionarDegreeEdicao;
window.removerDegreeEdicao = removerDegreeEdicao;
window.fecharModalEdicao = fecharModalEdicao;
window.fecharModal = fecharModal;