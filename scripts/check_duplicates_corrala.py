"""
Comprueba cartones duplicados y lineas (filas de 3 canciones) duplicadas
en el archivo MD de La Corrala Escondida.
"""
import re
import sys
from pathlib import Path
from collections import defaultdict

md_path = Path("cartones/La Corrala Escondida/bingo-la-corrala-estilo-imagen-200-v7.md")
if len(sys.argv) > 1:
    md_path = Path(sys.argv[1])

md = md_path.read_text(encoding="utf-8")

# ---------- Parse cards ----------
cards = {}
current = None
for line in md.splitlines():
    clean = line.strip()
    m_header = re.match(r"^## Cart[oó]n (\d+)", clean)
    if m_header:
        current = int(m_header.group(1))
        cards[current] = []
        continue
    if current is not None:
        m_song = re.match(r"^\d+\.\s+(.+)", clean)
        if m_song:
            cards[current].append(m_song.group(1).strip())

print(f"Cartones parseados : {len(cards)}")
sizes = set(len(v) for v in cards.values())
print(f"Canciones/carton   : {sizes}")
print()

# ---------- 1. Cartones duplicados ----------
card_sig: dict = {}
dup_cards: list = []
for num, songs in sorted(cards.items()):
    sig = frozenset(songs)
    if sig in card_sig:
        dup_cards.append((card_sig[sig], num))
    else:
        card_sig[sig] = num

print("=" * 55)
print(f"CARTONES COMPLETAMENTE DUPLICADOS: {len(dup_cards)}")
print("=" * 55)
if dup_cards:
    for a, b in dup_cards:
        print(f"  Carton {a:03d} == Carton {b:03d}")
else:
    print("  Ningun carton duplicado.")

# ---------- 2. Lineas (filas de 3) duplicadas ----------
# Grid 3 columnas x 4 filas => grupos [0:3], [3:6], [6:9], [9:12]
line_map: dict = defaultdict(list)
for num, songs in cards.items():
    if len(songs) < 12:
        continue
    for row in range(4):
        trio = frozenset(songs[row * 3 : row * 3 + 3])
        line_map[trio].append((num, row + 1))

dup_lines = {trio: locs for trio, locs in line_map.items() if len(locs) > 1}

print()
print("=" * 55)
print(f"LINEAS (FILA DE 3 CANCIONES) REPETIDAS: {len(dup_lines)}")
print("=" * 55)
if dup_lines:
    sorted_dups = sorted(dup_lines.items(), key=lambda x: -len(x[1]))
    for trio, locs in sorted_dups:
        names = " / ".join(sorted(trio))
        print(f"\n  [{len(locs)}x]  {names}")
        for carton, row in sorted(locs):
            print(f"         Carton {carton:03d}, fila {row}")
else:
    print("  Ninguna linea de 3 repetida.")

# ---------- Resumen ----------
print()
print("=" * 55)
print("RESUMEN")
print("=" * 55)
print(f"  Cartones duplicados : {len(dup_cards)}")
print(f"  Lineas duplicadas   : {len(dup_lines)}")
total_line_occurrences = sum(len(v) - 1 for v in dup_lines.values())
print(f"  Repeticiones extra  : {total_line_occurrences} apariciones sobre el maximo de 1")
