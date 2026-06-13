import os
import re

config_path = '/Users/jeremyvalentinsiahaan/Documents/Game/farm-game/js/config.js'

with open(config_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add DECORATIONS to config.js if it doesn't exist
if 'DECORATIONS' not in content:
    decorations_code = """
const DECORATIONS = {
    tree: { name: 'Tree', emoji: '🌳', cost: 200, prestige: 5 },
    flower: { name: 'Flower', emoji: '🌷', cost: 100, prestige: 3 },
    rock: { name: 'Rock', emoji: '🪨', cost: 50, prestige: 1 },
    house: { name: 'House', emoji: '🏠', cost: 1000, prestige: 25 },
    fountain: { name: 'Fountain', emoji: '⛲', cost: 2000, prestige: 50 },
    statue: { name: 'Statue', emoji: '🗿', cost: 5000, prestige: 100 }
};
"""
    content += decorations_code
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added DECORATIONS to config.js")
else:
    print("DECORATIONS already exists in config.js")
