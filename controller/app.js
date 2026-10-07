// ======================
// CONFIGURAÇÃO DO SUPABASE
// ======================
const SUPABASE_URL = 'https://kxpszptaumkosxctpiyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4cHN6cHRhdW1rb3N4Y3RwaXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExODk3MzMsImV4cCI6MjEwNjc2NTczM30.lvACacyF_PuTtEDEBasiyHC-fsR4ZEOgeOUOZmsQgEM';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado global
let state = {
    jogos: [],
    times: [],
    competidores: [],
    confrontos: []
};

// ======================
// CARREGAR DADOS DO SUPABASE
// ======================
async function carregarDados() {
    try {
        const [jogosRes, timesRes, competidoresRes, confrontosRes] = await Promise.all([
            db.from('jogos').select('*').order('id'),
            db.from('times').select('*').order('id'),
            db.from('competidores').select('*').order('id'),
            db.from('confrontos').select('*').order('id')
        ]);

        if (jogosRes.error) throw jogosRes.error;
        if (timesRes.error) throw timesRes.error;
        if (competidoresRes.error) throw competidoresRes.error;
        if (confrontosRes.error) throw confrontosRes.error;

        state.jogos = jogosRes.data.map(j => ({
            id: j.id,
            name: j.name,
            genre: j.genre
        }));

        state.times = timesRes.data.map(t => ({
            id: t.id,
            name: t.name,
            color: t.color
        }));

        state.competidores = competidoresRes.data.map(c => ({
            id: c.id,
            name: c.name,
            nickname: c.nickname,
            teamId: c.team_id
        }));

        state.confrontos = confrontosRes.data.map(c => ({
            id: c.id,
            gameId: c.game_id,
            team1Id: c.team1_id,
            team2Id: c.team2_id,
            date: c.date,
            score1: c.score1,
            score2: c.score2,
            status: c.status
        }));

        console.log('Dados carregados do Supabase!', state);
        renderizarTudo();
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        alert('Erro ao carregar dados do banco. Verifique o console.');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    configurarNavegacao();
    await carregarDados();
});

// ======================
// NAVEGAÇÃO
// ======================
function configurarNavegacao() {
    document.querySelectorAll('#sidebar-nav li').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById('view-' + view).classList.add('active');
            document.querySelectorAll('#sidebar-nav li').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function renderizarTudo() {
    renderizarDashboard();
    renderizarJogos();
    renderizarTimes();
    renderizarCompetidores();
    renderizarConfrontos();
}

// ======================
// RENDERIZAÇÕES
// ======================
function renderizarDashboard() {
    const stats = document.getElementById('dashboard-stats');
    const proximos = document.getElementById('upcoming-matches');
    const encerrados = state.confrontos.filter(c => c.status === 'finished').length;
    const agendados = state.confrontos.filter(c => c.status === 'scheduled').length;

    stats.innerHTML = `
        <div class="card"><span class="card-tag">Torneio</span><h3>${state.times.length}</h3><p class="subtitle">Equipes</p></div>
        <div class="card"><span class="card-tag">Atletas</span><h3>${state.competidores.length}</h3><p class="subtitle">Competidores</p></div>
        <div class="card"><span class="card-tag">Encerrados</span><h3>${encerrados}</h3><p class="subtitle">Resultados</p></div>
        <div class="card"><span class="card-tag">Pendentes</span><h3>${agendados}</h3><p class="subtitle">Agendamentos</p></div>
    `;

    proximos.innerHTML = state.confrontos.filter(c => c.status === 'scheduled').slice(0, 3).map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const t1 = state.times.find(t => t.id == c.team1Id);
        const t2 = state.times.find(t => t.id == c.team2Id);
        return `<div class="card"><span class="card-tag">${jogo?.name || 'Jogo'}</span>
            <div class="match-card">
                <div class="team-score"><strong>${t1?.name || 'TBD'}</strong></div>
                <div class="vs">VS</div>
                <div class="team-score"><strong>${t2?.name || 'TBD'}</strong></div>
            </div></div>`;
    }).join('');
}

function renderizarJogos() {
    const lista = document.getElementById('list-jogos');
    lista.innerHTML = state.jogos.map(j => `
        <div class="card">
            <span class="card-tag">${j.genre}</span>
            <h3>${j.name}</h3>
            <p class="subtitle">ID: ${j.id}</p>
            <div class="card-actions">
                <button class="btn-edit" onclick="editar('jogos', ${j.id})"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-delete" onclick="apagar('jogos', ${j.id})"><i class="fas fa-trash"></i> Apagar</button>
            </div>
        </div>
    `).join('');
}

function renderizarTimes() {
    const lista = document.getElementById('list-times');
    lista.innerHTML = state.times.map(t => `
        <div class="card" style="border-right: 4px solid ${t.color}">
            <span class="card-tag">EQUIPE</span>
            <h3>${t.name}</h3>
            <p class="subtitle">${state.competidores.filter(c => c.teamId == t.id).length} Jogadores</p>
            <div class="card-actions">
                <button class="btn-edit" onclick="editar('times', ${t.id})"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-delete" onclick="apagar('times', ${t.id})"><i class="fas fa-trash"></i> Apagar</button>
            </div>
        </div>
    `).join('');
}

function renderizarCompetidores() {
    const lista = document.getElementById('list-competidores');
    lista.innerHTML = state.competidores.map(c => {
        const time = state.times.find(t => t.id == c.teamId);
        return `
            <div class="card">
                <span class="card-tag">${time?.name || 'Sem Time'}</span>
                <h3>${c.nickname}</h3>
                <p class="subtitle">${c.name}</p>
                <div class="card-actions">
                    <button class="btn-edit" onclick="editar('competidores', ${c.id})"><i class="fas fa-pen"></i> Editar</button>
                    <button class="btn-delete" onclick="apagar('competidores', ${c.id})"><i class="fas fa-trash"></i> Apagar</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarConfrontos() {
    const lista = document.getElementById('list-confrontos');
    lista.innerHTML = state.confrontos.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const t1 = state.times.find(t => t.id == c.team1Id);
        const t2 = state.times.find(t => t.id == c.team2Id);
        const data = new Date(c.date).toLocaleString('pt-BR');
        return `
            <div class="card">
                <span class="card-tag">${jogo?.name || 'Jogo'} | ${data}</span>
                <div class="match-card">
                    <div class="team-score"><strong>${t1?.name || '???'}</strong><div class="score">${c.score1}</div></div>
                    <div class="vs">VS</div>
                    <div class="team-score"><strong>${t2?.name || '???'}</strong><div class="score">${c.score2}</div></div>
                </div>
                <div style="margin-top:1rem;text-align:center;">
                    <span class="card-tag" style="background:${c.status === 'finished' ? '#10b981' : '#f59e0b'}">
                        ${c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO'}
                    </span>
                    ${c.status === 'scheduled' ? `<button onclick="encerrar(${c.id})" style="padding:4px 8px;font-size:0.7rem;margin-left:8px;">Finalizar</button>` : ''}
                </div>
                <div class="card-actions" style="margin-top:1rem;">
                    <button class="btn-edit" onclick="editar('confrontos', ${c.id})"><i class="fas fa-pen"></i> Editar</button>
                    <button class="btn-delete" onclick="apagar('confrontos', ${c.id})"><i class="fas fa-trash"></i> Apagar</button>
                </div>
            </div>
        `;
    }).join('');
}

// ======================
// MODAL E FORMULÁRIOS
// ======================
const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

window.abrirFormulario = function(tipo, item = null) {
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
    }, 10);

    let html = '';

    if (tipo === 'jogo') {
        html = `
            <h2>${item ? 'Editar Jogo' : 'Novo Jogo'}</h2>
            <form onsubmit="salvarItem(event,'jogos',${item ? item.id : null})">
                <div class="form-group"><label>Nome</label><input name="name" required value="${item?.name || ''}"></div>
                <div class="form-group"><label>Gênero</label><input name="genre" required value="${item?.genre || ''}"></div>
                <div style="display:flex;gap:1rem;">
                    <button type="submit" class="btn-primary">${item ? 'Atualizar' : 'Salvar'}</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>`;
    }

    if (tipo === 'time') {
        html = `
            <h2>${item ? 'Editar Time' : 'Novo Time'}</h2>
            <form onsubmit="salvarItem(event,'times',${item ? item.id : null})">
                <div class="form-group"><label>Nome</label><input name="name" required value="${item?.name || ''}"></div>
                <div class="form-group"><label>Cor</label><input type="color" name="color" value="${item?.color || '#6366f1'}"></div>
                <div style="display:flex;gap:1rem;">
                    <button type="submit" class="btn-primary">${item ? 'Atualizar' : 'Criar'}</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>`;
    }

    if (tipo === 'competidor') {
        html = `
            <h2>${item ? 'Editar Competidor' : 'Novo Competidor'}</h2>
            <form onsubmit="salvarItem(event,'competidores',${item ? item.id : null})">
                <div class="form-group"><label>Nome Completo</label><input name="name" required value="${item?.name || ''}"></div>
                <div class="form-group"><label>Nickname</label><input name="nickname" required value="${item?.nickname || ''}"></div>
                <div class="form-group"><label>Time</label>
                    <select name="teamId" required>
                        ${state.times.map(t => `<option value="${t.id}" ${item && item.teamId == t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display:flex;gap:1rem;">
                    <button type="submit" class="btn-primary">${item ? 'Atualizar' : 'Registrar'}</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>`;
    }

    if (tipo === 'confronto') {
        html = `
            <h2>${item ? 'Editar Confronto' : 'Novo Confronto'}</h2>
            <form onsubmit="salvarItem(event,'confrontos',${item ? item.id : null})">
                <div class="form-group"><label>Jogo</label>
                    <select name="gameId" required>
                        ${state.jogos.map(j => `<option value="${j.id}" ${item && item.gameId == j.id ? 'selected' : ''}>${j.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                    <div class="form-group"><label>Time A</label>
                        <select name="team1Id" required>
                            ${state.times.map(t => `<option value="${t.id}" ${item && item.team1Id == t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Time B</label>
                        <select name="team2Id" required>
                            ${state.times.map(t => `<option value="${t.id}" ${item && item.team2Id == t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group"><label>Data/Hora</label>
                    <input type="datetime-local" name="date" required value="${item?.date ? item.date.slice(0,16) : new Date().toISOString().slice(0,16)}">
                </div>
                <input type="hidden" name="score1" value="${item?.score1 ?? 0}">
                <input type="hidden" name="score2" value="${item?.score2 ?? 0}">
                <input type="hidden" name="status" value="${item?.status || 'scheduled'}">
                <div style="display:flex;gap:1rem;">
                    <button type="submit" class="btn-primary">${item ? 'Atualizar' : 'Agendar'}</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>`;
    }

    formContent.innerHTML = html;
};

window.fecharModal = function() {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => modal.style.display = 'none', 300);
};

// ======================
// SALVAR (CREATE / UPDATE)
// ======================
window.salvarItem = async function(event, colecao, id) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries());

    try {
        if (colecao === 'jogos') {
            const dados = { name: formData.name, genre: formData.genre };
            if (id) {
                const { error } = await db.from('jogos').update(dados).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await db.from('jogos').insert([dados]);
                if (error) throw error;
            }
        }

        if (colecao === 'times') {
            const dados = { name: formData.name, color: formData.color };
            if (id) {
                const { error } = await db.from('times').update(dados).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await db.from('times').insert([dados]);
                if (error) throw error;
            }
        }

        if (colecao === 'competidores') {
            const dados = {
                name: formData.name,
                nickname: formData.nickname,
                team_id: Number(formData.teamId)
            };
            if (id) {
                const { error } = await db.from('competidores').update(dados).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await db.from('competidores').insert([dados]);
                if (error) throw error;
            }
        }

        if (colecao === 'confrontos') {
            const dados = {
                game_id: Number(formData.gameId),
                team1_id: Number(formData.team1Id),
                team2_id: Number(formData.team2Id),
                date: formData.date,
                score1: Number(formData.score1),
                score2: Number(formData.score2),
                status: formData.status
            };
            if (id) {
                const { error } = await db.from('confrontos').update(dados).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await db.from('confrontos').insert([dados]);
                if (error) throw error;
            }
        }

        fecharModal();
        await carregarDados();
    } catch (erro) {
        console.error(erro);
        alert('Erro ao salvar: ' + erro.message);
    }
};

// ======================
// EDITAR
// ======================
window.editar = function(colecao, id) {
    const item = state[colecao].find(i => i.id == id);
    if (!item) return;

    if (colecao === 'jogos') abrirFormulario('jogo', item);
    if (colecao === 'times') abrirFormulario('time', item);
    if (colecao === 'competidores') abrirFormulario('competidor', item);
    if (colecao === 'confrontos') abrirFormulario('confronto', item);
};

// ======================
// APAGAR (sem confirmação)
// ======================
window.apagar = async function(colecao, id) {
    try {
        const { error } = await db.from(colecao).delete().eq('id', id);
        if (error) throw error;
        await carregarDados();
    } catch (erro) {
        console.error(erro);
        alert('Erro ao apagar: ' + erro.message);
    }
};

// ======================
// FINALIZAR CONFRONTO
// ======================
window.encerrar = async function(id) {
    const c = state.confrontos.find(x => x.id == id);
    if (!c) return;

    const t1 = state.times.find(t => t.id == c.team1Id);
    const t2 = state.times.find(t => t.id == c.team2Id);

    const p1 = prompt(`Placar ${t1?.name}:`, '0');
    const p2 = prompt(`Placar ${t2?.name}:`, '0');

    if (p1 !== null && p2 !== null) {
        try {
            const { error } = await db
                .from('confrontos')
                .update({
                    score1: Number(p1),
                    score2: Number(p2),
                    status: 'finished'
                })
                .eq('id', id);

            if (error) throw error;
            await carregarDados();
        } catch (erro) {
            console.error(erro);
            alert('Erro ao finalizar: ' + erro.message);
        }
    }
};
