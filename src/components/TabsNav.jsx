"use client";
export default function TabsNav() {
    return (
        <div id="tabs-nav">
            <button className="tab-btn active" data-tab="tab-farm">🌾 Pertanian</button>
            <button className="tab-btn" data-tab="tab-animal">🐔 Peternakan</button>
            <button className="tab-btn" data-tab="tab-town">🏘️ Kota & Fitur</button>
        </div>
    );
}
