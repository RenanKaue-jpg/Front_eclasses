// BASE_URL aponta para o JSON local enquanto a API não está integrada.
// Quando a API estiver pronta, basta trocar para: 'http://localhost:3000/api'
const BASE_URL = 'http://localhost:3000/';

// Função interna que simula um GET na "API"
async function _get(endpoint) {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
        throw new Error(`Erro ao buscar ${endpoint}: status ${response.status}`);
    }

    const data = await response.json();

    // Mapeia cada endpoint para a chave correspondente no JSON
    const rotas = {
        '/jogos': data.games,
        '/times': data.teams,
        '/competidores': data.competitors,
        '/confrontos': data.matches,
    };

    return rotas[endpoint] ?? [];
}

// Retorna todos os jogos
async function getJogos() {
    const response = await fetch (`${BASE_URL} api/jogos`);
    const data = await response.json();
    console.log(response)
    return data;
}

// Retorna todos os times
async function getTimes() {
    const response = await fetch (`${BASE_URL} api/times`);
    const data = await response.json();
    console.log(response)
    return data;
}

// Retorna todos os competidores
async function getCompetidores() {
    const response = await fetch (`${BASE_URL} api/competidores`);
    const data = await response.json();
    console.log(response)
    return data;
}

// Retorna todos os confrontos
async function getConfrontos() {
    const response = await fetch (`${BASE_URL} api/confrontos`);
    const data = await response.json();
    console.log(response)
    return data;
}
