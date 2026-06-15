"use client";
export default function Topbar() {
    return (
        <div id="topbar" className="glass-panel">
            <div className="logo">🌾 Farm Tycoon</div>
            <div className="stat-chip">
                💰 <span id="coin-val">100</span>
                <button 
                    onClick={() => { if(window.cheatCoin) window.cheatCoin() }} 
                    style={{ background: 'none', border: 'none', fontSize: '16px', marginLeft: '5px', cursor: 'pointer', color: 'var(--primary)' }} 
                    title="Cheat Uang (atau tekan C)">
                    ➕
                </button>
            </div>
            <div className="stat-chip">⭐ Lv <span id="level-val">1</span></div>
            <div className="stat-chip" id="weather-chip">☀️ Cerah</div>
            <div className="stat-chip" title="Bonus Harga Jual">✨ Prestige: <span id="prestige-val">0</span></div>
            <button id="btn-mute">🔊 Sound</button>
            <div id="xp-wrap">
                <div id="xp-label">XP: <span id="xp-val">0</span>/<span id="xp-need">100</span></div>
                <div id="xp-bar-outer">
                    <div id="xp-bar" style={{ width: '0%' }}></div>
                </div>
            </div>
        </div>
    );
}
