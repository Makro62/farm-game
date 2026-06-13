import os

game_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'js', 'game.js')
with open(game_path, 'r', encoding='utf-8') as f:
    game = f.read()

# 1. Update clickPlot
game = game.replace("toast('🌿 Rumput dibersihkan');", "toast('🌿 Rumput dibersihkan'); playSound('pop');")
game = game.replace("toast(`🌱 ${c.name} ditanam!`);", "toast(`🌱 ${c.name} ditanam!`); playSound('pop');")
game = game.replace("toast(`🧺 Panen ${c.name}! +${c.xp} XP`);", "toast(`🧺 Panen ${c.name}! +${c.xp} XP`); playSound('coin');")
game = game.replace("toast(`Bibit ${CROPS[selectedCrop].name} habis! Beli di shop.`, 'warn');", "playSound('error'); toast(`Bibit ${CROPS[selectedCrop].name} habis! Beli di shop.`, 'warn');")

# 2. Update buySeed
game = game.replace("if (S.level < c.minLv) { toast(`Butuh Level ${c.minLv}!`, 'warn'); return; }", "if (S.level < c.minLv) { playSound('error'); toast(`Butuh Level ${c.minLv}!`, 'warn'); return; }")
game = game.replace("if (S.coins < c.cost) { toast('💰 Koin tidak cukup!', 'warn'); return; }", "if (S.coins < c.cost) { playSound('error'); toast('💰 Koin tidak cukup!', 'warn'); return; }")
game = game.replace("toast(`🌱 Beli ${c.name}!`);", "playSound('pop'); toast(`🌱 Beli ${c.name}!`);")

# 3. Update buyBooster
game = game.replace("if (S.coins < cost) { toast('💰 Koin tidak cukup!', 'warn'); return; }", "if (S.coins < cost) { playSound('error'); toast('💰 Koin tidak cukup!', 'warn'); return; }")
game = game.replace("toast(`⚡ ${type==='growth'?'Growth':'Coin'} Booster aktif 5 menit!`, 'success');", "playSound('levelup'); toast(`⚡ ${type==='growth'?'Growth':'Coin'} Booster aktif 5 menit!`, 'success');")

# 4. Update sellAll
old_sell = """function sellAll() {
    let total = 0;
    for (const [k, qty] of Object.entries(S.inventory)) {
        if (qty > 0) {
            total += qty * CROPS[k].reward;
            updateQuest('earn', qty * CROPS[k].reward);
            S.inventory[k] = 0;
        }
    }
    if (total === 0) { toast('Tidak ada yang dijual.', 'warn'); return; }
    S.coins += total;
    S.totalEarned += total;
    toast(`💰 Terjual! +${total} koin`, 'success');
    checkAchievements();
    render();
}"""
new_sell = """function sellAll() {
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
}"""
game = game.replace(old_sell, new_sell)

# 5. Add buyDecoration function
buy_deco_func = """
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
"""
game = game.replace("// ============================================================\n// XP & LEVEL", buy_deco_func + "\n// ============================================================\n// XP & LEVEL")

# 6. Update addXP
game = game.replace("toast(`🎉 LEVEL UP! Lv ${S.level}`, 'success');", "playSound('levelup'); toast(`🎉 LEVEL UP! Lv ${S.level}`, 'success');")

# 7. Update updateQuest
game = game.replace("toast(`📋 Quest selesai! +${q.reward}💰`, 'success');", "playSound('coin'); toast(`📋 Quest selesai! +${q.reward}💰`, 'success');")

# 8. Update checkAchievements
game = game.replace("toast(`🏆 Achievement: ${a.name}! +${a.reward}💰`, 'success');", "playSound('levelup'); toast(`🏆 Achievement: ${a.name}! +${a.reward}💰`, 'success');")

# 9. Update claimDaily
old_claim = """    const dayIdx = Math.min(S.loginStreak - 1, DAILY_REWARDS.length - 1);
    const reward = DAILY_REWARDS[dayIdx];
    S.coins += reward;
    S.lastDaily = now;
    toast(`🎁 Daily Day ${S.loginStreak}! +${reward}💰`, 'success');
    checkAchievements();
    render();"""
new_claim = """    const dayIdx = Math.min(S.loginStreak - 1, DAILY_REWARDS.length - 1);
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
    render();"""
game = game.replace(old_claim, new_claim)
game = game.replace("toast(`⏰ Tunggu ${h}j ${m}m lagi!`, 'warn');", "playSound('error'); toast(`⏰ Tunggu ${h}j ${m}m lagi!`, 'warn');")

with open(game_path, 'w', encoding='utf-8') as f:
    f.write(game)

print("Updated game.js")
