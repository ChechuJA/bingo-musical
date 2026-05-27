#!/usr/bin/env python3
"""Generador de Cartones de Bingo Musical con Logo de Empresa (Branded PPTX).

Script todo-en-uno para generar cartones de bingo con el logo de la empresa
y exportarlos a PowerPoint (.pptx). Compatible con cualquier imagen PNG/JPG.

Requisitos:
    pip install python-pptx Pillow

Uso básico (desde listado de canciones):
    python scripts/generate-bingo-branded.py \\
        --songs-md cartones/navidad/pequeños/listado-canciones-navidad-pequeños.md \\
        --output cartones/navidad/pequeños/cartones-navidad-branded.pptx \\
        --logo assets/icons/icon-512.png \\
        --category "Navidad" --size "Pequeños" \\
        --songs-per-card 8 --num-cards 20

Uso con cartones ya generados (MD existente):
    python scripts/generate-bingo-branded.py \\
        --cards-md cartones/navidad/medianos/cartones-navidad-medianos.md \\
        --output cartones/navidad/medianos/cartones-navidad-branded.pptx \\
        --logo mi-logo.png \\
        --category "Navidad"

Opciones de logo:
    --logo       Ruta a imagen PNG/JPG/GIF del logo
    --logo-width Ancho del logo en pulgadas (default: 0.9)
    --logo-pos   Posición: top-left, top-right, top-center (default: top-left)

Opciones de estilo:
    --theme      Tema predefinido (navidad, pop, latino, otono, cumpleanos, infantil, rock, default)
    --style      Estilo de cartón: list (default) o grid3x3 (solo para <=8 canciones)
    --cards-per-slide  Forzar 1, 2 o 3 cartones por diapositiva

Ejemplo completo con todas las opciones:
    python scripts/generate-bingo-branded.py \\
        --songs-md cartones/rock/pequeños/listado-canciones-rock-pequeños.md \\
        --output cartones/rock/branded/cartones-rock-branded.pptx \\
        --logo assets/icons/icon-512.png \\
        --logo-width 1.0 --logo-pos top-right \\
        --category "Rock Clásico" --size "Pequeños" \\
        --songs-per-card 8 --num-cards 30 \\
        --theme rock --style grid3x3 \\
        --also-md cartones/rock/branded/cartones-rock-branded.md
"""

from __future__ import annotations

import argparse
import random
import re
import sys
from itertools import combinations
from math import comb
from pathlib import Path

# Importar utilidades compartidas del proyecto
sys.path.insert(0, str(Path(__file__).parent))
from pptx_utils import create_bingo_pptx, load_cards_from_markdown


# ─── Temas predefinidos ───────────────────────────────────────────────────────

THEMES: dict[str, dict] = {
    "navidad": {
        "icon": "🎄",
        "background": (255, 250, 245),
        "title": (196, 30, 58),
        "subtitle": (34, 139, 34),
        "border": (196, 30, 58),
        "checkbox": (255, 215, 0),
    },
    "pop": {
        "icon": "🎸",
        "background": (255, 245, 250),
        "title": (255, 107, 157),
        "subtitle": (219, 39, 119),
        "border": (255, 107, 157),
        "checkbox": (252, 211, 77),
    },
    "latino": {
        "icon": "💃",
        "background": (255, 248, 240),
        "title": (255, 140, 66),
        "subtitle": (234, 88, 12),
        "border": (255, 140, 66),
        "checkbox": (251, 191, 36),
    },
    "otono": {
        "icon": "🍂",
        "background": (255, 250, 240),
        "title": (180, 83, 9),
        "subtitle": (146, 64, 14),
        "border": (212, 165, 116),
        "checkbox": (217, 119, 6),
    },
    "cumpleanos": {
        "icon": "🎂",
        "background": (255, 252, 240),
        "title": (234, 179, 8),
        "subtitle": (202, 138, 4),
        "border": (255, 217, 61),
        "checkbox": (245, 158, 11),
    },
    "infantil": {
        "icon": "🎈",
        "background": (245, 250, 255),
        "title": (99, 102, 241),
        "subtitle": (168, 85, 247),
        "border": (99, 102, 241),
        "checkbox": (252, 211, 77),
    },
    "rock": {
        "icon": "🎸",
        "background": (245, 245, 250),
        "title": (55, 65, 81),
        "subtitle": (107, 114, 128),
        "border": (55, 65, 81),
        "checkbox": (239, 68, 68),
    },
    "disney": {
        "icon": "🏰",
        "background": (240, 248, 255),
        "title": (30, 58, 138),
        "subtitle": (99, 102, 241),
        "border": (30, 58, 138),
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


# ─── Funciones de parseo y generación ─────────────────────────────────────────


def parse_song_list(md_path: Path) -> list[str]:
    """Lee un listado markdown numerado y devuelve las canciones."""
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
    """Genera cartones únicos a partir de un pool de canciones."""
    n = len(songs)
    total = comb(n, songs_per_card)
    COMBO_LIMIT = 500_000

    if total <= COMBO_LIMIT:
        all_combos = list(combinations(songs, songs_per_card))
        random.shuffle(all_combos)
        chosen = all_combos[:num_cards]
        cards: list[list[str]] = []
        for combo in chosen:
            card = list(combo)
            random.shuffle(card)
            cards.append(card)
        return cards

    # Muestreo aleatorio evitando duplicados
    seen: set[tuple[str, ...]] = set()
    cards = []
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
            f"❌ No se han podido generar {num_cards} cartones únicos. "
            f"Generados: {len(cards)}. Intentos: {attempts}."
        )
    return cards


def write_cards_markdown(output_path: Path, category: str, size: str, cards: list[list[str]]) -> None:
    """Escribe los cartones generados en formato Markdown."""
    parts: list[str] = [
        f"# Cartones de Bingo Musical - {category} ({size})",
        "",
        f"**Configuración:** {len(cards[0])} canciones por cartón · {len(cards)} cartones únicos",
        "",
        "---",
        "",
    ]

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


# ─── Validación de logo ───────────────────────────────────────────────────────


def validate_logo(logo_path: Path) -> Path:
    """Valida que el logo existe y es un formato soportado."""
    if not logo_path.exists():
        raise FileNotFoundError(f"❌ Logo no encontrado: {logo_path}")

    supported = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".tif"}
    if logo_path.suffix.lower() not in supported:
        raise ValueError(
            f"❌ Formato de logo no soportado: {logo_path.suffix}\n"
            f"   Formatos válidos: {', '.join(sorted(supported))}\n"
            f"   Nota: SVG no es compatible con python-pptx. Usa PNG o JPG."
        )
    return logo_path


# ─── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genera cartones de bingo musical con logo de empresa en PPTX",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  # Desde listado de canciones (genera cartones nuevos + PPTX con logo)
  python scripts/generate-bingo-branded.py \\
    --songs-md cartones/navidad/pequeños/listado-canciones-navidad-pequeños.md \\
    --output mi-bingo-branded.pptx \\
    --logo assets/icons/icon-512.png \\
    --category "Navidad" --size "Pequeños" \\
    --songs-per-card 8 --num-cards 20 --theme navidad

  # Desde cartones ya existentes en Markdown
  python scripts/generate-bingo-branded.py \\
    --cards-md cartones/navidad/medianos/cartones-navidad-medianos.md \\
    --output mi-bingo-branded.pptx \\
    --logo mi-logo-empresa.png \\
    --category "Mi Empresa - Navidad"
        """,
    )

    # Fuente de datos (una de las dos es obligatoria)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument(
        "--songs-md",
        help="Ruta al .md con listado numerado de canciones (genera cartones nuevos)",
    )
    source.add_argument(
        "--cards-md",
        help="Ruta al .md con cartones ya generados (los carga directamente)",
    )

    # Salida
    parser.add_argument("--output", "-o", required=True, help="Ruta del archivo PPTX de salida")
    parser.add_argument(
        "--also-md",
        default=None,
        help="Si se indica, también guarda los cartones en Markdown",
    )

    # Logo
    parser.add_argument("--logo", required=True, help="Ruta a imagen del logo (PNG/JPG)")
    parser.add_argument(
        "--logo-width", type=float, default=0.9, help="Ancho del logo en pulgadas (default: 0.9)"
    )
    parser.add_argument(
        "--logo-pos",
        default="top-left",
        choices=["top-left", "top-right", "top-center"],
        help="Posición del logo (default: top-left)",
    )

    # Categoría y tamaño
    parser.add_argument("--category", default="Bingo Musical", help="Nombre de la categoría")
    parser.add_argument("--size", default="", help="Tamaño (Pequeños/Medianos/Grandes)")

    # Generación de cartones (solo si se usa --songs-md)
    parser.add_argument("--songs-per-card", type=int, default=12, help="Canciones por cartón (default: 12)")
    parser.add_argument("--num-cards", type=int, default=50, help="Número de cartones a generar (default: 50)")
    parser.add_argument("--seed", type=int, default=None, help="Semilla para reproducibilidad")

    # Estilo
    parser.add_argument(
        "--theme",
        default="default",
        choices=sorted(THEMES.keys()),
        help="Tema visual (default: default)",
    )
    parser.add_argument(
        "--style",
        default="list",
        choices=["list", "grid3x3"],
        help="Estilo de cartón: list (vertical) o grid3x3 (cuadrícula, max 8 canciones)",
    )
    parser.add_argument(
        "--cards-per-slide",
        type=int,
        default=None,
        choices=[1, 2, 3],
        help="Forzar número de cartones por diapositiva (auto si no se indica)",
    )

    args = parser.parse_args()

    # ── Validar logo ──
    logo = validate_logo(Path(args.logo))
    print(f"\n🎨 Generador de Bingo Musical Branded (con Logo)\n")
    print(f"   Logo: {logo}")
    print(f"   Posición: {args.logo_pos} ({args.logo_width}\")")
    print(f"   Tema: {args.theme}")
    print(f"   Estilo: {args.style}")
    print()

    # ── Obtener cartones ──
    if args.songs_md:
        # Generar cartones desde listado
        songs_path = Path(args.songs_md)
        if not songs_path.exists():
            raise FileNotFoundError(f"❌ Archivo de canciones no encontrado: {songs_path}")

        songs = parse_song_list(songs_path)
        print(f"📋 Canciones cargadas: {len(songs)}")

        if len(songs) < args.songs_per_card:
            raise SystemExit(
                f"❌ No hay suficientes canciones ({len(songs)}) "
                f"para {args.songs_per_card} por cartón"
            )

        if args.seed is not None:
            random.seed(args.seed)

        cards = generate_unique_cards(songs, args.songs_per_card, args.num_cards)
        print(f"🎲 Cartones generados: {len(cards)} ({args.songs_per_card} canciones cada uno)")

        # Guardar MD si se solicita
        if args.also_md:
            md_out = Path(args.also_md)
            size_label = args.size or f"{args.songs_per_card} canciones"
            write_cards_markdown(md_out, args.category, size_label, cards)
            print(f"📄 Markdown guardado: {md_out}")
    else:
        # Cargar cartones existentes
        cards_path = Path(args.cards_md)
        if not cards_path.exists():
            raise FileNotFoundError(f"❌ Archivo de cartones no encontrado: {cards_path}")

        cards = load_cards_from_markdown(cards_path)
        if not cards:
            raise ValueError(f"❌ No se encontraron cartones en {cards_path}")
        print(f"📋 Cartones cargados: {len(cards)} ({len(cards[0])} canciones cada uno)")

    # ── Validar estilo grid3x3 ──
    if args.style == "grid3x3" and len(cards[0]) > 8:
        print(
            f"⚠️  grid3x3 solo soporta hasta 8 canciones. "
            f"Los cartones tienen {len(cards[0])}. Cambiando a estilo 'list'."
        )
        args.style = "list"

    # ── Preparar tema ──
    theme = THEMES[args.theme]
    theme_colors = {
        "icon": theme["icon"],
        "background": theme["background"],
        "title": theme["title"],
        "subtitle": theme["subtitle"],
        "border": theme["border"],
        "checkbox": theme["checkbox"],
    }

    # ── Generar PPTX ──
    categoria_title = args.category
    if args.size:
        categoria_title += f" - {args.size} ({len(cards[0])} canciones)"

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"\n📊 Generando PPTX branded...")
    result = create_bingo_pptx(
        cards=cards,
        categoria=categoria_title,
        theme_colors=theme_colors,
        output_file=output_path,
        card_style=args.style,
        force_cards_per_slide=args.cards_per_slide,
        logo_path=logo,
        logo_width=args.logo_width,
        logo_position=args.logo_pos,
    )

    if result:
        print(f"\n{'='*60}")
        print(f"✅ PPTX BRANDED generado exitosamente!")
        print(f"{'='*60}")
        print(f"   📁 Archivo: {result['archivo']}")
        print(f"   📋 Diapositivas: {result['slides']}")
        print(f"   🎯 Cartones: {result['cartones']}")
        print(f"   📐 Layout: {result['cartones_por_slide']} cartones/slide ({result['layout']})")
        print(f"   🖼️  Logo: {logo.name} ({args.logo_pos})")
        print()
    else:
        print("❌ Error al generar el PPTX")
        sys.exit(1)


if __name__ == "__main__":
    main()
