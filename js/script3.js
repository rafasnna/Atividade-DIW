document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'dcf0af56f5062d43275aad958b95b54c';
    const urlParams = new URLSearchParams(window.location.search);
    const seriesId = urlParams.get('id');

    fetch('http://localhost:3000/series')
    .then(response => response.json())
    .then(data => console.log(data));
  


    if (seriesId) {
        fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,season,videos`)
            .then(response => response.json())
            .then(data => {
                // Exibindo os dados principais
                document.getElementById('series-title').textContent = data.name || 'Título não disponível';
                document.getElementById('series-description').textContent = data.overview || 'Descrição não disponível';
                document.getElementById('series-rating').textContent = data.vote_average || 'Rating não disponível';
                document.getElementById('series-genre').textContent = data.genres.map(genre => genre.name).join(', ') || 'Gênero não disponível';
                document.getElementById('series-poster').src = `https://image.tmdb.org/t/p/w500${data.poster_path}` || 'images/default-poster.jpg';

                // Carregando o vídeo do trailer
                const trailerKey = data.videos.results && data.videos.results.length > 0 ? data.videos.results[0].key : null;
                if (trailerKey) {
                    const videoContainer = document.getElementById('video-container');
                    const videoElement = document.createElement('iframe');
                    videoElement.src = `https://www.youtube.com/embed/${trailerKey}`;
                    videoElement.width = "100%";
                    videoElement.height = "400px";
                    videoElement.frameBorder = "0";
                    videoElement.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
                    videoElement.allowFullscreen = true;
                    videoContainer.appendChild(videoElement);
                } else {
                    // Se não houver trailer, esconder a área de vídeo
                    document.getElementById('video-container').style.display = 'none';
                }

                // Carregando temporadas
                const seasonsContainer = document.getElementById('seasons-container');
                if (data.seasons && data.seasons.length > 0) {
                    data.seasons.forEach((season, index) => {
                        const seasonId = `season-${index + 1}`;
                        const seasonElement = document.createElement('div');
                        seasonElement.classList.add('accordion-item');
                        seasonElement.innerHTML = `
                            <h2 class="accordion-header" id="heading${seasonId}">
                                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${seasonId}" aria-expanded="true" aria-controls="collapse${seasonId}">
                                    Temporada ${season.season_number}
                                </button>
                            </h2>
                            <div id="collapse${seasonId}" class="accordion-collapse collapse" aria-labelledby="heading${seasonId}" data-bs-parent="#seasons-container">
                                <div class="accordion-body">
                                    <ul>
                                        ${season.episodes ? season.episodes.map(episode => `
                                            <li>
                                                <div>
                                                    <img src="https://image.tmdb.org/t/p/w500${episode.still_path}" alt="${episode.name}" class="img-thumbnail" style="width: 100px;">
                                                    <span>${episode.name}</span>
                                                </div>
                                            </li>
                                        `).join('') : 'Sem episódios disponíveis'}
                                    </ul>
                                </div>
                            </div>
                        `;
                        seasonsContainer.appendChild(seasonElement);
                    });
                } else {
                    const noSeasonsMessage = document.createElement('p');
                    noSeasonsMessage.textContent = 'Não há temporadas disponíveis.';
                    seasonsContainer.appendChild(noSeasonsMessage);
                }

                // Carregando elenco
                const castContainer = document.getElementById('cast-section');
                if (data.credits && data.credits.cast && data.credits.cast.length > 0) {
                    const castMembers = data.credits.cast.slice(0, 5); // Seleciona apenas os 5 primeiros membros

                    const castRow = document.createElement('div');
                    castRow.classList.add('d-flex', 'justify-content-start', 'flex-wrap'); // Usamos flexbox para alinhar da esquerda para a direita

                    castMembers.forEach(actor => {
                        const castMemberHTML = `
                            <div class="cast-member" style="margin-right: 20px; text-align: center;">
                                <div class="cast-photo">
                                    <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" alt="${actor.name}" class="img-thumbnail" style="width: 100px;">
                                </div>
                                <div class="cast-info">
                                    <p><strong>${actor.name}</strong></p>
                                    <p>${actor.character}</p>
                                </div>
                            </div>
                        `;
                        castRow.innerHTML += castMemberHTML;
                    });

                    castContainer.appendChild(castRow);
                } else {
                    const noCastMessage = document.createElement('p');
                    noCastMessage.textContent = 'Elenco não disponível.';
                    castContainer.appendChild(noCastMessage);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar dados da série:', error);
            });
    } else {
        console.error('ID da série não encontrado na URL');
    }
});
