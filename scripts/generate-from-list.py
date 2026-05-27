#!/usr/bin/env python3
"""Generador genérico de cartones (únicos) a partir de una lista.

Entrada principal:
- Un Markdown con lista numerada de canciones (ej: 1. Canción - Artista)

Salida:
- Un Markdown con N cartones (## Cartón X) y K canciones por cartón
- (Opcional) Un PPTX usando el mismo layout que el generador del proyecto

Uso en modo asistente (sin argumentos):
  python scripts/generate-from-list.py

Uso en modo comando:
  python scripts/generate-from-list.py --songs-md ... --out-md ... --category ... \
    --size ... --songs-per-card 12 --num-cards 150

Notas de unicidad:
- Usa muestreo aleatorio con control de solape y balance de apariciones.
- Con --seed se garantiza reproducibilidad exacta.
"""

from __future__ import annotations

import argparse
import random
import re
import shutil
import subprocess
import sys
from math import comb
from pathlib import Path

from pptx_utils import create_bingo_pptx, load_cards_from_markdown


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


def _convert_pptx_to_pdf_with_soffice(pptx_path: Path, pdf_out: Path) -> bool:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        return False

    pdf_out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        soffice,
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        str(pdf_out.parent),
        str(pptx_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return False

    generated = pdf_out.parent / f"{pptx_path.stem}.pdf"
    if generated.exists() and generated != pdf_out:
        if pdf_out.exists():
            pdf_out.unlink()
        generated.replace(pdf_out)

    return pdf_out.exists()


def _convert_pptx_to_pdf_with_powerpoint(pptx_path: Path, pdf_out: Path) -> bool:
    if sys.platform != "win32":
        return False

    safe_pptx = str(pptx_path.resolve()).replace("'", "''")
    safe_pdf = str(pdf_out.resolve()).replace("'", "''")

    script = f"""
$ErrorActionPreference = 'Stop'
$pptxPath = '{safe_pptx}'
$pdfPath = '{safe_pdf}'
$ppt = $null
$presentation = $null
try {{
  $ppt = New-Object -ComObject PowerPoint.Application
  $presentation = $ppt.Presentations.Open($pptxPath, $true, $true, $false)
  $presentation.SaveAs($pdfPath, 32)
}}
finally {{
  if ($presentation -ne $null) {{ $presentation.Close() }}
  if ($ppt -ne $null) {{ $ppt.Quit() }}
}}
"""

    result = subprocess.run(
        ["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return False

    return pdf_out.exists()


def export_pptx_to_pdf(pptx_path: Path, pdf_out: Path) -> Path:
    if not pptx_path.exists():
        raise RuntimeError(f"No existe PPTX para exportar a PDF: {pptx_path}")

    ok = _convert_pptx_to_pdf_with_soffice(pptx_path, pdf_out)
    if not ok:
        ok = _convert_pptx_to_pdf_with_powerpoint(pptx_path, pdf_out)

    if not ok:
        raise RuntimeError(
            "No se pudo convertir PPTX a PDF automáticamente. "
            "Instala LibreOffice (soffice) o Microsoft PowerPoint para habilitar la exportación."
        )

    return pdf_out


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


def _distribution_score(
    counts: dict[str, int],
    candidate: set[str],
    songs: list[str],
    generated_cards: int,
    songs_per_card: int,
) -> float:
    mean_after = ((generated_cards + 1) * songs_per_card) / len(songs)
    score = 0.0
    for song in songs:
        projected = counts[song] + (1 if song in candidate else 0)
        diff = projected - mean_after
        score += diff * diff
    return score


def _usage_stats(cards: list[list[str]]) -> dict[str, int]:
    usage: dict[str, int] = {}
    for card in cards:
        for song in card:
            usage[song] = usage.get(song, 0) + 1
    return usage


def validate_generated_cards(
    cards: list[list[str]], songs_source: list[str]
) -> tuple[bool, dict[str, object]]:
    source_set = set(songs_source)
    duplicate_cards = 0
    cards_with_internal_duplicates = 0
    invalid_songs: set[str] = set()

    seen_cards: set[tuple[str, ...]] = set()
    used_songs: set[str] = set()

    for card in cards:
        card_set = set(card)
        if len(card_set) != len(card):
            cards_with_internal_duplicates += 1

        key = tuple(sorted(card))
        if key in seen_cards:
            duplicate_cards += 1
        else:
            seen_cards.add(key)

        used_songs.update(card_set)
        for song in card_set:
            if song not in source_set:
                invalid_songs.add(song)

    missing_songs = sorted(source_set - used_songs)
    is_valid = duplicate_cards == 0 and cards_with_internal_duplicates == 0 and len(invalid_songs) == 0

    return is_valid, {
        "duplicate_cards": duplicate_cards,
        "cards_with_internal_duplicates": cards_with_internal_duplicates,
        "missing_songs": missing_songs,
        "invalid_songs": sorted(invalid_songs),
        "used_songs": len(used_songs),
        "total_songs": len(source_set),
    }


def generate_unique_cards(
    songs: list[str],
    songs_per_card: int,
    num_cards: int,
    max_overlap_ratio: float = 0.6,
    candidate_attempts: int = 400,
) -> list[list[str]]:
    n = len(songs)
    total = comb(n, songs_per_card)
    if total < num_cards:
        raise RuntimeError(
            f"No hay combinaciones suficientes para {num_cards} cartones únicos: C({n},{songs_per_card})={total}."
        )

    max_overlap_allowed = min(songs_per_card - 1, max(0, int(songs_per_card * max_overlap_ratio)))

    counts = {song: 0 for song in songs}
    seen: set[tuple[str, ...]] = set()
    card_sets: list[set[str]] = []
    cards: list[list[str]] = []

    for generated in range(num_cards):
        chosen_candidate: list[str] | None = None
        overlap_limit = max_overlap_allowed

        while chosen_candidate is None and overlap_limit < songs_per_card:
            best_candidate: list[str] | None = None
            best_score = float("inf")

            for _ in range(candidate_attempts):
                candidate = random.sample(songs, songs_per_card)
                key = tuple(sorted(candidate))
                if key in seen:
                    continue

                candidate_set = set(candidate)
                max_overlap_found = 0
                total_overlap = 0
                for previous in card_sets:
                    overlap = len(candidate_set & previous)
                    if overlap > max_overlap_found:
                        max_overlap_found = overlap
                    total_overlap += overlap

                if max_overlap_found > overlap_limit:
                    continue

                score = _distribution_score(counts, candidate_set, songs, generated, songs_per_card)
                score += total_overlap * 0.15

                if score < best_score:
                    best_score = score
                    best_candidate = candidate

            if best_candidate is not None:
                chosen_candidate = best_candidate
            else:
                overlap_limit += 1

        if chosen_candidate is None:
            raise RuntimeError(
                f"No se pudo construir el cartón {generated + 1} cumpliendo unicidad/diversidad. "
                "Prueba aumentando canciones, reduciendo cartones o relajando solape."
            )

        candidate_set = set(chosen_candidate)
        seen.add(tuple(sorted(chosen_candidate)))
        card_sets.append(candidate_set)
        for song in candidate_set:
            counts[song] += 1

        random.shuffle(chosen_candidate)
        cards.append(chosen_candidate)

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


def _ask(prompt: str, default: str = "") -> str:
    """Pregunta con valor por defecto. Enter acepta el defecto."""
    hint = f" [{default}]" if default else ""
    try:
        value = input(f"{prompt}{hint}: ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\nCancelado.")
        sys.exit(0)
    return value if value else default


def _ask_path(prompt: str, default: str) -> str:
    """Pregunta una ruta. Enter o S/s/Y/y aceptan el defecto."""
    try:
        value = input(f"{prompt} [{default}]\n  > ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\nCancelado.")
        sys.exit(0)
    if not value or value.lower() in ("s", "si", "y", "yes", "enter"):
        return default
    return value


def _ask_int(prompt: str, default: int) -> int:
    while True:
        raw = _ask(prompt, str(default))
        try:
            return int(raw)
        except ValueError:
            print(f"  ⚠️  Introduce un número entero.")


def _ask_bool(prompt: str, default: bool = True) -> bool:
    hint = "S/n" if default else "s/N"
    raw = _ask(f"{prompt} ({hint})", "").lower()
    if raw in ("s", "si", "sí", "y", "yes"):
        return True
    if raw in ("n", "no"):
        return False
    return default


def _find_song_lists() -> list[Path]:
    """Busca ficheros de listado en ./cartones/ para ofrecer como sugerencia."""
    base = Path("cartones")
    if not base.exists():
        return []
    return sorted(base.rglob("listado-canciones*.md"))[:20]


def run_wizard() -> argparse.Namespace:
    """Modo asistente interactivo. Devuelve un Namespace compatible con args."""
    print("\n" + "=" * 58)
    print("  GENERADOR DE CARTONES -- MODO ASISTENTE")
    print("=" * 58)

    # PASO 1 - Listado de canciones
    print("\n[PASO 1] Listado de canciones")
    listas = _find_song_lists()
    if listas:
        print("  Listados encontrados en ./cartones/:")
        for i, p in enumerate(listas, 1):
            print(f"    {i:2d}. {p}")
        sel = _ask("  Numero o ruta completa", "1")
        try:
            songs_md = Path(listas[int(sel) - 1])
        except (ValueError, IndexError):
            songs_md = Path(sel)
    else:
        songs_md = Path(_ask("  Ruta al .md con las canciones numeradas"))

    if not songs_md.exists():
        print(f"ERROR: No se encuentra: {songs_md}")
        sys.exit(1)

    songs = parse_song_list(songs_md)
    print(f"  OK - {len(songs)} canciones cargadas.")

    out_folder = songs_md.parent
    category_guess = out_folder.name

    # PASO 2 - Nombre
    print("\n[PASO 2] Nombre del evento / categoria")
    category = _ask("  Nombre (titulo del PPTX)", category_guess)
    size = _ask("  Tamano (Pequenos / Medianos / Grandes)", "Medianos")

    # PASO 3 - Configuracion de cartones
    print("\n[PASO 3] Configuracion de cartones")
    size_defaults = {"pequenos": 8, "medianos": 12, "grandes": 20}
    spk_default = size_defaults.get(size.lower().replace("\xe3", "e").replace("\xb1", "n"), 12)
    songs_per_card = _ask_int(f"  Canciones por carton (max {len(songs)})", spk_default)
    num_cards = _ask_int("  Numero de cartones a generar", 150)
    seed_raw = _ask("  Semilla de reproducibilidad (Enter = aleatoria)", "")
    seed = int(seed_raw) if seed_raw.isdigit() else None
    strict = _ask_bool("  Verificar que salgan TODAS las canciones?", True)

    # Rutas de salida: automaticas, junto al listado
    slug = category.lower().replace(" ", "-")
    size_slug = size.lower()
    out_md = out_folder / f"cartones-{slug}-{size_slug}-{num_cards}.md"
    pptx_auto = str(out_md.with_suffix(".pptx"))
    print(f"\n  Salida automatica en: {out_folder}")
    print(f"  MD  -> {out_md.name}")

    # PASO 4 - PPTX/PDF
    print("\n[PASO 4] PowerPoint (PPTX) y PDF")
    gen_pptx = _ask_bool("  Generar PPTX?", True)
    pptx_out = logo = None
    pdf_out = None
    official_logo = None
    logo_width = 0.55
    official_logo_scale = 0.8
    custom_logo_scale = 1.5
    logo_per_card = False
    card_style = "list"
    no_slide_title = False
    no_card_number = False
    force_cps = None
    footer_text = "bingomusicalgratis.es"
    theme = "default"
    font_title = None
    font_artist = None

    if gen_pptx:
        pptx_out = pptx_auto
        pdf_auto = str(Path(pptx_out).with_suffix(".pdf"))
        print(f"  PPTX -> {Path(pptx_out).name}")
        gen_pdf = _ask_bool("  Generar PDF imprimible desde el PPTX?", True)
        if gen_pdf:
            pdf_out = pdf_auto
            print(f"  PDF  -> {Path(pdf_out).name}")

        official_logo_default = Path("images/logooficial.png")
        if official_logo_default.exists():
            official_logo = str(official_logo_default)
            print(f"  Logo oficial detectado: {official_logo_default}")
        else:
            official_logo = None

        logo_candidates = list(out_folder.glob("logo*.*")) + list(out_folder.glob("*.png"))
        if logo_candidates:
            print(f"  Logo encontrado: {logo_candidates[0]}")
            use_logo = _ask_bool("  Usar ese logo?", True)
            logo = str(logo_candidates[0]) if use_logo else None
        else:
            logo_raw = _ask("  Ruta al logo (Enter para omitir)", "")
            logo = logo_raw if logo_raw else None

        if logo:
            logo_width = float(_ask("  Ancho del logo en pulgadas", "0.55"))
            custom_logo_scale = float(_ask("  Escala logo izquierdo (cliente/categoria) [1.5 recomendado]", "1.5"))
            official_logo_scale = float(_ask("  Escala logo derecho OFICIAL (logo MIO/Chechu) [0.8 recomendado]", "0.8"))
            logo_per_card = _ask_bool("  Logo dentro de cada carton (en vez de en slide)?", True)

        print("\n  Estilos disponibles:")
        print("    list    -> Lista vertical con checkboxes")
        print("    grid    -> Cuadricula (titulo + artista por celda)  <- recomendado")
        print("    grid3x3 -> Cuadricula 3x3 con comodin central")
        card_style = _ask("  Estilo de carton", "grid")

        if card_style == "grid":
            no_slide_title = _ask_bool("  Ocultar titulo de diapositiva?", True)
            no_card_number = _ask_bool("  Ocultar cabecera 'Carton X/N'?", True)
            cps_raw = _ask("  Cartones por diapositiva (1 / 2 / 4)", "4")
            force_cps = int(cps_raw) if cps_raw in ("1", "2", "3", "4") else 4
            footer_text = _ask("  Texto del pie de cada carton", "bingomusicalgratis.es")

        font_raw = _ask("  Fuente para titulos (Enter = defecto del sistema)", "")
        font_title = font_raw if font_raw else None
        font_artist = None  # artista usa siempre fuente del sistema

        theme = _ask("  Tema de color (default / infantil)", "default")
        if theme not in THEMES:
            theme = "default"

    # Resumen
    print("\n" + "-" * 58)
    print("  RESUMEN")
    print(f"  Listado  : {songs_md}  ({len(songs)} canciones)")
    print(f"  Categoria: {category} -- {size}")
    print(f"  Cartones : {num_cards}  x  {songs_per_card} canciones c/u")
    print(f"  MD salida: {out_md.name}")
    if gen_pptx:
        print(f"  PPTX     : {Path(pptx_out).name}")
        print(f"  Estilo   : {card_style}  |  {force_cps} por slide  |  logo={'si' if logo else 'no'}")
    print("-" * 58)
    ok = _ask_bool("  Empezar generacion?", True)
    if not ok:
        print("Cancelado.")
        sys.exit(0)

    return argparse.Namespace(
        songs_md=str(songs_md),
        out_md=str(out_md),
        category=category,
        size=size,
        songs_per_card=songs_per_card,
        num_cards=num_cards,
        seed=seed,
        max_overlap_ratio=0.6,
        candidate_attempts=400,
        pptx_out=pptx_out,
        pdf_out=pdf_out,
        theme=theme,
        logo=logo,
        official_logo=official_logo,
        logo_width=logo_width,
        official_logo_scale=official_logo_scale,
        custom_logo_scale=custom_logo_scale,
        logo_position="top-right",
        card_style=card_style,
        no_slide_title=no_slide_title,
        no_card_number=no_card_number,
        logo_per_card=logo_per_card,
        footer_text=footer_text,
        force_cards_per_slide=force_cps,
        strict_coverage=strict,
        font_title=font_title,
        font_artist=font_artist,
    )


def main() -> None:
    # Sin argumentos → modo asistente interactivo
    if len(sys.argv) == 1:
        args = run_wizard()
    else:
        parser = argparse.ArgumentParser(description="Genera cartones únicos desde una lista")
        parser.add_argument("--songs-md", required=True, help="Ruta al .md con la lista numerada")
        parser.add_argument("--out-md", required=True, help="Ruta del .md de salida con los cartones")
        parser.add_argument("--category", required=True, help="Nombre de categoría para el título")
        parser.add_argument("--size", required=True, help="Nombre del tamaño (Pequeños/Medianos/...)")
        parser.add_argument("--songs-per-card", type=int, required=True)
        parser.add_argument("--num-cards", type=int, required=True)
        parser.add_argument("--seed", type=int, default=None, help="Semilla para reproducibilidad")
        parser.add_argument("--max-overlap-ratio", type=float, default=0.6)
        parser.add_argument("--candidate-attempts", type=int, default=400)
        parser.add_argument("--pptx-out", default=None)
        parser.add_argument("--pdf-out", default=None, help="Ruta del PDF de salida (requiere --pptx-out)")
        parser.add_argument("--pdf", action="store_true", help="Genera PDF junto al PPTX (mismo nombre)")
        parser.add_argument("--theme", default="default", choices=sorted(THEMES.keys()))
        parser.add_argument("--logo", default=None)
        parser.add_argument("--official-logo", default="images/logooficial.png", help="Ruta al logo oficial (izquierda en cada cartón)")
        parser.add_argument("--logo-width", type=float, default=0.8)
        parser.add_argument("--official-logo-scale", type=float, default=0.8, help="Escala del logo oficial (derecha, logo MIO/Chechu)")
        parser.add_argument("--custom-logo-scale", type=float, default=1.5, help="Escala del logo personalizado (izquierda)")
        parser.add_argument("--logo-position", default="top-left", choices=["top-left", "top-right", "top-center"])
        parser.add_argument("--card-style", default="list", choices=["list", "grid", "grid3x3"])
        parser.add_argument("--no-slide-title", action="store_true")
        parser.add_argument("--no-card-number", action="store_true")
        parser.add_argument("--logo-per-card", action="store_true")
        parser.add_argument("--footer-text", default="bingomusicalgratis.es")
        parser.add_argument("--force-cards-per-slide", type=int, default=None, choices=[1, 2, 3, 4])
        parser.add_argument("--strict-coverage", action="store_true")
        parser.add_argument("--font-title", default=None, help="Fuente para el titulo de cada cancion (ej: 'Scriptina Pro Light')")
        parser.add_argument("--font-artist", default=None, help="Fuente para el artista de cada cancion")
        args = parser.parse_args()

    if getattr(args, "pdf", False):
        if not args.pptx_out:
            raise SystemExit("❌ --pdf requiere --pptx-out")
        if not getattr(args, "pdf_out", None):
            args.pdf_out = str(Path(args.pptx_out).with_suffix(".pdf"))

    if getattr(args, "pdf_out", None) and not args.pptx_out:
        raise SystemExit("❌ --pdf-out requiere --pptx-out")

    songs_md = Path(args.songs_md)
    out_md = Path(args.out_md)

    if args.seed is not None:
        random.seed(args.seed)

    songs = parse_song_list(songs_md)

    if not (0 <= args.max_overlap_ratio <= 1):
        raise SystemExit("❌ --max-overlap-ratio debe estar entre 0 y 1")
    if args.candidate_attempts < 50:
        raise SystemExit("❌ --candidate-attempts debe ser >= 50")

    if len(songs) < args.songs_per_card:
        raise SystemExit(
            f"❌ No hay suficientes canciones ({len(songs)}) para {args.songs_per_card} por cartón"
        )

    cards = generate_unique_cards(
        songs,
        args.songs_per_card,
        args.num_cards,
        max_overlap_ratio=args.max_overlap_ratio,
        candidate_attempts=args.candidate_attempts,
    )

    # Flujo obligatorio: primero guardar Markdown para revisión humana
    write_cards_markdown(out_md, args.category, args.size, cards)

    # Validación sobre el archivo real generado, no sobre memoria
    cards_from_md = load_cards_from_markdown(out_md)
    is_valid, report = validate_generated_cards(cards_from_md, songs)

    if not is_valid:
        raise RuntimeError(
            "Validación fallida del Markdown generado: "
            f"cartones duplicados={report['duplicate_cards']}, "
            f"cartones con canciones repetidas={report['cards_with_internal_duplicates']}, "
            f"canciones no válidas={len(report['invalid_songs'])}."
        )

    if args.strict_coverage and report["missing_songs"]:
        raise RuntimeError(
            "Validación de cobertura fallida: hay canciones del listado que no aparecen en ningún cartón. "
            f"Faltan: {len(report['missing_songs'])}"
        )

    usage = _usage_stats(cards_from_md)
    min_usage = min(usage.values())
    max_usage = max(usage.values())

    print("✅ Cartones generados")
    print(f"   - Canciones: {len(songs)}")
    print(f"   - Cartones: {len(cards)}")
    print(f"   - Repetición por canción (min/max): {min_usage}/{max_usage}")
    print(f"   - Salida MD: {out_md}")
    print(
        f"   - Cobertura canciones: {report['used_songs']}/{report['total_songs']}"
    )
    if report["missing_songs"]:
        print(f"   - ⚠️ Canciones no usadas: {len(report['missing_songs'])}")

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
        create_bingo_pptx(
            cards_from_md,
            categoria_title,
            theme_colors,
            Path(args.pptx_out),
            logo_path=args.logo,
            official_logo_path=getattr(args, 'official_logo', None),
            logo_width=args.logo_width,
            official_logo_scale=getattr(args, 'official_logo_scale', 0.8),
            custom_logo_scale=getattr(args, 'custom_logo_scale', 1.5),
            logo_position=args.logo_position,
            card_style=args.card_style,
            show_slide_title=not args.no_slide_title,
            show_card_number=not args.no_card_number,
            logo_on_each_card=args.logo_per_card,
            footer_text=args.footer_text,
            force_cards_per_slide=args.force_cards_per_slide,
            font_title=getattr(args, 'font_title', None),
            font_artist=getattr(args, 'font_artist', None),
        )

        if getattr(args, "pdf_out", None):
            pdf_file = export_pptx_to_pdf(Path(args.pptx_out), Path(args.pdf_out))
            print(f"✅ PDF guardado: {pdf_file}")


if __name__ == "__main__":
    main()
