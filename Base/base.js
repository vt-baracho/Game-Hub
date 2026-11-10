const games = [
    {
        title: "Caos no Avião",
        description: "Uma experiência de jogo ambientada em um cenário de caos aéreo.",
        category: "Action",
        url: "../Caos no avião/CAOS NO AVIÃO.html" // Verifique se os espaços desta pasta também estão com %20 se der erro
    },
    {
        title: "Dungeons & Pacmans",
        description: "Uma aventura que mistura exploração de masmorras e elementos de Pac-Man.",
        category: "Adventure",
        url: "../Dungeons-and-pacmans/dungeons_dots_the_pac_crawler.html"
    },
    {
        title: "Web May Cry",
        description: "Uma experiência inspirada em jogos de ação e combate.",
        category: "Action",
        url: "../DVC/Web_May_Cry_v3.html"
    },
    {
        title: "Funk",
        description: "Um jogo de ritmo inspirado em experiências musicais.",
        category: "Rhythm",
        url: "../FNF/funk.html"
    },
    {
        title: "Futebol 2D",
        description: "Uma experiência de futebol em duas dimensões.",
        category: "Sports",
        url: "../Futebol2D/fut2d.html"
    },
    {
        title: "Speedrunners",
        description: "Uma experiência de corrida e velocidade.",
        category: "Racing",
        url: "../Speedruners/CORREDORES.html"
    },
    {
        title: "Space Invaders 3.0",
        description: "Uma aventura espacial com desafios e combates contra inimigos.",
        category: "Shooter",
        url: "../Space-invaders/space-invaders-3_0-dist-atualizado.html"
    },
    {
        title: "Hyper Hedgehog",
        description: "Entre numa versão fã, de um dos clássicos dos videogames",
        category: "Platform",
        url: "../hyper%20Hedgehog/Hyper%20Hedgehog.html" // CORRIGIDO AQUI: %20 substitui os espaços
    }
];

const gamesGrid = document.getElementById("games-grid");
const searchInput = document.getElementById("game-search");
const categoryFilter = document.getElementById("category-filter");
const counter = document.getElementById("games-counter");
const emptyMessage = document.getElementById("empty-message");

// Generate category options
function loadCategories() {
    const categories = [
        ...new Set(games.map(game => game.category))
    ];

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}

// Generate a game card
function createGameCard(game, index) {
    const card = document.createElement("article");
    card.className = "game-card";

    // Cover
    const cover = document.createElement("div");
    cover.className = "game-image game-cover";
    cover.textContent = String(index + 1).padStart(2, "0");

    // Content
    const content = document.createElement("div");
    content.className = "game-content";

    const category = document.createElement("span");
    category.className = "game-category";
    category.textContent = game.category;

    const title = document.createElement("h3");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.description;

    // Play button
    const link = document.createElement("a");
    link.className = "play-button";
    link.href = game.url;
    link.textContent = "Play Game →";

    content.append(category, title, description, link);
    card.append(cover, content);

    return card;
}

// Render games according to search and category
function renderGames() {
    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();

    const selectedCategory = categoryFilter.value;

    const filteredGames = games.filter(game => {
        const matchesSearch =
            game.title.toLowerCase().includes(searchTerm) ||
            game.description.toLowerCase().includes(searchTerm) ||
            game.category.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            game.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    gamesGrid.replaceChildren();

    filteredGames.forEach(game => {
        const originalIndex = games.indexOf(game);

        gamesGrid.appendChild(
            createGameCard(game, originalIndex)
        );
    });

    counter.textContent = `${filteredGames.length} GAMES`;

    emptyMessage.hidden = filteredGames.length > 0;
}

// Events
searchInput.addEventListener("input", renderGames);
categoryFilter.addEventListener("change", renderGames);

// Initialize
loadCategories();
renderGames();

// Automatic footer year
document.getElementById("current-year").textContent =
    new Date().getFullYear();