// ========================================
// FARM TYCOON - CORE UI MANAGER
// ========================================

export function initUI() {
    setupTabNavigation();
    setupSaveButton();
    setupGnomeButtons();
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activate selected tab
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`tab-${tabName}`);
    
    if (selectedBtn && selectedContent) {
        selectedBtn.classList.add('active');
        selectedContent.classList.add('active');
        
        // Render tab-specific content
        renderTabContent(tabName);
    }
}

function renderTabContent(tabName) {
    switch (tabName) {
        case 'farm':
            if (window.renderFarm) window.renderFarm();
            break;
        case 'animals':
            if (window.renderAnimals) window.renderAnimals();
            break;
        case 'city':
            if (window.renderOrders) window.renderOrders();
            if (window.renderCrafting) window.renderCrafting();
            break;
        case 'mine':
            if (window.renderMine) window.renderMine();
            break;
        case 'lake':
            if (window.renderLake) window.renderLake();
            break;
    }
}

function setupSaveButton() {
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (window.saveGame) {
                window.saveGame();
            }
        });
    }
}

function setupGnomeButtons() {
    // Gnome Farmer toggle
    const gnomeFarmerBtn = document.getElementById('btn-gnome-farmer');
    if (gnomeFarmerBtn) {
        gnomeFarmerBtn.addEventListener('click', () => {
            toggleGnome('farmer', gnomeFarmerBtn);
        });
    }
    
    // Gnome Rancher toggle
    const gnomeRancherBtn = document.getElementById('btn-gnome-rancher');
    if (gnomeRancherBtn) {
        gnomeRancherBtn.addEventListener('click', () => {
            toggleGnome('rancher', gnomeRancherBtn);
        });
    }
}

function toggleGnome(type, button) {
    const state = window.S;
    if (!state) return;
    
    const gnome = state.gnomes[type];
    
    if (!gnome.purchased) {
        // Purchase gnome
        const cost = type === 'farmer' ? 5000 : 8000;
        
        if (state.coins >= cost) {
            state.coins -= cost;
            gnome.purchased = true;
            gnome.active = true;
            
            button.textContent = 'ON';
            button.classList.remove('off');
            button.classList.add('on');
            
            window.notificationManager?.show(`🧙‍♂️ Kurcaci ${type === 'farmer' ? 'Petani' : 'Peternak'} diaktifkan!`, 'success');
        } else {
            window.notificationManager?.show(`❌ Koin tidak cukup! Butuh ${cost.toLocaleString()} koin`, 'error');
        }
    } else {
        // Toggle on/off
        gnome.active = !gnome.active;
        
        button.textContent = gnome.active ? 'ON' : 'OFF';
        button.classList.toggle('on', gnome.active);
        button.classList.toggle('off', !gnome.active);
        
        window.notificationManager?.show(
            `Kurcaci ${gnome.active ? 'diaktifkan' : 'dinonaktifkan'}`, 
            gnome.active ? 'success' : 'info'
        );
    }
    
    updateTopbar();
}

function updateTopbar() {
    const state = window.S;
    if (!state) return;
    
    document.getElementById('coin-val').textContent = state.coins.toLocaleString();
    document.getElementById('level-val').textContent = state.level;
    
    const xpPercent = (state.xp / state.xpToNextLevel) * 100;
    document.getElementById('xp-bar-fill').style.width = `${xpPercent}%`;
}

// Export functions for global access
window.switchTab = switchTab;
window.updateTopbar = updateTopbar;
