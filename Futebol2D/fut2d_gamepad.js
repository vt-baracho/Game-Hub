/* =====================================================
   CHUTEIRA KI - SISTEMA DE GAMEPAD
   Suporte para até 4 controles simultâneos
   ===================================================== */

(() => {
    'use strict';

    const DEADZONE = 0.25;
    const NAV_DELAY = 180;

    let connectedPads = {};
    let previousButtons = {};
    let previousAxes = {};
    let navCooldown = 0;
    let selectedElement = null;
    let lastFrame = performance.now();

    // Botões padrão da Gamepad API
    const BUTTONS = {
        A: 0,
        B: 1,
        X: 2,
        Y: 3,
        LB: 4,
        RB: 5,
        BACK: 8,
        START: 9,
        DPAD_UP: 12,
        DPAD_DOWN: 13,
        DPAD_LEFT: 14,
        DPAD_RIGHT: 15
    };

    // Cada controle representa um jogador.
    // Os comandos são associados às teclas já configuradas no jogo.
    const PLAYER_ACTIONS = {
        up: 'u',
        down: 'd',
        left: 'l',
        right: 'r',
        pass: 'a',
        longPass: 'b',
        shoot: 'c',
        special: 'e',
        dribble: 'f'
    };

    function getPads() {
        return Array.from(navigator.getGamepads?.() || [])
            .filter(Boolean);
    }

    function buttonPressed(pad, index) {
        return !!pad.buttons[index]?.pressed;
    }

    function axisValue(pad, index) {
        const value = pad.axes[index] || 0;
        return Math.abs(value) > DEADZONE ? value : 0;
    }

    function justPressed(pad, index) {
        const id = pad.index;

        if (!previousButtons[id]) {
            previousButtons[id] = {};
        }

        const current = buttonPressed(pad, index);
        const previous = previousButtons[id][index] || false;

        previousButtons[id][index] = current;

        return current && !previous;
    }

    function getPlayerKeys(playerIndex) {
        if (!S.keys[playerIndex]) return null;
        return S.keys[playerIndex];
    }

    // Converte os comandos do controle nas teclas do jogo.
    function setPlayerKey(playerIndex, action, pressed) {
        const keys = getPlayerKeys(playerIndex);
        if (!keys) return;

        const code = keys[PLAYER_ACTIONS[action]];
        if (!code) return;

        if (pressed) {
            K[code] = true;
        } else {
            delete K[code];
        }
    }

    function pressPlayerAction(playerIndex, action) {
        const keys = getPlayerKeys(playerIndex);
        if (!keys) return;

        const code = keys[PLAYER_ACTIONS[action]];
        if (!code) return;

        PR[code] = true;
    }

    // Direções do controle
    function updateMovement(pad, playerIndex) {
        const x = axisValue(pad, 0);
        const y = axisValue(pad, 1);

        const up = y < -DEADZONE || buttonPressed(pad, BUTTONS.DPAD_UP);
        const down = y > DEADZONE || buttonPressed(pad, BUTTONS.DPAD_DOWN);
        const left = x < -DEADZONE || buttonPressed(pad, BUTTONS.DPAD_LEFT);
        const right = x > DEADZONE || buttonPressed(pad, BUTTONS.DPAD_RIGHT);

        setPlayerKey(playerIndex, 'up', up);
        setPlayerKey(playerIndex, 'down', down);
        setPlayerKey(playerIndex, 'left', left);
        setPlayerKey(playerIndex, 'right', right);
    }

    // Ações durante a partida
    function updateGameplay(pad, playerIndex) {
        updateMovement(pad, playerIndex);

        if (justPressed(pad, BUTTONS.A)) {
            pressPlayerAction(playerIndex, 'pass');
        }

        if (justPressed(pad, BUTTONS.B)) {
            pressPlayerAction(playerIndex, 'longPass');
        }

        if (justPressed(pad, BUTTONS.X)) {
            pressPlayerAction(playerIndex, 'shoot');
        }

        if (justPressed(pad, BUTTONS.Y)) {
            pressPlayerAction(playerIndex, 'special');
        }

        if (justPressed(pad, BUTTONS.RB)) {
            pressPlayerAction(playerIndex, 'dribble');
        }

        // Start pausa a partida
        if (justPressed(pad, BUTTONS.START)) {
            if (st === 'play') {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        code: 'Escape',
                        key: 'Escape',
                        bubbles: true
                    })
                );

                window.dispatchEvent(
                    new KeyboardEvent('keyup', {
                        code: 'Escape',
                        key: 'Escape',
                        bubbles: true
                    })
                );
            }
        }
    }

    // Elementos navegáveis dos menus
    function getMenuElements() {
        const panel = document.getElementById('pn');
        if (!panel) return [];

        return Array.from(
            panel.querySelectorAll(
                'button, select, input:not([type="file"]), a, [tabindex="0"]'
            )
        ).filter(el => {
            return !el.disabled &&
                el.offsetParent !== null &&
                el.type !== 'hidden';
        });
    }

    function updateSelection() {
        const elements = getMenuElements();

        if (!elements.length) {
            selectedElement = null;
            return;
        }

        if (!selectedElement || !elements.includes(selectedElement)) {
            selectedElement = elements[0];
        }

        elements.forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
            el.style.boxShadow = '';
        });

        if (selectedElement) {
            selectedElement.style.outline = '3px solid #37d6ff';
            selectedElement.style.outlineOffset = '3px';
            selectedElement.style.boxShadow = '0 0 15px #37d6ff99';
            selectedElement.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    function navigateMenu(direction) {
        const elements = getMenuElements();
        if (!elements.length) return;

        if (!selectedElement || !elements.includes(selectedElement)) {
            selectedElement = elements[0];
        }

        let index = elements.indexOf(selectedElement);

        if (direction === 'up') {
            index--;
        } else if (direction === 'down') {
            index++;
        } else if (direction === 'left' || direction === 'right') {
            const el = selectedElement;

            if (el.tagName === 'SELECT') {
                const amount = direction === 'right' ? 1 : -1;
                el.selectedIndex = Math.max(
                    0,
                    Math.min(el.options.length - 1, el.selectedIndex + amount)
                );

                el.dispatchEvent(new Event('change', { bubbles: true }));
                return;
            }

            if (el.type === 'range') {
                const amount = direction === 'right' ? 1 : -1;
                el.value = Math.max(
                    Number(el.min),
                    Math.min(Number(el.max), Number(el.value) + amount)
                );

                el.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }

            index += direction === 'right' ? 1 : -1;
        }

        index = Math.max(0, Math.min(elements.length - 1, index));

        selectedElement = elements[index];
        updateSelection();
    }

    function confirmMenu() {
        if (!selectedElement) {
            updateSelection();
        }

        if (!selectedElement) return;

        const el = selectedElement;

        if (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'range') {
            el.focus();
            return;
        }

        if (el.tagName === 'SELECT') {
            el.focus();
            return;
        }

        if (el.type === 'checkbox') {
            el.checked = !el.checked;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return;
        }

        el.click();
    }

    function goBack() {
        if (st === 'play') {
            window.dispatchEvent(
                new KeyboardEvent('keydown', {
                    code: 'Escape',
                    key: 'Escape',
                    bubbles: true
                })
            );

            window.dispatchEvent(
                new KeyboardEvent('keyup', {
                    code: 'Escape',
                    key: 'Escape',
                    bubbles: true
                })
            );

            return;
        }

        if (curScr === 'main') return;

        if (curScr === 'pause') {
            menu();
            return;
        }

        if (curScr === 'cfg') {
            screen(back);
            return;
        }

        screen('main');
    }

    // Navegação nos menus
    function updateMenu(pad) {
        const x = axisValue(pad, 0);
        const y = axisValue(pad, 1);

        const up = y < -DEADZONE || buttonPressed(pad, BUTTONS.DPAD_UP);
        const down = y > DEADZONE || buttonPressed(pad, BUTTONS.DPAD_DOWN);
        const left = x < -DEADZONE || buttonPressed(pad, BUTTONS.DPAD_LEFT);
        const right = x > DEADZONE || buttonPressed(pad, BUTTONS.DPAD_RIGHT);

        const now = performance.now();

        if (now > navCooldown) {
            if (up) {
                navigateMenu('up');
                navCooldown = now + NAV_DELAY;
            } else if (down) {
                navigateMenu('down');
                navCooldown = now + NAV_DELAY;
            } else if (left) {
                navigateMenu('left');
                navCooldown = now + NAV_DELAY;
            } else if (right) {
                navigateMenu('right');
                navCooldown = now + NAV_DELAY;
            }
        }

        if (justPressed(pad, BUTTONS.A)) {
            confirmMenu();
        }

        if (justPressed(pad, BUTTONS.B)) {
            goBack();
        }

        if (justPressed(pad, BUTTONS.START)) {
            confirmMenu();
        }
    }

    // Indicador de conexão
    function createStatus() {
        if (document.getElementById('gamepad-status')) return;

        const status = document.createElement('div');
        status.id = 'gamepad-status';

        status.style.cssText = `
            position:fixed;
            right:12px;
            bottom:12px;
            z-index:99999;
            padding:8px 13px;
            background:#000c;
            border:1px solid #ffd23f;
            border-radius:8px;
            color:white;
            font:12px Arial,sans-serif;
            pointer-events:none;
            opacity:.85;
        `;

        status.textContent = '🎮 Controle desconectado';

        document.body.appendChild(status);
    }

    function updateStatus(pads) {
        const status = document.getElementById('gamepad-status');
        if (!status) return;

        if (!pads.length) {
            status.textContent = '🎮 Controle desconectado';
            status.style.borderColor = '#e63946';
        } else {
            status.textContent = `🎮 ${pads.length} controle(s) conectado(s)`;
            status.style.borderColor = '#37d6ff';
        }
    }

    // Conexão e desconexão
    window.addEventListener('gamepadconnected', e => {
        connectedPads[e.gamepad.index] = true;
        console.log('Gamepad conectado:', e.gamepad.id);
        updateStatus(getPads());
    });

    window.addEventListener('gamepaddisconnected', e => {
        delete connectedPads[e.gamepad.index];
        delete previousButtons[e.gamepad.index];

        // Libera todas as teclas do jogador desconectado
        const keys = S.keys[e.gamepad.index];

        if (keys) {
            Object.values(keys).forEach(code => {
                delete K[code];
            });
        }

        console.log('Gamepad desconectado:', e.gamepad.id);
        updateStatus(getPads());
    });

    // Loop independente do jogo
    function gamepadLoop() {
        const pads = getPads();

        updateStatus(pads);

        if (st === 'play') {
            pads.forEach((pad, index) => {
                if (index > 3) return;
                updateGameplay(pad, index);
            });
        } else {
            // Libera movimentação dos jogadores fora da partida
            pads.forEach((pad, index) => {
                if (index > 3) return;

                const keys = S.keys[index];
                if (keys) {
                    Object.values(keys).forEach(code => delete K[code]);
                }
            });

            // Apenas o primeiro controle navega nos menus
            if (pads.length) {
                updateMenu(pads[0]);
                updateSelection();
            }
        }

        requestAnimationFrame(gamepadLoop);
    }

    // Inicialização
    function init() {
        createStatus();
        updateSelection();
        gamepadLoop();

        // Atualiza a seleção quando a tela do jogo é recriada
        const panel = document.getElementById('pn');

        if (panel) {
            new MutationObserver(() => {
                selectedElement = null;

                setTimeout(() => {
                    updateSelection();
                }, 30);
            }).observe(panel, {
                childList: true,
                subtree: true
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
