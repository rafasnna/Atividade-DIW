const API_KEY = 'dcf0af56f5062d43275aad958b95b54c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/original';

fetch('http://localhost:3000/series')
  .then(response => response.json())
  .then(data => console.log(data));


function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const mySeriesContainer = document.getElementById('my-series');
    mySeriesContainer.innerHTML = '';

    favorites.forEach(series => {
        mySeriesContainer.innerHTML += `
            <div class="col-md-2">
                <div class="card">
                    <img src="${IMAGE_URL + series.poster_path}" class="card-img-top" alt="${series.name}" onclick="navigateToDetails(${series.id})">
                    <div class="card-body">
                        <h5 class="card-title">${series.name}</h5>
                    </div>
                </div>
            </div>
        `;
    });
}

// Função para favoritar ou desfavoritar uma série
function toggleFavorite(series, button) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const exists = favorites.find(fav => fav.id === series.id);

    if (exists) {
        const updatedFavorites = favorites.filter(fav => fav.id !== series.id);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        button.classList.remove('star-filled');
        button.classList.add('star-empty');
        alert(`${series.name} foi removida das suas séries favoritas!`);
    } else {
        favorites.push(series);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        button.classList.remove('star-empty');
        button.classList.add('star-filled');
        alert(`${series.name} foi adicionada às suas séries favoritas!`);
    }

    loadFavorites(); 
}

// Função para buscar séries populares (BR/EN)
async function fetchPopularSeries() {
    try {
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR`);
        const data = await response.json();
        const popularContainer = document.getElementById('popular-series');

        // Filtrando apenas séries dos países BR e US
        const filteredSeries = data.results.filter(series => 
            series.origin_country.includes("US") || series.origin_country.includes("BR")
        );

        filteredSeries.slice(0, 5).forEach((series, index) => {
            popularContainer.innerHTML += `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${IMAGE_URL + series.backdrop_path}" class="d-block w-100 series-image" alt="${series.name}" onclick="navigateToDetails(${series.id})">
                    <div class="carousel-caption">
                        <h5>${series.name}</h5>
                        <button class="btn-star" onclick='toggleFavorite(${JSON.stringify(series)}, this.querySelector("i"))'>
                            <i class="fas fa-star ${series.favorite ? 'star-filled' : 'star-empty'}"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao buscar séries populares:", error);
        document.getElementById('popular-series').innerHTML = `<p>Erro ao carregar séries populares. Tente novamente mais tarde.</p>`;
    }
}

// Função para buscar novas séries filtradas por idioma (BR/EN)
async function fetchNewSeries() {
    try {
        const response = await fetch(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=pt-BR`);
        const data = await response.json();
        const newSeriesContainer = document.getElementById('new-series');
        
        // Filtrando séries por idioma (apenas séries em português ou inglês)
        const filteredSeries = data.results.filter(series =>
            series.original_language === 'pt' || series.original_language === 'en'
        );

        filteredSeries.slice(0, 6).forEach(series => {
            newSeriesContainer.innerHTML += `
                <div class="col-md-2">
                    <div class="card">
                        <img src="${IMAGE_URL + series.poster_path}" class="card-img-top" alt="${series.name}" onclick="navigateToDetails(${series.id})">
                        <div class="card-body">
                            <h5 class="card-title">${series.name}</h5>
                            <button class="btn-star" onclick='toggleFavorite(${JSON.stringify(series)}, this.querySelector("i"))'>
                                <i class="fas fa-star ${series.favorite ? 'star-filled' : 'star-empty'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao buscar novas séries:", error);
        document.getElementById('new-series').innerHTML = `<p>Erro ao carregar novas séries. Tente novamente mais tarde.</p>`;
    }
}


// Função para navegar para a página de detalhes da série
function navigateToDetails(seriesId) {
    window.location.href = `details.html?id=${seriesId}`;
}

// Função para obter detalhes da série
async function fetchSeriesDetails() {
    const params = new URLSearchParams(window.location.search);
    const seriesId = params.get('id');

    if (seriesId) {
        const response = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}&language=pt-BR`);
        const series = await response.json();

        const seriesDetailsContainer = document.getElementById('series-details');
        seriesDetailsContainer.innerHTML = `
            <div class="card bg-dark text-light">
                <img src="${IMAGE_URL + series.backdrop_path}" class="card-img-top" alt="${series.name}">
                <div class="card-body">
                    <h2>${series.name}</h2>
                    <p><strong>Sinopse:</strong> ${series.overview || "Sinopse não disponível."}</p>
                    <p><strong>Plataforma:</strong> ${series.networks.map(network => network.name).join(', ') || "Não informado"}</p>
                    <p><strong>Gêneros:</strong> ${series.genres.map(genre => genre.name).join(', ') || "Não informado"}</p>
                    <p><strong>Data de Lançamento:</strong> ${series.first_air_date || "Não informado"}</p>
                    <button class="btn btn-warning" onclick='toggleFavorite(${JSON.stringify(series)}, this.querySelector("i"))'>
                        <i class="fas fa-star ${series.favorite ? 'star-filled' : 'star-empty'}"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        document.getElementById('series-details').innerHTML = '<p>Série não encontrada.</p>';
    }
}

// Inicializando as funções
fetchPopularSeries();
fetchNewSeries();
loadFavorites();

// Verificando se estamos na página de detalhes
if (window.location.pathname.includes('details.html')) {
    fetchSeriesDetails();
}
