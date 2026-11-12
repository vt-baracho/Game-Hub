const games = [
    {
        id: "caos-no-aviao",
        title: "Caos no Avião",
        description: "Uma experiência de jogo ambientada em um cenário de caos aéreo.",
        category: "Action",
        url: "../Caos no avião/CAOS NO AVIÃO.html" // Verifique se os espaços desta pasta também estão com %20 se der erro
    },
    {
        id: "dungeons-pacmans",
        title: "Dungeons & Pacmans",
        description: "Uma aventura que mistura exploração de masmorras e elementos de Pac-Man.",
        category: "Adventure",
        url: "../Dungeons-and-pacmans/dungeons_dots_the_pac_crawler.html"
    },
    {
        id: "web-may-cry",
        title: "Web May Cry",
        description: "Uma experiência inspirada em jogos de ação e combate baseado em combos estilosos.",
        category: "Action",
        url: "../DMC/Web_May_Cry_v3.html"
    },
    {
        id: "funk",
        title: "Funk",
        description: "Um jogo de ritmo inspirado em experiências musicais.",
        category: "Rhythm",
        url: "../FNF/funk.html"
    },
    {
        id: "futebol-2d",
        title: "Futebol 2D",
        description: "Uma experiência de futebol em duas dimensões.",
        category: "Sports",
        url: "../Futebol2D/fut2d.html"
    },
    {
        id: "speedrunners",
        title: "Speedrunners",
        description: "Uma experiência de corrida e velocidade.",
        category: "Racing",
        url: "../Speedruners/CORREDORES.html"
    },
    {
        id: "space-invaders",
        title: "Space Invaders 3.0",
        description: "Uma aventura espacial com desafios e combates contra inimigos.",
        category: "Shooter",
        url: "../Space-invaders/space-invaders-3_0-dist-atualizado.html"
    },
    {
        id: "olympic-stars",
        title: "OLYMPIC STARS 3D",
        description: "Uma experiência de esportes olímpicos em 3D e ao mesmo tempo 2D.",
        category: "Sports",
        url: "../Caos no avião/Olympic Stars 3D.html"
    },
    {
        id: "hyper-hedgehog",
        title: "Hyper Hedgehog",
        description: "Acelere nessa versão fã, do primeiro clássico de um ouriço azul.",
        category: "Platform",
        url: "../hyper-hedgehog/index.html" // Mude aqui para o nome exato que você renomeou
    },
    {
        id: "retro-kong",
        title: "Retro Kong Arcade",
        description: "Entre numa versão fã, de um dos clássicos dos videogames.",
        category: "Platform",
        url: "../Retro-Kong-Arcade/retro_kong_arcade.html" // Mude aqui para o nome exato que você renomeou
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

    const guideLink = document.createElement("a");
    guideLink.className = "play-button guide-button";
    guideLink.href = `instructions.html?game=${encodeURIComponent(game.id)}`;
    guideLink.textContent = "Instructions →";

    content.append(category, title, description, link, guideLink);
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
