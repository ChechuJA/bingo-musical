#!/usr/bin/env python3
"""Generador genérico de cartones (únicos) a partir de una lista.

Entrada principal:
- Un Markdown con lista numerada de canciones (ej: 1. Canción - Artista)

Salida:
- Un Markdown con N cartones (## Cartón X) y K canciones por cartón
- (Opcional) Un PPTX usando el mismo layout que el generador del proyecto

Ejemplos:
- Generar cartones + PPTX:
  C:/Github/bingo-musical/.venv/Scripts/python.exe scripts/generate-from-list.py \
    --songs-md cartones/disney/pequeños/listado-canciones-disney-pequeños.md \
    --out-md cartones/disney/pequeños/cartones-disney-pequeños.md \
    --category "Disney" --size "Pequeños" --songs-per-card 8 --num-cards 50 \
    --pptx-out cartones/disney/pequeños/cartones-disney-pequeños.pptx \
    --theme infantil

Notas de unicidad:
- Si el número de combinaciones C(n,k) es razonable, usa combinaciones + shuffle.
- Si es enorme, usa muestreo aleatorio evitando duplicados (set).
"""

from __future__ import annotations

import argparse
import random
import re
from itertools import combinations
from math import comb
from pathlib import Path

from pptx_utils import create_bingo_pptx


THEMES: dict[str, dict] = {
    "infantil": {
        "icon": "🎈",
        "background": (245, 250, 255),
        "title": (99, 102, 241),
        "subtitle": (168, 85, 247),
        "border": (99, 102, 241),
        "checkbox": (252, 211, 77),
    },
    "default": {
        "icon": "🎵",
        "background": (250, 250, 250),
        "title": (60, 60, 60),
        "subtitle": (90, 90, 90),
        "border": (60, 60, 60),
        "checkbox": (120, 120, 120),
    },
}


def parse_song_list(md_path: Path) -> list[str]:
    line_re = re.compile(r"^\s*(\d+)\.\s+(.*)\s*$")
    songs: list[str] = []

    for raw in md_path.read_text(encoding="utf-8").splitlines():
        m = line_re.match(raw)
        if not m:
            continue
        song = m.group(2).strip()
        if song:
            songs.append(song)

    if not songs:
        raise ValueError(f"No se han encontrado canciones en {md_path}")

    return songs


def generate_unique_cards(songs: list[str], songs_per_card: int, num_cards: int) -> list[list[str]]:
    n = len(songs)
    total = comb(n, songs_per_card)

    # Umbral para materializar combinaciones completas en memoria.
    # 500k combos suele ir bien en una máquina normal.
    COMBO_MATERIALIZE_LIMIT = 500_000

    if total <= COMBO_MATERIALIZE_LIMIT:
        all_combos = list(combinations(songs, songs_per_card))
        random.shuffle(all_combos)
        chosen = all_combos[:num_cards]
        cards: list[list[str]] = []
        for combo in chosen:
            card = list(combo)
            random.shuffle(card)
            cards.append(card)
        return cards

    # Fallback: muestreo aleatorio evitando duplicados
    seen: set[tuple[str, ...]] = set()
    cards = []

    # Límite de intentos proporcional para evitar bucles infinitos
    max_attempts = max(50_000, num_cards * 500)
    attempts = 0

    while len(cards) < num_cards and attempts < max_attempts:
        attempts += 1
        picked = random.sample(songs, songs_per_card)
        key = tuple(sorted(picked))
        if key in seen:
            continue
        seen.add(key)
        random.shuffle(picked)
        cards.append(picked)

    if len(cards) < num_cards:
        raise RuntimeError(
            f"No se han podido generar {num_cards} cartones únicos. "
            f"Generados: {len(cards)}. Intentos: {attempts}."
        )

    return cards


def write_cards_markdown(output_path: Path, category: str, size: str, cards: list[list[str]]) -> None:
    parts: list[str] = []
    parts.append(f"# Cartones de Bingo Musical - {category} ({size})")
    parts.append("")
    parts.append(f"**Configuración:** {len(cards[0])} canciones por cartón · {len(cards)} cartones únicos")
    parts.append("")
    parts.append("---")
    parts.append("")

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
    parser = argparse.ArgumentParser(description="Genera cartones únicos desde una lista")
    parser.add_argument("--songs-md", required=True, help="Ruta al .md con la lista numerada")
    parser.add_argument("--out-md", required=True, help="Ruta del .md de salida con los cartones")
    parser.add_argument("--category", required=True, help="Nombre de categoría para el título")
    parser.add_argument("--size", required=True, help="Nombre del tamaño (Pequeños/Medianos/...) ")
    parser.add_argument("--songs-per-card", type=int, required=True)
    parser.add_argument("--num-cards", type=int, required=True)
    parser.add_argument("--seed", type=int, default=None, help="Semilla para reproducibilidad")

    parser.add_argument("--pptx-out", default=None, help="Si se indica, genera PPTX también")
    parser.add_argument("--theme", default="default", choices=sorted(THEMES.keys()))

    args = parser.parse_args()

    songs_md = Path(args.songs_md)
    out_md = Path(args.out_md)

    if args.seed is not None:
        random.seed(args.seed)

    songs = parse_song_list(songs_md)

    if len(songs) < args.songs_per_card:
        raise SystemExit(
            f"❌ No hay suficientes canciones ({len(songs)}) para {args.songs_per_card} por cartón"
        )

    cards = generate_unique_cards(songs, args.songs_per_card, args.num_cards)
    write_cards_markdown(out_md, args.category, args.size, cards)

    print("✅ Cartones generados")
    print(f"   - Canciones: {len(songs)}")
    print(f"   - Cartones: {len(cards)}")
    print(f"   - Salida MD: {out_md}")

    if args.pptx_out:
        theme = THEMES[args.theme]
        theme_colors = {
            "icon": theme["icon"],
            "background": theme["background"],
            "title": theme["title"],
            "subtitle": theme["subtitle"],
            "border": theme["border"],
            "checkbox": theme["checkbox"],
        }
        categoria_title = f"{args.category} - {args.size} ({args.songs_per_card} canciones)"
        create_bingo_pptx(cards, categoria_title, theme_colors, Path(args.pptx_out))


if __name__ == "__main__":
    main()
