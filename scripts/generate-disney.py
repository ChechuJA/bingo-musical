#!/usr/bin/env python3
"""Genera cartones Disney (pequeños) únicos.

Este script es específico para Disney y se mantiene por compatibilidad.
Para nuevos listados/categorías, usa el generador genérico:
`scripts/generate-from-list.py`.

- Lee las canciones desde: cartones/disney/pequeños/listado-canciones-disney-pequeños.md
- Genera 50 cartones únicos de 8 canciones (sin repeticiones entre cartones)
- Sobrescribe: cartones/disney/pequeños/cartones-disney-pequeños.md

Nota: Con 20 canciones y 8 por cartón hay C(20,8)=125.970 combinaciones, suficiente.
"""

from __future__ import annotations

import random
import re
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SONGS_FILE = ROOT / "cartones" / "disney" / "pequeños" / "listado-canciones-disney-pequeños.md"
OUTPUT_MD = ROOT / "cartones" / "disney" / "pequeños" / "cartones-disney-pequeños.md"

CATEGORIA = "Disney"
TAMANIO = "Pequeños"
SONGS_PER_CARD = 8
NUM_CARDS = 50


def parse_song_list(md_path: Path) -> list[str]:
    if not md_path.exists():
        raise FileNotFoundError(f"No existe el archivo de canciones: {md_path}")

    songs: list[str] = []
    line_re = re.compile(r"^\s*(\d+)\.\s+(.*)\s*$")

    for raw in md_path.read_text(encoding="utf-8").splitlines():
        m = line_re.match(raw)
        if not m:
            continue
        song = m.group(2).strip()
        if song:
            songs.append(song)

    if not songs:
        raise ValueError(f"No se han podido extraer canciones de {md_path}")

    return songs


def generate_unique_cards(songs: list[str], songs_per_card: int, num_cards: int) -> list[list[str]]:
    all_combos = list(combinations(songs, songs_per_card))
    if len(all_combos) < num_cards:
        raise ValueError(
            f"No hay suficientes combinaciones únicas: {len(all_combos)} < {num_cards}"
        )

    random.shuffle(all_combos)

    cards: list[list[str]] = []
    for combo in all_combos[:num_cards]:
        card = list(combo)
        random.shuffle(card)
        cards.append(card)

    return cards


def write_cards_markdown(output_path: Path, category: str, size: str, cards: list[list[str]]) -> None:
    header = [
        f"# Cartones de Bingo Musical - {category} ({size})",
        "",
        f"**Configuración:** {len(cards[0])} canciones por cartón · {len(cards)} cartones únicos",
        "",
        "---",
        "",
    ]

    parts: list[str] = []
    parts.extend(header)

    for idx, card in enumerate(cards, 1):
        parts.append(f"## Cartón {idx}")
        parts.append("")
        for song_idx, song in enumerate(card, 1):
            parts.append(f"{song_idx}. {song}")
        parts.append("")
        parts.append("---")
        parts.append("")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(parts).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    songs = parse_song_list(SONGS_FILE)
    cards = generate_unique_cards(songs, SONGS_PER_CARD, NUM_CARDS)
    write_cards_markdown(OUTPUT_MD, CATEGORIA, TAMANIO, cards)

    print("✅ Disney pequeños regenerado")
    print(f"   - Canciones: {len(songs)}")
    print(f"   - Cartones: {len(cards)}")
    print(f"   - Archivo: {OUTPUT_MD}")


if __name__ == "__main__":
    main()
