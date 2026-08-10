#!/bin/bash
echo "Memulai unduhan musik Lo-Fi Relaxing..."
curl -L "https://archive.org/download/lofi-chill/1.%20lofi-chill.mp3" -o public/music/farm-theme.mp3
cp public/music/farm-theme.mp3 public/music/menu-theme.mp3
cp public/music/farm-theme.mp3 public/music/event-theme.mp3
echo "Selesai! File musik berhasil disimpan ke folder public/music/."
