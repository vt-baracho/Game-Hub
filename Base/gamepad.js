// ==========================================
// GAME HUB - GAMEPAD NAVIGATION SYSTEM
// ==========================================

(() => {

    let gamepadIndex = null;
    let selectedIndex = 0;
    let elements = [];

    let previousButtons = [];
    let axisCooldown = 0;
    let navigationCooldown = 0;

    const DEADZONE = 0.5;
    const COOLDOWN = 180;

    // Elementos que podem receber navegação
    const SELECTORS = [
        'a[href]',
        'button',
        'input:not([type="hidden"])',
        'select',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    // ==========================================
    // GAMEPAD CONNECTION
    // ==========================================

    window.addEventListener("gamepadconnected", (event) => {

        gamepadIndex = event.gamepad.index;

        console.log(
            "Gamepad conectado:",
            event.gamepad.id
        );

        updateElements();

        if (elements.length > 0) {
            selectElement(0);
        }

    });

    window.addEventListener("gamepaddisconnected", (event) => {

        if (gamepadIndex === event.gamepad.index) {
            gamepadIndex = null;
            removeSelection();
        }

        console.log("Gamepad desconectado");

    });

    // ==========================================
    // ELEMENT COLLECTION
    // ==========================================

    function updateElements() {

        elements = Array.from(
            document.querySelectorAll(SELECTORS)
        ).filter(element => {

            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);

            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                !element.disabled &&
                !element.closest('[hidden]')
            );

        });

    }

    // ==========================================
    // VISUAL SELECTION
    // ==========================================

    function removeSelection() {

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

        removeSelection();

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

    // ==========================================
    // NAVIGATION
    // ==========================================

    function navigate(direction) {

        updateElements();

        if (!elements.length) return;

        const current = elements[selectedIndex];

        if (!current) {
            selectElement(0);
            return;
        }

        const currentRect = current.getBoundingClientRect();

        const centerX = currentRect.left + currentRect.width / 2;
        const centerY = currentRect.top + currentRect.height / 2;

        let bestIndex = -1;
        let bestScore = Infinity;

        elements.forEach((element, index) => {

            if (index === selectedIndex) return;

            const rect = element.getBoundingClientRect();

            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            const dx = x - centerX;
            const dy = y - centerY;

            let valid = false;
            let score = Infinity;

            switch (direction) {

                case "up":
                    valid = dy < -5;
                    score = Math.abs(dy) + Math.abs(dx) * 2;
                    break;

                case "down":
                    valid = dy > 5;
                    score = Math.abs(dy) + Math.abs(dx) * 2;
                    break;

                case "left":
                    valid = dx < -5;
                    score = Math.abs(dx) + Math.abs(dy) * 2;
                    break;

                case "right":
                    valid = dx > 5;
                    score = Math.abs(dx) + Math.abs(dy) * 2;
                    break;

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

    // ==========================================
    // BUTTON ACTIONS
    // ==========================================

    function pressButton(button) {

        switch (button) {

            // A / X - SELECT
            case 0:

                if (elements[selectedIndex]) {
                    elements[selectedIndex].click();
                }

                break;

            // B / O - BACK
            case 1:

                if (
                    document.activeElement &&
                    (
                        document.activeElement.tagName === "INPUT" ||
                        document.activeElement.tagName === "SELECT"
                    )
                ) {

                    document.activeElement.blur();

                } else {

                    removeSelection();

                }

                break;

            // X / SQUARE - GAMES
            case 2:

                goToSection("games");

                break;

            // Y / TRIANGLE - HOME
            case 3:

                goToSection("home");

                break;

            // LB / L1
            case 4:

                selectElement(selectedIndex - 1);

                break;

            // RB / R1
            case 5:

                selectElement(selectedIndex + 1);

                break;

            // START
            case 9:

                goToSection("about");

                break;

        }

    }

    // ==========================================
    // PAGE SECTIONS
    // ==========================================

    function goToSection(id) {

        const section = document.getElementById(id);

        if (section) {

            section.scrollIntoView({
                behavior: "smooth"
            });

            setTimeout(() => {

                updateElements();

                const first = elements.findIndex(element =>
                    element.closest("#" + id)
                );

                if (first !== -1) {
                    selectElement(first);
                }

            }, 400);

        }

    }

    // ==========================================
    // GAMEPAD LOOP
    // ==========================================

    function gamepadLoop() {

        requestAnimationFrame(gamepadLoop);

        const gamepads = navigator.getGamepads();

        if (gamepadIndex === null) return;

        const gamepad = gamepads[gamepadIndex];

        if (!gamepad) return;

        // BUTTONS

        gamepad.buttons.forEach((button, index) => {

            const pressed = button.pressed;

            if (pressed && !previousButtons[index]) {

                pressButton(index);

            }

            previousButtons[index] = pressed;

        });

        // ANALOG STICK

        const x = gamepad.axes[0] || 0;
        const y = gamepad.axes[1] || 0;

        if (navigationCooldown > 0) {
            navigationCooldown--;
        }

        if (navigationCooldown === 0) {

            if (Math.abs(x) > DEADZONE) {

                navigate(x > 0 ? "right" : "left");

                navigationCooldown = COOLDOWN / 16;

            }

            else if (Math.abs(y) > DEADZONE) {

                navigate(y > 0 ? "down" : "up");

                navigationCooldown = COOLDOWN / 16;

            }

        }

        // D-PAD

        if (gamepad.buttons[12]?.pressed && !previousButtons[12]) {
            navigate("up");
        }

        if (gamepad.buttons[13]?.pressed && !previousButtons[13]) {
            navigate("down");
        }

        if (gamepad.buttons[14]?.pressed && !previousButtons[14]) {
            navigate("left");
        }

        if (gamepad.buttons[15]?.pressed && !previousButtons[15]) {
            navigate("right");
        }

    }

    // ==========================================
    // START SYSTEM
    // ==========================================

    if ("getGamepads" in navigator) {

        requestAnimationFrame(gamepadLoop);

    }

})();
