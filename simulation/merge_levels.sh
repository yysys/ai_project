#!/bin/bash

OUTPUT_FILE="../simulation_json/levels.json"
INPUT_DIR="../simulation_json"

echo "[" > "$OUTPUT_FILE"

first=true
for i in $(seq 1 20); do
    file="$INPUT_DIR/level_$i.json"
    if [ -f "$file" ]; then
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$OUTPUT_FILE"
        fi
        # Extract the level object (remove the outer array brackets)
        cat "$file" | sed '1d;$d' >> "$OUTPUT_FILE"
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "]" >> "$OUTPUT_FILE"

echo "Merged all levels into $OUTPUT_FILE"
