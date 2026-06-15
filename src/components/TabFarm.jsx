"use client";
export default function TabFarm() {
    return (
        <div id="tab-farm" className="tab-pane active">
            <div className="sidebar glass-panel">
                <div className="section-title">🛒 Shop Bibit</div>
                <div id="shop-list"></div>

                <div className="section-title">🌱 PILIH TANAMAN</div>
                <div id="crop-list"></div>

                <div className="section-title">⚡ Booster</div>
                <button className="shop-btn" id="btn-boost-growth">⚡ Growth ×1.5 <span className="price">50💰</span></button>

                <div className="section-title">🧑‍🌾 Pekerja (Auto)</div>
                <button className="shop-btn" id="btn-buy-gnome">
                    <div className="text-left">
                        <div>🧙‍♂️ Kurcaci Petani</div>
                        <div className="text-muted-sm">Auto-Farm & Harvest</div>
                    </div>
                    <span className="price">5000💰</span>
                </button>
            </div>

            <div id="farm-area" className="glass-panel">
                <div className="farm-header-wrap">
                    <div id="weather-bar" className="glass-panel">
                        <span id="weather-icon">☀️</span>
                        <span id="weather-name">Cerah</span>
                        <span className="text-muted-sm ml-10" id="weather-timer">Next: 5:00</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                        <button className="act-btn btn-auto-farm" id="btn-toggle-gnome">🧙‍♂️ Auto: OFF</button>
                    </div>
                    <div className="btn-group">
                        <button className="act-btn primary" id="btn-claim-daily">🎁 Daily</button>
                        <button className="act-btn" id="btn-save-game">💾 Save</button>
                        <button className="act-btn" id="btn-reset-game">🔄 Reset</button>
                    </div>
                </div>

                <div className="weather-overlay"></div>
                <div className="farm-grid" id="farm-grid"></div>

                <div className="farm-header-wrap mt-24">
                    <div className="section-title">📋 Papan Pesanan</div>
                </div>
                <div id="order-board"></div>
            </div>

            <div className="glass-panel right-panel">
                <div className="section-title">📦 Inventory</div>
                <div id="inv-list"></div>
                <button className="sell-btn" id="btn-sell-all">💰 Jual Semua</button>
                
                <div className="section-title mt-20">📋 Quest Harian</div>
                <div id="quest-list"></div>

                <div className="section-title mt-20">🍳 Dapur Produksi (Tanaman)</div>
                <div id="crafting-queue-farm" className="mb-12"></div>
                <div id="crafting-recipes-farm"></div>
            </div>
        </div>
    );
}
