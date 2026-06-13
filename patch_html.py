import os
import re

html_path = '/Users/jeremyvalentinsiahaan/Documents/Game/farm-game/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Prestige and Audio to Topbar
# Find: <div class="stat-chip" id="weather-chip">☀️ Cerah</div>
# Replace with: <div class="stat-chip" id="weather-chip">☀️ Cerah</div>
#               <div class="stat-chip">✨ Prestige: <span id="prestige-val">0</span></div>
#               <button class="act-btn" id="btn-mute" style="width:auto; padding: 4px 8px; margin: 0; min-width: 0;" onclick="toggleAudio()">🔊 Sound</button>

topbar_old = '<div class="stat-chip" id="weather-chip">☀️ Cerah</div>'
topbar_new = '<div class="stat-chip" id="weather-chip">☀️ Cerah</div>\n        <div class="stat-chip" title="Bonus Harga Jual">✨ Prestige: <span id="prestige-val">0</span></div>\n        <button class="act-btn" id="btn-mute" style="width:auto; padding: 4px 10px; margin: 0; min-width: 0; border-radius:20px;" onclick="toggleAudio()">🔊 Sound</button>'
html = html.replace(topbar_old, topbar_new)

# 2. Add Decoration Shop in Sidebar
# Find: <div class="section-title">⚡ Booster</div>
# Insert before it the decoration shop:
# <div class="section-title">🏡 Dekorasi (Lv 5+)</div>
# <div id="deco-list"></div>

deco_html = """
            <div class="section-title">🏡 Dekorasi (Lv 5+)</div>
            <div id="deco-list"></div>

            <div class="section-title">⚡ Booster</div>"""
html = html.replace('<div class="section-title">⚡ Booster</div>', deco_html.strip())

# 3. Add script tag for audio.js
script_tag = '<script src="js/audio.js"></script>\n<script src="js/config.js"></script>'
html = html.replace('<script src="js/config.js"></script>', script_tag)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html")
