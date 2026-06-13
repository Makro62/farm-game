import os

ui_path = '/Users/jeremyvalentinsiahaan/Documents/Game/farm-game/js/ui.js'
with open(ui_path, 'r') as f:
    content = f.read()

# Modify render()
old_render = """function render() {
    renderShop();
    renderCropList();
    renderGrid();
    renderInventory();
    renderQuests();
    updateTopbar();
    document.getElementById('achieve-count').textContent = `${S.achievements.length} / ${ACHIEVEMENTS.length}`;
}"""
new_render = """function render() {
    renderShop();
    renderCropList();
    renderGrid();
    renderInventory();
    renderQuests();
    updateTopbar();
    updateBoosters();
    document.getElementById('achieve-count').textContent = `${S.achievements.length} / ${ACHIEVEMENTS.length}`;
}"""

content = content.replace(old_render, new_render)

# Append updateBoosters
booster_func = """
function updateBoosters() {
    const now = Date.now();
    const gBtn = document.getElementById('btn-boost-growth');
    if (gBtn) {
        if (S.boosters.growth > now) {
            const rem = Math.ceil((S.boosters.growth - now)/1000);
            gBtn.innerHTML = `⚡ Growth (${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')})`;
            gBtn.style.background = 'rgba(76, 175, 80, 0.2)';
            gBtn.style.borderColor = 'var(--primary)';
        } else {
            gBtn.innerHTML = `⚡ Growth ×1.5 <span class="price">50💰</span>`;
            gBtn.style.background = '';
            gBtn.style.borderColor = '';
        }
    }
    
    const cBtn = document.getElementById('btn-boost-coin');
    if (cBtn) {
        if (S.boosters.coin > now) {
            const rem = Math.ceil((S.boosters.coin - now)/1000);
            cBtn.innerHTML = `💰 Coin (${Math.floor(rem/60)}:${(rem%60).toString().padStart(2,'0')})`;
            cBtn.style.background = 'rgba(76, 175, 80, 0.2)';
            cBtn.style.borderColor = 'var(--primary)';
        } else {
            cBtn.innerHTML = `💰 Coin ×2 <span class="price">100💰</span>`;
            cBtn.style.background = '';
            cBtn.style.borderColor = '';
        }
    }
}
"""
content += booster_func

with open(ui_path, 'w') as f:
    f.write(content)

print("Updated ui.js")
