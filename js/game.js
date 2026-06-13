// ============================================================
// INTERAKSI
// ============================================================

function clickPlot(i) {
    const p = S.plots[i];
    if (p.state === 'grass') {
        p.state = 'empty';
        addXP(1);
        spawnParticles(i, '+1 XP');
        toast('🌿 Rumput dibersihkan', 'info'); playSound('pop');
    }
    else if (p.state === 'empty') {
        if ((S.seeds[selectedCrop] || 0) <= 0) { playSound('error'); toast(`Bibit ${CROPS[selectedCrop].name} habis! Beli di shop.`, 'warn'); return; }
        const c = CROPS[selectedCrop];
        S.seeds[selectedCrop]--;
        p.state = 'growing';
        p.crop = selectedCrop;
        p.plantedAt = Date.now();
        let growTime = c.time;
        if (S.boosters.growth > Date.now()) growTime *= 0.67;
        p.growTime = growTime;
        p.watered = false;
        S.totalPlanted++;
        addXP(5);
        updateQuest('plant', 1);
        spawnParticles(i, `+5 XP`);
        toast(`🌱 ${c.name} ditanam!`); playSound('pop');
    }
    else if (p.state === 'growing' && !p.watered) {
        // WATERING: Percepat waktu tumbuh 50%
        p.watered = true;
        const elapsed = Date.now() - p.plantedAt;
        const remaining = p.growTime - elapsed;
        p.growTime -= Math.floor(remaining / 2);
        playSound('water');
        spawnParticles(i, '💧');
        toast('💧 Tanaman disiram! Waktu panen dipercepat.');
    }
    else if (p.state === 'ready') {
        // CAPACITY CHECK
        const currentCap = S.inventoryCapacity || 50;
        if (getInventoryTotal() >= currentCap) {
            playSound('error');
            toast('⚠️ Gudang Penuh! Tingkatkan kapasitas Silo Anda.');
            return;
        }

        const c = CROPS[p.crop];
        let reward = c.reward;
        if (S.boosters.coin > Date.now()) reward *= 2;
        S.inventory[p.crop] = (S.inventory[p.crop] || 0) + 1;
        if (p.crop === 'pumpkin') S.pumpkinHarvest = (S.pumpkinHarvest || 0) + 1;
        S.totalHarvest++;
        addXP(c.xp);
        p.state = 'empty'; p.crop = null; p.watered = false;
        updateQuest('harvest', 1);
        spawnParticles(i, `+${c.emoji}`, `+${c.xp} XP`, '💰');
        toast(`🧺 Panen ${c.name}! +${c.xp} XP`, 'success'); playSound('coin');
        checkAchievements();
    }
    render();
}

function buySeed(key) {
    const c = CROPS[key];
    if (S.level < c.minLv) { playSound('error'); toast(`Butuh Level ${c.minLv}!`, 'warn'); return; }
    if (S.coins < c.cost) { playSound('error'); toast('💰 Koin tidak cukup!', 'warn'); return; }
    S.coins -= c.cost;
    S.seeds[key] = (S.seeds[key] || 0) + 1;
    playSound('pop'); toast(`🌱 Beli ${c.name}!`);
    render();
}

function buyBooster(type) {
    const cost = type === 'growth' ? 50 : 100;
    if (S.coins < cost) { playSound('error'); toast('💰 Koin tidak cukup!', 'warn'); return; }
    S.coins -= cost;
    S.boosters[type] = Date.now() + 5 * 60 * 1000;
    playSound('levelup'); toast(`⚡ ${type === 'growth' ? 'Growth' : 'Coin'} Booster aktif 5 menit!`, 'success');
    render();
}

function sellAll() {
    let baseTotal = 0;
    for (const [k, qty] of Object.entries(S.inventory)) {
        if (qty > 0) {
            baseTotal += qty * CROPS[k].reward;
            updateQuest('earn', qty * CROPS[k].reward);
            S.inventory[k] = 0;
        }
    }
    if (baseTotal === 0) { playSound('error'); toast('Tidak ada yang dijual.', 'warn'); return; }

    let bonus = 0;
    if (S.prestige && S.prestige > 0) {
        bonus = Math.floor(baseTotal * (S.prestige * 0.01));
    }
    let total = baseTotal + bonus;

    S.coins += total;
    S.totalEarned += total;
    playSound('coin');
    if (bonus > 0) {
        toast(`💰 Terjual! +${total} (Termasuk +${bonus} Bonus Prestige)`, 'success');
    } else {
        toast(`💰 Terjual! +${total} koin`, 'success');
    }
    checkAchievements();
    render();
}

function buyDecoration(key) {
    const d = DECORATIONS[key];
    if (S.level < 5) { playSound('error'); toast('Butuh Level 5!', 'warn'); return; }
    if (S.coins < d.cost) { playSound('error'); toast('💰 Koin tidak cukup!', 'warn'); return; }

    S.coins -= d.cost;
    S.prestige = (S.prestige || 0) + d.prestige;
    S.decorations.push(key);
    playSound('levelup');
    toast(`🏡 Beli ${d.name}! +${d.prestige} Prestige`, 'success');
    render();
}

// ============================================================
// ANIMALS
// ============================================================

function buyAnimal(key) {
    const a = ANIMALS[key];
    if (S.level < a.minLv) {
        playSound('error');
        toast(`⚠️ Level ${a.minLv} dibutuhkan!`);
        return;
    }
    if (a.cost >= 1000) {
        if (!confirm(`Beli ${a.name} seharga ${a.cost}💰?`)) return;
    }
    if (S.coins < a.cost) { playSound('error'); toast('💰 Koin tidak cukup!', 'warn'); return; }

    S.coins -= a.cost;
    S.lastAnimalId = (S.lastAnimalId || 0) + 1;

    let x, y, attempts = 0;
    do {
        x = 10 + Math.random() * 80;
        y = 30 + Math.random() * 40;
        attempts++;
    } while (isPositionOccupied(x, y) && attempts < 10);

    S.animals.push({
        id: S.lastAnimalId,
        type: key,
        x: x,
        y: y,
        flip: Math.random() > 0.5,
        nextMoveAt: Date.now() + 2000,
        nextProduceAt: Date.now() + a.time,
        readyToCollect: false
    });

    addXP(15);
    playSound('levelup');
    toast(`🎉 Membeli ${a.name}!`, 'success');
    saveGame();
    render();
}

function isPositionOccupied(x, y) {
    if (!S.animals) return false;
    return S.animals.some(a => {
        const dx = a.x - x;
        const dy = a.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 15;
    });
}

function upgradeSilo() {
    const currentCap = S.inventoryCapacity || 50;
    const upgradeCost = currentCap * 10;
    if (S.coins >= upgradeCost) {
        S.coins -= upgradeCost;
        S.inventoryCapacity = currentCap + 50;
        playSound('levelup');
        toast(`📦 Silo di-upgrade! Kapasitas: ${S.inventoryCapacity}`);
        saveGame();
        render();
    } else {
        playSound('error');
        toast('💰 Koin tidak cukup untuk upgrade Silo!');
    }
}

function collectAnimalProduct(id) {
    const a = S.animals.find(x => x.id === id);
    if (!a || !a.readyToCollect) return;

    const currentCap = S.inventoryCapacity || 50;
    if (getInventoryTotal() >= currentCap) {
        playSound('error');
        toast('⚠️ Gudang Penuh! Tingkatkan kapasitas Silo Anda.');
        return;
    }

    const conf = ANIMALS[a.type];
    S.coins += conf.reward;
    S.totalEarned += conf.reward;
    addXP(10);
    a.readyToCollect = false;
    a.nextProduceAt = Date.now() + conf.time;

    playSound('coin');
    toast(`Mendapat ${conf.productEmoji} ${conf.product}! +${conf.reward}💰`, 'success');
    render();
}

// ============================================================
// XP & LEVEL
// ============================================================

function addXP(n) {
    S.xp += n;
    const needed = S.level * 100;
    while (S.xp >= needed) {
        S.xp -= needed;
        S.level++;
        playSound('levelup');
        toast(`🎉 LEVEL UP! Lv ${S.level}`, 'success');
        checkAchievements();
    }
}

function getInventoryTotal() {
    if (!S.inventory) return 0;
    return Object.values(S.inventory).reduce((a, b) => a + b, 0);
}

// ============================================================
// FISHING MINI-GAME
// ============================================================
let fishActive = false;
let fishTimer = 0;

function spawnFish() {
    fishTimer++;
    if (fishTimer >= 10) {
        fishTimer = 0;
        if (!fishActive && Math.random() < 0.1) {
            fishActive = true;
            const splash = document.getElementById('fish-splash');
            if (splash) {
                splash.textContent = Math.random() > 0.5 ? '🐟' : '💦';
                splash.style.display = 'block';
                splash.style.left = (20 + Math.random() * 60) + '%';
                splash.style.top = (20 + Math.random() * 60) + '%';
                setTimeout(() => {
                    if (fishActive) {
                        fishActive = false;
                        splash.style.display = 'none';
                    }
                }, 3000);
            }
        }
    }
}

function catchFish() {
    if (fishActive) {
        fishActive = false;
        const splash = document.getElementById('fish-splash');
        if (splash) splash.style.display = 'none';

        const currentCap = S.inventoryCapacity || 50;
        if (getInventoryTotal() >= currentCap) {
            playSound('error');
            toast('⚠️ Gudang Penuh!');
            return;
        }

        const fishReward = 15 + Math.floor(Math.random() * 20);
        S.coins += fishReward;
        S.totalEarned += fishReward;
        addXP(10);
        playSound('coin');
        toast(`🎣 Tangkapan! +${fishReward} Koin`, 'success');
        saveGame();
        render();
    } else {
        toast('🌊 Tidak ada ikan... tunggu cipratan air!', 'info');
    }
}

// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {
    let changed = false;

    // 1. Cek tanaman matang
    S.plots.forEach(p => {
        if (p.state === 'growing') {
            const elapsed = Date.now() - p.plantedAt;
            if (elapsed >= p.growTime) {
                p.state = 'ready';
                changed = true;
            }
        }
    });

    // 2. Cek cuaca
    if (Date.now() - S.weatherChangedAt >= WEATHER_INTERVAL) {
        S.weather = Math.floor(Math.random() * WEATHERS.length);
        S.weatherChangedAt = Date.now();
        toast(`${WEATHERS[S.weather].icon} Cuaca: ${WEATHERS[S.weather].name}`, 'info');

        document.body.className = document.body.className.replace(/weather-\w+/g, '');
        if (WEATHERS[S.weather].name === 'Hujan') document.body.classList.add('weather-rain');
        if (WEATHERS[S.weather].name === 'Badai') document.body.classList.add('weather-storm');
    }

    // 3. Animal wandering & production
    if (S.animals && S.animals.length > 0) {
        let animalChanged = false;
        S.animals.forEach(a => {
            // Production check
            if (!a.readyToCollect && Date.now() >= a.nextProduceAt) {
                a.readyToCollect = true;
                animalChanged = true;
            }
            // Movement
            if (!a.nextMoveAt) a.nextMoveAt = Date.now() + 2000;
            if (Date.now() >= a.nextMoveAt) {
                const nx = Math.max(5, Math.min(90, a.x + (Math.random() - 0.5) * 20));
                const ny = Math.max(25, Math.min(75, a.y + (Math.random() - 0.5) * 20));
                a.flip = nx < a.x;
                a.x = nx;
                a.y = ny;
                a.nextMoveAt = Date.now() + 2000 + Math.random() * 3000;
                animalChanged = true;
            }
        });
        if (animalChanged) renderWanderingAnimals();
    }

    // 4. Gnome auto-farmer
    processGnome();

    // 5. Fishing
    spawnFish();

    // 6. Order regeneration
    if (!S.orders || S.orders.length === 0) {
        S.orders = [generateOrder(), generateOrder(), generateOrder()];
        renderOrders();
    }

    // 7. Render updates
    if (changed) renderGrid();
    updateTopbar();
    updateBoosters();
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
        if (!S.achievements.includes(a.id) && a.check(S)) {
            S.achievements.push(a.id);
            S.coins += a.reward;
            playSound('levelup'); toast(`🏆 Achievement: ${a.name}! +${a.reward}💰`, 'success');
        }
    });
}

// ============================================================
// QUESTS
// ============================================================

function generateQuests() {
    const templates = [
        { type: 'harvest', desc: 'Panen {n} tanaman', targets: [10, 25, 50], rewards: [100, 250, 500] },
        { type: 'plant', desc: 'Tanam {n} bibit', targets: [20, 40, 80], rewards: [150, 300, 600] },
        { type: 'earn', desc: 'Kumpulkan {n}💰', targets: [500, 1500, 5000], rewards: [250, 500, 1500] }
    ];
    S.quests = [];
    for (let i = 0; i < 3; i++) {
        const t = templates[Math.floor(Math.random() * templates.length)];
        const diff = Math.floor(Math.random() * t.targets.length);
        S.quests.push({
            type: t.type,
            desc: t.desc.replace('{n}', t.targets[diff]),
            target: t.targets[diff],
            reward: t.rewards[diff],
            progress: 0,
            done: false
        });
    }
}

function updateQuest(type, amount) {
    S.quests.forEach(q => {
        if (q.type === type && !q.done) {
            q.progress = Math.min(q.target, q.progress + amount);
            if (q.progress >= q.target) {
                q.done = true;
                S.coins += q.reward;
                S.questsDone++;
                playSound('coin'); toast(`📋 Quest selesai! +${q.reward}💰`, 'success');
                checkAchievements();
            }
        }
    });
    renderQuests();
}

// ============================================================
// DAILY REWARD
// ============================================================

function claimDaily() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (S.lastDaily && now - S.lastDaily < dayMs) {
        const remaining = dayMs - (now - S.lastDaily);
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        playSound('error'); toast(`⏰ Tunggu ${h}j ${m}m lagi!`, 'warn');
        return;
    }
    if (S.lastDaily && now - S.lastDaily < 2 * dayMs) {
        S.loginStreak++;
    } else {
        S.loginStreak = 1;
    }
    const dayIdx = Math.min(S.loginStreak - 1, DAILY_REWARDS.length - 1);
    S.lastDaily = now;

    if (dayIdx === 6) {
        playSound('levelup');
        const rand = Math.random();
        if (rand < 0.4) {
            S.coins += 2500;
            toast(`🎁 Mystery Box! Mendapat 2500💰!`, 'success');
        } else if (rand < 0.8) {
            S.seeds['pumpkin'] = (S.seeds['pumpkin'] || 0) + 3;
            toast(`🎁 Mystery Box! Mendapat 3x 🎃 Pumpkin Seeds!`, 'success');
        } else {
            S.boosters.coin = Date.now() + 15 * 60 * 1000;
            toast(`🎁 Mystery Box! Coin Booster Aktif 15 Menit!`, 'success');
        }
    } else {
        const reward = DAILY_REWARDS[dayIdx];
        S.coins += reward;
        playSound('coin');
        toast(`🎁 Daily Day ${S.loginStreak}! +${reward}💰`, 'success');
    }

    checkAchievements();
    render();
}

// ============================================================
// SAVE / LOAD
// ============================================================

function saveGame(manual = false) {
    try {
        S.lastSave = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(S));
        if (manual) toast('💾 Progress tersimpan!', 'success');
    } catch (e) {
        toast('⚠️ Gagal menyimpan!', 'warn');
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return false;

        const data = JSON.parse(saved);

        // Basic validation
        if (typeof data.coins !== 'number' || data.coins < 0) return false;
        if (!Array.isArray(data.plots) || data.plots.length !== GRID_SIZE) return false;

        S = { ...S, ...data };

        // Backward compatibility
        if (!S.animals) S.animals = [];
        if (!S.orders) S.orders = [];
        if (!S.decorations) S.decorations = [];
        if (!S.achievements) S.achievements = [];
        if (S.inventoryCapacity === undefined) S.inventoryCapacity = 50;

        // Idle calculation: mature crops that should have finished
        S.plots.forEach(p => {
            if (p.state === 'growing' && Date.now() - p.plantedAt >= p.growTime) {
                p.state = 'ready';
            }
        });

        // Idle calculation: animals that should have produced
        if (S.animals) {
            S.animals.forEach(a => {
                if (!a.readyToCollect && Date.now() >= a.nextProduceAt) {
                    a.readyToCollect = true;
                }
                if (!a.nextMoveAt) a.nextMoveAt = Date.now() + 2000;
            });
        }

        return true;
    } catch (e) {
        console.error('Load failed:', e);
    }
    return false;
}

// ============================================================
// ORDERS
// ============================================================

function generateOrder() {
    const crops = Object.keys(CROPS).filter(k => S.level >= CROPS[k].minLv);
    const crop = crops[Math.floor(Math.random() * crops.length)] || 'carrot';
    const qty = Math.floor(Math.random() * 5) + 3 + Math.floor(S.level / 2);
    const rewardCoins = CROPS[crop].reward * qty * 2.5;
    const rewardXP = CROPS[crop].xp * qty * 1.5;

    return {
        id: Date.now() + Math.random(),
        crop: crop,
        qty: qty,
        rewardCoins: Math.floor(rewardCoins),
        rewardXP: Math.floor(rewardXP)
    };
}

function fulfillOrder(id) {
    const idx = S.orders.findIndex(x => x.id === id);
    if (idx === -1) return;
    const o = S.orders[idx];
    if ((S.inventory[o.crop] || 0) >= o.qty) {
        S.inventory[o.crop] -= o.qty;
        S.coins += o.rewardCoins;
        S.totalEarned += o.rewardCoins;
        addXP(o.rewardXP);
        playSound('coin');

        S.orders.splice(idx, 1);
        S.orders.push(generateOrder());

        toast('✅ Pesanan selesai! 🎉', 'success');
        render();
    } else {
        playSound('error');
        toast('Bahan belum cukup!', 'warn');
    }
}

// ============================================================
// GNOME AUTO-FARMER
// ============================================================

function processGnome() {
    if (!S.gnomeOwned || !S.gnomeActive) return;

    // 1. KURCACI PETANI — Harvest ready plots directly (no re-render loop)
    for (let i = 0; i < S.plots.length; i++) {
        const p = S.plots[i];
        if (p.state === 'ready') {
            const currentCap = S.inventoryCapacity || 50;
            if (getInventoryTotal() >= currentCap) break;

            const c = CROPS[p.crop];
            S.inventory[p.crop] = (S.inventory[p.crop] || 0) + 1;
            if (p.crop === 'pumpkin') S.pumpkinHarvest = (S.pumpkinHarvest || 0) + 1;
            S.totalHarvest++;
            addXP(c.xp);
            p.state = 'empty'; p.crop = null; p.watered = false;
            updateQuest('harvest', 1);
            break;
        }
    }

    // 2. KURCACI PETANI — Plant random seeds on empty plots
    const availableSeeds = Object.keys(S.seeds).filter(k => S.seeds[k] > 0 && S.level >= CROPS[k].minLv);
    if (availableSeeds.length > 0) {
        for (let i = 0; i < S.plots.length; i++) {
            const p = S.plots[i];
            if (p.state === 'empty') {
                const randomCrop = availableSeeds[Math.floor(Math.random() * availableSeeds.length)];
                const c = CROPS[randomCrop];
                S.seeds[randomCrop]--;
                p.state = 'growing';
                p.crop = randomCrop;
                p.plantedAt = Date.now();
                let growTime = c.time;
                if (S.boosters.growth > Date.now()) growTime *= 0.67;
                p.growTime = growTime;
                p.watered = false;
                S.totalPlanted++;
                addXP(2);
                break;
            }
        }
    }

    // 3. KURCACI PETERNAK — Collect animal products
    if (S.animals) {
        for (const a of S.animals) {
            if (a.readyToCollect) {
                const currentCap = S.inventoryCapacity || 50;
                if (getInventoryTotal() >= currentCap) break;

                const conf = ANIMALS[a.type];
                S.coins += conf.reward;
                S.totalEarned += conf.reward;
                addXP(5);
                a.readyToCollect = false;
                a.nextProduceAt = Date.now() + conf.time;
                break;
            }
        }
    }

    // 4. KURCACI KURIR — Fulfill orders
    if (S.orders) {
        for (const o of S.orders) {
            if ((S.inventory[o.crop] || 0) >= o.qty) {
                fulfillOrder(o.id);
                break;
            }
        }
    }
}
