// LOL CD Tool Script

document.addEventListener('DOMContentLoaded', () => {
    const dataPath = './data.json';

    // Match timer elements
    const timeDisplay = document.getElementById('time-display');
    const startButton = document.getElementById('start-timer');
    let matchSeconds = 0;
    let matchInterval = null;

    function formatTime(s) {
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(Math.floor(s % 60)).padStart(2, '0');
        return `${mm}:${ss}`;
    }

    function startMatch() {
        if (matchInterval) return;
        matchInterval = setInterval(() => {
            matchSeconds += 1;
            if (timeDisplay) timeDisplay.textContent = formatTime(matchSeconds);
        }, 1000);
        if (startButton) startButton.textContent = 'Pause';
    }

    function pauseMatch() {
        if (!matchInterval) return;
        clearInterval(matchInterval);
        matchInterval = null;
        if (startButton) startButton.textContent = 'Start';
    }

    if (startButton) {
        startButton.addEventListener('click', () => {
            if (matchInterval) pauseMatch(); else startMatch();
        });
    }

    // Setting mode
    const settingButton = document.getElementById('setting');
    let isSettingMode = false;
    if (settingButton) {
        settingButton.addEventListener('click', () => {
            isSettingMode = !isSettingMode;
            settingButton.textContent = isSettingMode ? 'Done' : 'Setting';
            document.body.classList.toggle('setting-mode', isSettingMode);
        });
    }

    function setBrightness(el, on) {
        el.style.filter = on ? 'brightness(1)' : 'brightness(0.45)';
    }

    // state holders
    // maps slot element -> { intervalId, remaining, total, overlay, textEl }
    const cooldownIntervals = new WeakMap();
    const playerToInsightEnabled = new WeakMap(); // player element -> bool

    fetch(dataPath)
        .then(r => r.json())
        .then(data => {
            const spellPathMap = {};
            const spellCooldownMap = {};
            const spellsArray = [];
            (data.spells || []).forEach(s => {
                if (s.id) {
                    const key = s.id.toLowerCase();
                    spellPathMap[key] = s.path;
                    spellCooldownMap[key] = Number(s.cooldown) || 180;
                    spellsArray.push({ id: s.id, key, path: s.path, cooldown: Number(s.cooldown) || 180 });
                }
            });

            // items map
            const itemPathMap = {};
            const itemCooldownMap = {};
            (data.items || []).forEach(it => {
                if (it.id) {
                    const key = it.id.toLowerCase();
                    itemPathMap[key] = it.path;
                    itemCooldownMap[key] = Number(it.cooldown) || 120;
                }
            });

            const defaultSpells = {
                top: ['teleport', 'flash'],
                jungle: ['smite', 'flash'],
                middle: ['flash', 'ignite'],
                bottom: ['heal', 'flash'],
                support: ['exhaust', 'ignite']
            };

            const players = Array.from(document.querySelectorAll('.player'));

            // build modal (hidden) for spell selection
            let modalBackdrop = null;
            function createModal() {
                if (modalBackdrop) return modalBackdrop;
                modalBackdrop = document.createElement('div');
                modalBackdrop.className = 'modal-backdrop';
                modalBackdrop.style.display = 'none';

                const modal = document.createElement('div');
                modal.className = 'modal';
                const list = document.createElement('div');
                list.className = 'modal-list';

                spellsArray.forEach(sp => {
                    const it = document.createElement('div');
                    it.className = 'modal-item';
                    const img = document.createElement('img');
                    img.src = sp.path;
                    img.alt = sp.id;
                    const label = document.createElement('span');
                    label.textContent = sp.id;
                    it.appendChild(img);
                    it.appendChild(label);
                    it.addEventListener('click', () => {
                        modalBackdrop.dataset.selected = sp.key;
                        closeModal();
                    });
                    list.appendChild(it);
                });

                modal.appendChild(list);
                modalBackdrop.appendChild(modal);
                modalBackdrop.addEventListener('click', (e) => {
                    if (e.target === modalBackdrop) closeModal();
                });
                document.body.appendChild(modalBackdrop);
                return modalBackdrop;
            }

            function openSpellSelector(slot) {
                const mb = createModal();
                mb.style.display = 'flex';
                delete mb.dataset.selected;
                // wait for selection
                const observer = new MutationObserver(() => {
                    if (mb.dataset.selected) {
                        const chosen = mb.dataset.selected;
                        applySpellChoice(slot, chosen);
                        observer.disconnect();
                    }
                });
                observer.observe(mb, { attributes: true });
            }

            function closeModal() {
                if (!modalBackdrop) return;
                modalBackdrop.style.display = 'none';
            }

            function applySpellChoice(slot, chosenKey) {
                const img = slot.querySelector('img');
                const spellObj = spellsArray.find(s => s.key === chosenKey);
                if (!spellObj) return;
                img.src = spellObj.path;
                img.alt = spellObj.id;
                slot.dataset.spellId = chosenKey;
            }

            // apply cooldown UI to items as well
            players.forEach((player) => {
                const itemImgs = Array.from(player.querySelectorAll('.item img'));
                itemImgs.forEach(imgEl => {
                    const keyGuess = (imgEl.alt || '').toLowerCase();
                    const src = itemPathMap[keyGuess] || imgEl.src;
                    imgEl.src = src;

                    // wrap in item-slot
                    const slot = document.createElement('div');
                    slot.className = 'item-slot';
                    imgEl.parentNode.insertBefore(slot, imgEl);
                    slot.appendChild(imgEl);

                    const overlay = document.createElement('div');
                    overlay.className = 'cooldown-overlay';
                    overlay.style.display = 'none';
                    const text = document.createElement('div');
                    text.className = 'cooldown-text';
                    text.textContent = '';
                    overlay.appendChild(text);
                    slot.appendChild(overlay);

                    // store item id on slot if possible
                    slot.dataset.itemId = keyGuess;

                    slot.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        if (isSettingMode) return; // no selection UI for items
                        const key = slot.dataset.itemId || (imgEl.alt || '').toLowerCase();
                        let cd = itemCooldownMap[key] || 120;
                        if (cooldownIntervals.has(slot)) {
                            reduceCooldown(slot, 5);
                            return;
                        }
                        startCooldown(slot, overlay, text, cd);
                    });
                });
            });

            players.forEach((player, idx) => {
                const classes = Array.from(player.classList);
                let role = classes.find(c => ['top', 'jungle', 'middle', 'bottom', 'support'].includes(c));
                if (!role) {
                    const map = ['top', 'jungle', 'middle', 'bottom', 'support'];
                    role = map[idx] || 'top';
                }

                const spells = defaultSpells[role] || defaultSpells.top;
                const spellImgs = player.querySelectorAll('.spell img');

                // cosmic insight per-player setup: default disabled
                const insightImg = player.querySelector('.cosmic_insight > img');
                playerToInsightEnabled.set(player, false);
                if (insightImg) {
                    setBrightness(insightImg, false);
                    insightImg.addEventListener('click', () => {
                        const cur = playerToInsightEnabled.get(player) || false;
                        playerToInsightEnabled.set(player, !cur);
                        setBrightness(insightImg, !cur);
                    });
                }

                spellImgs.forEach((imgEl, i) => {
                    const spellId = (spells[i] || '').toLowerCase();
                    const src = spellPathMap[spellId] || imgEl.src;
                    imgEl.src = src;
                    imgEl.alt = spells[i] || '';

                    // store current spell id on slot later

                    // wrap img in slot container for overlay
                    const slot = document.createElement('div');
                    slot.className = 'spell-slot';
                    imgEl.parentNode.insertBefore(slot, imgEl);
                    slot.appendChild(imgEl);

                    const overlay = document.createElement('div');
                    overlay.className = 'cooldown-overlay';
                    overlay.style.display = 'none';
                    const text = document.createElement('div');
                    text.className = 'cooldown-text';
                    text.textContent = '';
                    overlay.appendChild(text);
                    slot.appendChild(overlay);

                    // attach current spell id to slot
                    slot.dataset.spellId = spellId || imgEl.alt.toLowerCase();

                    // click to start or reduce cooldown OR open selector in setting mode
                    slot.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        if (isSettingMode) {
                            openSpellSelector(slot);
                            return;
                        }

                        const key = slot.dataset.spellId || imgEl.alt.toLowerCase();
                        let cd = spellCooldownMap[key] || 180;
                        // check player's cosmic insight
                        const playerEl = slot.closest('.player');
                        const insightOn = playerToInsightEnabled.get(playerEl) || false;
                        if (insightOn) {
                            cd = cd * (100 / 118);
                        }

                        if (cooldownIntervals.has(slot)) {
                            // reduce remaining by 5 seconds
                            reduceCooldown(slot, 5);
                            return;
                        }
                        startCooldown(slot, overlay, text, cd);
                    });
                });
            });
            // (per-player insight handled above)

            // cooldown logic
            function startCooldown(slot, overlay, textEl, totalSeconds) {
                const info = {
                    remaining: totalSeconds,
                    total: totalSeconds,
                    overlay,
                    textEl,
                    intervalId: null
                };
                overlay.style.display = 'flex';
                setBrightness(slot.querySelector('img'), false);

                function tick() {
                    info.remaining -= 0.1; // 100ms steps
                    if (info.remaining < 0) info.remaining = 0;
                    const pct = info.remaining / info.total;
                    const deg = Math.max(0, pct) * 360;
                    // use very dark second color to avoid white artifacts in dark theme
                    overlay.style.background = `conic-gradient(rgba(0,0,0,0.8) ${deg}deg, rgba(0,0,0,0.06) ${deg}deg)`;
                    info.textEl.textContent = Math.ceil(info.remaining) + 's';
                    if (info.remaining <= 0) {
                        clearInterval(info.intervalId);
                        cooldownIntervals.delete(slot);
                        overlay.style.display = 'none';
                        setBrightness(slot.querySelector('img'), true);
                    }
                }

                tick();
                info.intervalId = setInterval(tick, 100);
                cooldownIntervals.set(slot, info);
            }

            function reduceCooldown(slot, seconds) {
                const info = cooldownIntervals.get(slot);
                if (!info) return;
                info.remaining -= seconds;
                if (info.remaining <= 0) {
                    clearInterval(info.intervalId);
                    cooldownIntervals.delete(slot);
                    info.overlay.style.display = 'none';
                    setBrightness(slot.querySelector('img'), true);
                } else {
                    // update visual immediately
                    const pct = info.remaining / info.total;
                    const deg = Math.max(0, pct) * 360;
                    info.overlay.style.background = `conic-gradient(rgba(0,0,0,0.8) ${deg}deg, rgba(0,0,0,0.06) ${deg}deg)`;
                    info.textEl.textContent = Math.ceil(info.remaining) + 's';
                }
            }

        })
        .catch(err => {
            console.error('Failed to load data.json:', err);
        });

});

