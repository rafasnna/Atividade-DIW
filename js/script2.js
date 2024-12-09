const API_KEY = 'dcf0af56f5062d43275aad958b95b54c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const genreFiltersElement = document.getElementById('genre-filters');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
let selectedGenres = [];


fetch('http://localhost:3000/series')
  .then(response => response.json())
  .then(data => console.log(data));


if (document.querySelectorAll('#genre-filters').length > 1) {
    console.warn('Múltiplos elementos com o ID "genre-filters" encontrados. Isso pode causar erros.');
}

// Função para buscar os gêneros disponíveis
async function fetchGenres() {
    try {
        const response = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=pt-BR`);
        const data = await response.json();
        populateGenres(data.genres);
    } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
    }
}

// Função para popular os filtros com os gêneros
function populateGenres(genres) {
    genres.forEach(genre => {
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check';
        checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" id="genre-${genre.id}" value="${genre.id}">
            <label class="form-check-label" for="genre-${genre.id}">${genre.name}</label>
        `;
        genreFiltersElement.appendChild(checkbox);
    });
}

// Função para aplicar os filtros selecionados
function applyFilters() {
    const previousGenres = [...selectedGenres]; // Copia os gêneros anteriores
    selectedGenres = [];
    
    // Obtém todos os checkboxes marcados
    document.querySelectorAll('.filter-section .form-check-input:checked').forEach(checkbox => {
        selectedGenres.push(checkbox.value);
    });

    // Só busca séries novamente se os filtros forem alterados
    if (JSON.stringify(previousGenres) !== JSON.stringify(selectedGenres)) {
        fetchSeries(); // Atualiza a busca de séries com os filtros aplicados
    }
}

// Função para buscar séries, com ou sem filtro
async function fetchSeries(query = '') {
    try {
        let endpoint = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
        if (query) {
            endpoint = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
        }
        if (selectedGenres.length > 0) {
            endpoint += `&with_genres=${selectedGenres.join(',')}`;
        }

        console.log('Endpoint usado:', endpoint); // Log do endpoint para debug
        const response = await fetch(endpoint);
        const data = await response.json();
        displaySeries(data.results);
    } catch (error) {
        console.error('Erro ao buscar séries:', error);
    }
}

// Função para exibir as séries no HTML
function displaySeries(series) {
    resultsContainer.innerHTML = ''; // Limpa os resultados antigos

    if (series.length === 0) {
        resultsContainer.innerHTML = '<p class="text-light">Nenhuma série encontrada.</p>';
        return;
    }

    series.forEach(serie => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card h-100 shadow border-0 rounded bg-dark text-light">
                <img src="${serie.poster_path ? IMAGE_URL + serie.poster_path : 'images/default.jpg'}" 
                     class="card-img-top" 
                     alt="${serie.name}">
                <div class="details-overlay">
                    <h5 class="card-title">${serie.name}</h5>
                    <p>${serie.first_air_date ? serie.first_air_date.split('-')[0] : 'Ano desconhecido'}</p>
                </div>
                <a href="details.html?id=${serie.id}" class="stretched-link"></a>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

// Função para inicializar a busca e os filtros
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const query = searchInput.value.trim();
    fetchSeries(query);
});

// Evento para aplicar os filtros
applyFiltersBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Previne o comportamento padrão
    applyFilters(); // Aplica os filtros
});

// Buscar gêneros e séries ao carregar a página
fetchGenres();
fetchSeries();
