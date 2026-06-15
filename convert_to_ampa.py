#!/usr/bin/env python3
"""Convierte el formato estándar al formato AMPA."""
from pathlib import Path

md_file = Path("cartones/ampa/FiestaVerano/Verano2026/cartones-verano-2026.md")
lines = md_file.read_text(encoding="utf-8").splitlines()

result = []
song_num = 0
current_carton = None

for line in lines:
    # Detectar inicio de cartón
    if line.startswith("## Cartón"):
        if current_carton is not None:
            result.append("")  # separador entre cartones
        current_carton = line
        result.append(line)
        result.append("")
        song_num = 1
    # Detectar línea con canción (número punto)
    elif line and line[0].isdigit() and ". " in line:
        # Formato entrada: "12. Madonna - La Isla Bonita"
        # Formato salida: "12 - {num_song} Madonna - La Isla Bonita"
        parts = line.split(". ", 1)
        if len(parts) == 2:
            pos = parts[0]
            cancion = parts[1]
            result.append(f"{pos} - {song_num} {cancion}")
            song_num += 1

output = Path("cartones/ampa/FiestaVerano/cartones-bingo-musical-varios-1.md")
output.write_text("\n".join(result) + "\n", encoding="utf-8")
print(f"✅ Convertido a formato AMPA: {output}")
