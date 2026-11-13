
/* =========================================
   GAME HUB - INSTRUCTIONS GAMEPAD SYSTEM
========================================= */

(() => {

    let gamepadIndex = null;
    let elements = [];
    let selectedIndex = -1;

    let previousButtons = [];
    let navigationCooldown = 0;

    const DEADZONE = 0.30;
    const NAV_DELAY = 12;

    const status = document.createElement("div");

    status.className = "gamepad-status";

    status.innerHTML = `
        <span class="status-dot"></span>
        <div>
            <div class="status-text">Nenhum controle conectado</div>
            <strong class="status-name"></strong>
        </div>
    `;

    document.body.appendChild(status);

    const statusText = status.querySelector(".status-text");
    const statusName = status.querySelector(".status-name");

    /* =====================================
       ELEMENTOS NAVEGÁVEIS
    ===================================== */

    function updateElements() {

        const selectors = [
            'a[href]',
            'button',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '#game-list > *',
            '.game-item',
            '.game-card'
        ].join(',');

        elements = [...new Set(
            document.querySelectorAll(selectors)
        )].filter(element => {

            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);

            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                !element.disabled &&
                !element.closest("[hidden]")
            );

        });

    }

    /* =====================================
       DESTAQUE VISUAL
    ===================================== */

    function clearSelection() {

        elements.forEach(element => {
            element.classList.remove("gamepad-selected");
        });

    }

    function selectElement(index) {

        updateElements();

        if (!elements.length) return;

        selectedIndex = Math.max(
            0,
            Math.min(index, elements.length - 1)
        );

        clearSelection();

        const element = elements[selectedIndex];

        element.classList.add("gamepad-selected");

        element.focus({
            preventScroll: true
        });

        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
        });

    }

    /* =====================================
       NAVEGAÇÃO ESPACIAL
    ===================================== */

    function navigate(direction) {

        updateElements();

        if (!elements.length) return;

        if (selectedIndex < 0) {
            selectElement(0);
            return;
        }

        const current = elements[selectedIndex];

        if (!current) {
            selectElement(0);
            return;
        }

        const a = current.getBoundingClientRect();

        const cx = a.left + a.width / 2;
        const cy = a.top + a.height / 2;

        let bestIndex = -1;
        let bestScore = Infinity;

        elements.forEach((element, index) => {

            if (index === selectedIndex) return;

            const b = element.getBoundingClientRect();

            const dx = b.left + b.width / 2 - cx;
            const dy = b.top + b.height / 2 - cy;

            let valid = false;
            let score = Infinity;

            if (direction === "up" && dy < -5) {
                valid = true;
                score = Math.abs(dy) + Math.abs(dx) * 1.5;
            }

            if (direction === "down" && dy > 5) {
                valid = true;
                score = Math.abs(dy) + Math.abs(dx) * 1.5;
            }

            if (direction === "left" && dx < -5) {
                valid = true;
                score = Math.abs(dx) + Math.abs(dy) * 1.5;
            }

            if (direction === "right" && dx > 5) {
                valid = true;
                score = Math.abs(dx) + Math.abs(dy) * 1.5;
            }

            if (valid && score < bestScore) {
                bestScore = score;
                bestIndex = index;
            }

        });

        if (bestIndex !== -1) {
            selectElement(bestIndex);
        }

    }

    /* =====================================
       BIBLIOTECA DE JOGOS
    ===================================== */

    function getGameItems() {

        const list = document.getElementById("game-list");

        if (!list) return [];

        return [...list.children].filter(element => {

            const rect = element.getBoundingClientRect();

            return (
                rect.width > 0 &&
                rect.height > 0 &&
                getComputedStyle(element).display !== "none"
            );

        });

    }

    function selectGame(direction) {

        const games = getGameItems();

        if (!games.length) return;

        updateElements();

        let currentGame = elements[selectedIndex];

        let currentGameIndex = games.findIndex(game =>
            game === currentGame ||
            game.contains(currentGame)
        );

        if (currentGameIndex === -1) {

            const activeGame = games.findIndex(game =>
                game.classList.contains("active") ||
                game.getAttribute("aria-current") === "true"
            );

            currentGameIndex = activeGame >= 0 ? activeGame : 0;

        }

        let nextIndex = currentGameIndex + direction;

        nextIndex = Math.max(
            0,
            Math.min(nextIndex, games.length - 1)
        );

        const target = games[nextIndex];

        const clickable = target.matches("button, a") ?
            target :
            target.querySelector("button, a, [tabindex]");

        const element = clickable || target;

        if (!element.matches("button, a, input, select, [tabindex]")) {
            element.setAttribute("tabindex", "0");
        }

        updateElements();

        const index = elements.indexOf(element);

        if (index !== -1) {
            selectElement(index);
        }

        else {
            element.click();
        }

    }

    /* =====================================
       SEÇÕES
    ===================================== */

    function goToSection(id) {

        const section = document.getElementById(id);

        if (!section) return;

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(() => {

            updateElements();

            const index = elements.findIndex(element =>
                element === section ||
                section.contains(element)
            );

            if (index !== -1) {
                selectElement(index);
            }

        }, 350);

    }

    /* =====================================
       AÇÕES DOS BOTÕES
    ===================================== */

    function pressButton(index) {

        switch (index) {

            // A / X - CONFIRMAR
            case 0:

                if (elements[selectedIndex]) {
                    elements[selectedIndex].click();
                }

                break;

            // B / O - VOLTAR
            case 1:

                if (
                    document.activeElement &&
                    document.activeElement.matches(
                        "input, textarea, select"
                    )
                ) {

                    document.activeElement.blur();

                } else {

                    window.location.href = "base.html";

                }

                break;

            // X / QUADRADO - BIBLIOTECA
            case 2:

                goToSection("game-list");

                break;

            // Y / TRIÂNGULO - INÍCIO
            case 3:

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                updateElements();

                selectElement(0);

                break;

            // LB / L1 - JOGO ANTERIOR
            case 4:

                selectGame(-1);

                break;

            // RB / R1 - PRÓXIMO JOGO
            case 5:

                selectGame(1);

                break;

            // START - CONFIRMAR JOGO
            case 9:

                if (elements[selectedIndex]) {
                    elements[selectedIndex].click();
                }

                break;

        }

    }

    /* =====================================
       CONEXÃO DO CONTROLE
    ===================================== */

    window.addEventListener("gamepadconnected", event => {

        gamepadIndex = event.gamepad.index;

        previousButtons = [];

        status.classList.add("connected");

        statusText.textContent = "Controle conectado";

        statusName.textContent = event.gamepad.id;

        updateElements();

        if (selectedIndex < 0 && elements.length) {
            selectElement(0);
        }

        console.log("Gamepad conectado:", event.gamepad.id);

    });

    window.addEventListener("gamepaddisconnected", event => {

        if (gamepadIndex === event.gamepad.index) {

            gamepadIndex = null;

            status.classList.remove("connected");

            statusText.textContent =
                "Nenhum controle conectado";

            statusName.textContent = "";

            clearSelection();

            selectedIndex = -1;

        }

    });

    /* =====================================
       ANALÓGICOS
    ===================================== */

    function readAnalog(gamepad) {

        const x = gamepad.axes[0] || 0;
        const y = gamepad.axes[1] || 0;

        if (navigationCooldown > 0) {
            navigationCooldown--;
        }

        if (navigationCooldown === 0) {

            if (Math.abs(x) > DEADZONE) {

                navigate(x > 0 ? "right" : "left");

                navigationCooldown = NAV_DELAY;

            }

            else if (Math.abs(y) > DEADZONE) {

                navigate(y > 0 ? "down" : "up");

                navigationCooldown = NAV_DELAY;

            }

        }

        // ANALÓGICO DIREITO: ROLAGEM

        const rightY = gamepad.axes[3] || 0;

        if (Math.abs(rightY) > DEADZONE) {

            window.scrollBy({
                top: rightY * 13,
                behavior: "auto"
            });

        }

    }

    /* =====================================
       D-PAD
    ===================================== */

    function readDpad(gamepad) {

        const directions = [
            [12, "up"],
            [13, "down"],
            [14, "left"],
            [15, "right"]
        ];

        directions.forEach(([button, direction]) => {

            const pressed =
                gamepad.buttons[button]?.pressed || false;

            if (pressed && !previousButtons[button]) {
                navigate(direction);
            }

        });

    }

    /* =====================================
       GAMEPAD LOOP
    ===================================== */

    function gamepadLoop() {

        requestAnimationFrame(gamepadLoop);

        if (gamepadIndex === null) return;

        const gamepad =
            navigator.getGamepads()[gamepadIndex];

        if (!gamepad || !gamepad.connected) return;

        gamepad.buttons.forEach((button, index) => {

            const pressed = button.pressed;

            if (pressed && !previousButtons[index]) {
                pressButton(index);
            }

            previousButtons[index] = pressed;

        });

        readAnalog(gamepad);

        readDpad(gamepad);

    }

    /* =====================================
       TECLADO
    ===================================== */

    document.addEventListener("keydown", event => {

        const directions = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right"
        };

        if (directions[event.key]) {

            event.preventDefault();

            updateElements();

            if (selectedIndex < 0) {
                selectElement(0);
            } else {
                navigate(directions[event.key]);
            }

        }

        if (event.key === "Enter" && selectedIndex >= 0) {

            event.preventDefault();

            elements[selectedIndex]?.click();

        }

        if (event.key === "Escape") {

            window.location.href = "base.html";

        }

    });

    /* =====================================
       DETECTAR CONTROLE JÁ CONECTADO
    ===================================== */

    function detectConnectedGamepad() {

        if (!navigator.getGamepads) return;

        const gamepads = navigator.getGamepads();

        for (let i = 0; i < gamepads.length; i++) {

            const gamepad = gamepads[i];

            if (gamepad && gamepad.connected) {

                gamepadIndex = i;

                status.classList.add("connected");

                statusText.textContent = "Controle conectado";

                statusName.textContent = gamepad.id;

                break;

            }

        }

    }

    /* =====================================
       INICIALIZAÇÃO
    ===================================== */

    updateElements();

    detectConnectedGamepad();

    if (navigator.getGamepads) {
        requestAnimationFrame(gamepadLoop);
    }

})();
