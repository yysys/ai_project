#!/bin/bash

# Create directories
mkdir -p assets/images
mkdir -p assets/videos
mkdir -p assets/audio

# Function to create dummy image (SVG content in PNG file)
create_image() {
    local name=$1
    local color=${2:-"#333"}
    echo "<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='$color'/><text x='50%' y='50%' font-family='Arial' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle'>$name</text></svg>" > "assets/images/$name.png"
    echo "Created assets/images/$name.png"
}

# Function to create dummy media file
create_media() {
    local path=$1
    local type=$2
    echo "// Placeholder for $type: $(basename $path)" > "$path"
    echo "Created $path"
}

# --- Images ---
# Existing
create_image "game-logo" "#0066cc"
create_image "drone" "#666"
create_image "map" "#228b22"
create_image "feature-gyro" "#0099ff"
create_image "feature-speed" "#0099ff"
create_image "feature-map" "#0099ff"
create_image "tab-home" "#999"
create_image "tab-home-active" "#0066cc"
create_image "tab-flight" "#999"
create_image "tab-flight-active" "#0066cc"

# UI Buttons
create_image "btn-store" "#ffaa00"
create_image "btn-settings" "#666"
create_image "btn-start" "#00ff00"
create_image "btn-close" "#ff0000"
create_image "btn-buy" "#ffd700"
create_image "btn-back" "#666"

# Missiles
create_image "missile-normal" "#999"
create_image "missile-ap" "#333"
create_image "missile-he" "#aa0000"

# Drones (Level 1-10)
for i in {1..10}; do
    create_image "drone-level-$i" "#444"
done

# --- Videos ---
create_media "assets/videos/game-intro.mp4" "Video"
create_media "assets/videos/login-bg.mp4" "Video"

# --- Audio ---
create_media "assets/audio/bg-music.mp3" "Audio"
create_media "assets/audio/login-sound.mp3" "Audio"
create_media "assets/audio/button-click.mp3" "Audio"
create_media "assets/audio/bgm-lobby.mp3" "Audio"
create_media "assets/audio/sfx-buy.mp3" "Audio"
create_media "assets/audio/sfx-drone-hover.mp3" "Audio"
create_media "assets/audio/sfx-missile-launch.mp3" "Audio"
create_media "assets/audio/sfx-explosion.mp3" "Audio"

echo "All resources generated successfully."
