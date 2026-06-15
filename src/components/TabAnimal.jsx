"use client";
export default function TabAnimal() {
    return (
        <div id="tab-animal" className="tab-pane">
            <div className="sidebar glass-panel">
                <div className="section-title">🐔 HEWAN TERNAK</div>
                <div id="animal-list"></div>

                <div className="section-title mt-20">🧑‍🌾 Pekerja (Auto)</div>
                <button className="shop-btn" id="btn-buy-gnome-animal">
                    <div className="text-left">
                        <div>🧑‍🍳 Kurcaci Peternak</div>
                        <div className="text-muted-sm">Auto-Collect Products</div>
                    </div>
                    <span className="price">500💰</span>
                </button>
            </div>

            <div className="glass-panel animal-panel">
                <div className="farm-header-wrap animal-header">
                    <div className="section-title m-0">🐔 Area Peternakan</div>
                    <div className="btn-group-right">
                        <button className="act-btn btn-auto-farm" id="btn-toggle-gnome-animal">🧑‍🍳 Auto: OFF</button>
                    </div>
                </div>
                <div id="farm-animals-area" className="animal-area-bg" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                    <div id="animal-grid-container" className="grid-container" style={{ flex: 1, padding: '20px', boxSizing: 'border-box', overflowY: 'auto' }}></div>
                </div>
            </div>

            <div className="glass-panel right-panel">
                <div className="section-title">🍳 Dapur Produksi (Peternakan)</div>
                <div id="crafting-queue-animal" className="mb-12"></div>
                <div id="crafting-recipes-animal"></div>
            </div>
        </div>
    );
}
