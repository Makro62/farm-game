"use client";
export default function TabTown() {
    return (
        <div id="tab-town" className="tab-pane">
            <div className="sidebar glass-panel">
                <div className="section-title">🐟 BIBIT IKAN</div>
                <div id="fish-shop-list"></div>

                <div className="section-title mt-20">🏡 DEKORASI</div>
                <div id="deco-list"></div>

                <div className="section-title mt-20">🏗️ Bangunan</div>
                <div id="building-list"></div>

                <div className="section-title mt-20">⚡ Booster</div>
                <button className="shop-btn" id="btn-boost-coin">💰 Coin ×2 <span className="price">100💰</span></button>

                <div className="section-title mt-20">🎡 Roda Harian</div>
                <button className="shop-btn" id="btn-open-wheel" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2))', borderColor: 'gold' }}>
                    <div className="text-left">
                        <div style={{ fontWeight: 800, color: '#d97706' }}>🎰 Putar Roda</div>
                        <div className="text-muted-sm">1x Putaran Gratis/Hari</div>
                    </div>
                </button>

                <div className="section-title mt-20">🧑‍🌾 Pekerja Kota (Auto)</div>
                <button className="shop-btn" id="btn-buy-merchant">
                    <div className="text-left">
                        <div>🧑‍🌾 Pemancing Kota</div>
                        <div className="text-muted-sm">Auto-mancing & jual hasil</div>
                    </div>
                    <span className="price">12000💰</span>
                </button>
                <button className="act-btn btn-auto-farm" id="btn-toggle-merchant">🧑‍🌾 Auto: OFF</button>

                <div className="section-title mt-20">🏆 Achievements</div>
                <div id="achieve-count" className="text-muted-sm">0 / 12</div>
            </div>

            <div className="glass-panel town-panel">
                <div id="farm-decorations-area" className="farm-decorations-area"></div>

                <div className="farm-header-wrap">
                    <div className="section-title">🎣 Danau Pemancingan (Peternakan Ikan)</div>
                </div>
                <div id="lake-container">
                    <div id="fish-area" className="fish-area-custom"></div>
                </div>

                <div className="farm-header-wrap mt-24">
                    <div className="section-title">🏪 Pasar Ikan Kota</div>
                </div>
                <div id="fish-market-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}></div>
            </div>

            <div className="glass-panel right-panel">
                <div className="farm-header-wrap mt-24">
                    <div className="section-title mt-0">🍳 Dapur Ikan (Masakan Laut)</div>
                </div>
                <div id="crafting-queue-fish" className="mb-12"></div>
                <div id="crafting-recipes-fish"></div>
            </div>
        </div>
    );
}
