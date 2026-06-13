// ============================================================
// INTERAKSI
// ============================================================

function clickPlot(i) {
    const p = S.plots[i];
    if (p.state === 'grass') {
        p.state = 'empty';
        addXP(1);
        pop(i, '+1 XP');
        toast('🌿 Rumput dibersihkan'); playSound('pop');
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
        S.totalPlanted++;
        addXP(5);
        updateQuest('plant', 1);
        pop(i, `+5 XP`);
        toast(`🌱 ${c.name} ditanam!`); playSound('pop');
    }
    else if (p.state === 'ready') {
        const c = CROPS[p.crop];
        let reward = c.reward;
        if (S.boosters.coin > Date.now()) reward *= 2;
        S.inventory[p.crop]++;
        if (p.crop === 'pumpkin') S.pumpkinHarvest = (S.pumpkinHarvest||0) + 1;
        S.totalHarvest++;
        addXP(c.xp);
        p.state = 'empty'; p.crop = null;
        updateQuest('harvest', 1);
        pop(i, `+${c.emoji}`);
        toast(`🧺 Panen ${c.name}! +${c.xp} XP`); playSound('coin');
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
    playSound('levelup'); toast(`⚡ ${type==='growth'?'Growth':'Coin'} Booster aktif 5 menit!`, 'success');
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
    
    // Calculate prestige bonus (+1% per prestige)
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
// XP & LEVEL
// ============================================================

function addXP(n) {
    S.xp += n;
    const needed = S.level * 100;
    if (S.xp >= needed) {
        S.xp -= needed;
        S.level++;
        playSound('levelup'); toast(`🎉 LEVEL UP! Lv ${S.level}`, 'success');
        checkAchievements();
    }
}

// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {
    // Cek tanaman matang
    let changed = false;
    S.plots.forEach(p => {
        if (p.state === 'growing') {
            const elapsed = Date.now() - p.plantedAt;
            if (elapsed >= p.growTime) {
                p.state = 'ready';
                changed = true;
            }
        }
    });
    
    // Cek cuaca
    if (Date.now() - S.weatherChangedAt >= WEATHER_INTERVAL) {
        S.weather = Math.floor(Math.random() * WEATHERS.length);
        S.weatherChangedAt = Date.now();
        toast(`${WEATHERS[S.weather].icon} Cuaca: ${WEATHERS[S.weather].name}`, 'info');
    }
    
    renderGrid();
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
        { type:'harvest', desc:'Panen {n} tanaman', targets:[10,25,50], rewards:[100,250,500] },
        { type:'plant',   desc:'Tanam {n} bibit',   targets:[20,40,80], rewards:[150,300,600] },
        { type:'earn',    desc:'Kumpulkan {n}💰',   targets:[500,1500,5000], rewards:[250,500,1500] }
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
        // MYSTERY BOX
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

function saveGame(manual=false) {
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
        if (saved) {
            const data = JSON.parse(saved);
            S = { ...S, ...data };
            // Idle calculation: cek tanaman yang sudah matang saat offline
            S.plots.forEach(p => {
                if (p.state === 'growing' && Date.now() - p.plantedAt >= p.growTime) {
                    p.state = 'ready';
                }
            });
            return true;
        }
    } catch (e) {
        console.error('Load failed:', e);
    }
    return false;
}
