// ============================================================
// INIT
// ============================================================

function initPlots() {
    S.plots = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        S.plots.push({ id: i, state: 'grass', crop: null, plantedAt: 0, growTime: 0 });
    }
}

// ============================================================
// ENTRY POINT
// ============================================================

if (!loadGame()) {
    initPlots();
    generateQuests();
    toast('🌾 Selamat datang di Farm Tycoon!', 'success');
}
if (!S.quests || !S.quests.length) generateQuests();

render();
setInterval(gameLoop, 1000);         // Update tiap detik
setInterval(() => saveGame(), 30000); // Auto-save tiap 30 detik

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    const cropKeys = { '1':'carrot', '2':'corn', '3':'tomato', '4':'strawberry', '5':'pineapple', '6':'pumpkin' };
    if (cropKeys[e.key]) { selectedCrop = cropKeys[e.key]; renderCropList(); }
    else if (e.key === 's' || e.key === 'S') saveGame(true);
    else if (e.key === 'd' || e.key === 'D') claimDaily();
    else if (e.key === 'Escape') closeModal();
});

// Audio init on first interaction
document.body.addEventListener('click', () => {
    if (typeof initAudio === 'function') initAudio();
}, { once: true });
