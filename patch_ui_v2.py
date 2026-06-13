import os

ui_path = '/Users/jeremyvalentinsiahaan/Documents/Game/farm-game/js/ui.js'
with open(ui_path, 'r', encoding='utf-8') as f:
    ui = f.read()

# 1. Update render()
old_render = """function render() {
    renderShop();
    renderCropList();
    renderGrid();
    renderInventory();
    renderQuests();
    updateTopbar();
    updateBoosters();
    document.getElementById('achieve-count').textContent = `${S.achievements.length} / ${ACHIEVEMENTS.length}`;
}"""
new_render = """function render() {
    renderShop();
    renderCropList();
    renderDecorations();
    renderGrid();
    renderInventory();
    renderQuests();
    updateTopbar();
    updateBoosters();
    document.getElementById('achieve-count').textContent = `${S.achievements.length} / ${ACHIEVEMENTS.length}`;
}"""
ui = ui.replace(old_render, new_render)

# 2. Add renderDecorations()
render_deco = """
function renderDecorations() {
    const el = document.getElementById('deco-list');
    if (!el) return;
    el.innerHTML = '';
    
    if (S.level < 5) {
        el.innerHTML = '<div style="font-size:11px;color:var(--muted)">Terbuka di Level 5</div>';
        return;
    }

    for (const [k, d] of Object.entries(DECORATIONS)) {
        const owned = S.decorations && S.decorations.includes(k);
        const btn = document.createElement('button');
        btn.className = 'shop-btn' + (owned ? ' locked' : '');
        btn.innerHTML = `${d.emoji} ${d.name} (+${d.prestige}✨) <span class="price">${owned ? 'Dimiliki' : d.cost + '💰'}</span>`;
        if (!owned) {
            btn.onclick = () => buyDecoration(k);
        } else {
            btn.style.borderColor = 'var(--primary)';
            btn.style.background = 'rgba(76, 175, 80, 0.1)';
        }
        el.appendChild(btn);
    }
}
"""
ui = ui.replace("function renderGrid() {", render_deco + "\nfunction renderGrid() {")

# 3. Update updateTopbar()
ui = ui.replace("document.getElementById('weather-timer').textContent = `Next: ${min}:${sec.toString().padStart(2,'0')}`;", "document.getElementById('weather-timer').textContent = `Next: ${min}:${sec.toString().padStart(2,'0')}`;\n    \n    const pVal = document.getElementById('prestige-val');\n    if (pVal) pVal.textContent = S.prestige || 0;")

with open(ui_path, 'w', encoding='utf-8') as f:
    f.write(ui)

print("Updated ui.js")
