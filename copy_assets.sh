#!/bin/bash

echo "🔄 Memulai pembaruan aset visual dan audio..."

# Direktori sumber (dari AI brain)
SRC_DIR="/Users/jeremyvalentinsiahaan/.gemini/antigravity-ide/brain/a5996918-9b6f-4e15-9e8d-05bfda3bce10"
# Direktori tujuan
DEST_DIR="/Users/jeremyvalentinsiahaan/Documents/Game/farm-game/public"

# 1. Pindahkan dan ganti nama Logo
cp "$SRC_DIR/logo_1786351159271.png" "$DEST_DIR/img/logo.png"
echo "✅ Logo diperbarui."

# 2. Pindahkan Gambar Hewan
cp "$SRC_DIR/chicken_1786351171451.png" "$DEST_DIR/img/animals/chicken.png"
cp "$SRC_DIR/cow_1786351186917.png" "$DEST_DIR/img/animals/cow.png"
cp "$SRC_DIR/duck_1786351198081.png" "$DEST_DIR/img/animals/duck.png"
cp "$SRC_DIR/horse_1786351210220.png" "$DEST_DIR/img/animals/horse.png"
cp "$SRC_DIR/pig_1786351221973.png" "$DEST_DIR/img/animals/pig.png"
cp "$SRC_DIR/sheep_1786351234993.png" "$DEST_DIR/img/animals/sheep.png"
echo "✅ Gambar hewan diperbarui."

# 3. Pindahkan Backgrounds
cp "$SRC_DIR/animal_bg_1786351247779.png" "$DEST_DIR/img/backgrounds/animal_bg.png"
cp "$SRC_DIR/farm_bg_1786351262787.png" "$DEST_DIR/img/backgrounds/farm_bg.png"
cp "$SRC_DIR/lake_bg_1786351276505.png" "$DEST_DIR/img/backgrounds/lake_bg.png"
cp "$SRC_DIR/mine_bg_1786351290782.png" "$DEST_DIR/img/backgrounds/mine_bg.png"
echo "✅ Gambar latar belakang diperbarui."

# 4. Unduh Lagu Menenangkan (Lo-Fi)
echo "🎵 Mengunduh lagu latar (BGM) lo-fi yang menenangkan..."
curl -L -s "https://archive.org/download/lofi-chill/1.%20lofi-chill.mp3" -o "$DEST_DIR/music/farm-theme.mp3"
# Salin lagu yang sama untuk menu dan event sementara
cp "$DEST_DIR/music/farm-theme.mp3" "$DEST_DIR/music/menu-theme.mp3"
cp "$DEST_DIR/music/farm-theme.mp3" "$DEST_DIR/music/event-theme.mp3"
echo "✅ Musik latar berhasil diperbarui."

echo "🎉 Selesai! Semua aset telah diperbarui."
