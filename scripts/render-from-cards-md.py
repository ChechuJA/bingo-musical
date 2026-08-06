#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

from pptx_utils import create_bingo_pptx


def load_cards_from_markdown_flexible(md_file: Path) -> list[list[str]]:
    content = md_file.read_text(encoding="utf-8")
    cards: list[list[str]] = []
    current_card: list[str] = []

    classic_re = re.compile(r"^\s*\d+\.\s+(.+?)\s*$")
    dashed_re = re.compile(r"^\s*\d+\s*-\s*(?:\d+\s+)?(.+?)\s*$")

    for line in content.splitlines():
        if line.startswith("## Cartón") or line.startswith("## Carton"):
            if current_card:
                cards.append(current_card)
                current_card = []
            continue

        m1 = classic_re.match(line)
        if m1:
            current_card.append(m1.group(1).strip())
            continue

        m2 = dashed_re.match(line)
        if m2:
            current_card.append(m2.group(1).strip())

    if current_card:
        cards.append(current_card)

    return cards


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
    ok = _convert_pptx_to_pdf_with_soffice(pptx_path, pdf_out)
    if not ok:
        ok = _convert_pptx_to_pdf_with_powerpoint(pptx_path, pdf_out)
    if not ok:
        raise RuntimeError("No se pudo convertir PPTX a PDF.")
    return pdf_out


def load_song_numbers(songs_md: Path) -> dict[str, int]:
    """Parsea un listado maestro y devuelve {nombre_cancion: numero_pista}."""
    import re
    mapping: dict[str, int] = {}
    for line in songs_md.read_text(encoding="utf-8").splitlines():
        m = re.match(r'^\s*(\d+)\.\s+(.+?)\s*$', line)
        if m:
            num = int(m.group(1))
            song = m.group(2).strip()
            mapping[song] = num
    return mapping


def main() -> None:
    parser = argparse.ArgumentParser(description="Renderiza PPTX/PDF desde un Markdown de cartones ya existente")
    parser.add_argument("--cards-md", required=True)
    parser.add_argument("--songs-md", default=None, help="Listado maestro de canciones para numerar correctamente")
    parser.add_argument("--category", required=True)
    parser.add_argument("--pptx-out", required=True)
    parser.add_argument("--pdf", action="store_true")
    parser.add_argument("--pdf-out", default=None)
    parser.add_argument("--logo", default=None, help="Ruta al logo principal/personalizado")
    parser.add_argument("--official-logo", default="images/logooficial.png")
    parser.add_argument("--no-official-logo", action="store_true", help="No usar logo oficial secundario")
    parser.add_argument("--logo-width", type=float, default=0.55)
    parser.add_argument("--custom-logo-scale", type=float, default=1.5)
    parser.add_argument("--official-logo-scale", type=float, default=0.8)
    parser.add_argument("--logo-position", default="top-left", choices=["top-left", "top-right", "top-center"])
    parser.add_argument("--force-cards-per-slide", type=int, default=4, choices=[1, 2, 3, 4])
    parser.add_argument("--grid-cols", type=int, default=3, help="Columnas de la cuadrícula cuando card_style=grid")
    parser.add_argument("--two-cards-layout", default="side-by-side", choices=["side-by-side", "stacked"], help="Layout cuando hay 2 cartones por slide")
    parser.add_argument("--grid-title-font-max", type=int, default=10, help="Tamaño máximo de fuente del título en celdas grid")
    parser.add_argument("--grid-title-font-min", type=int, default=7, help="Tamaño mínimo de fuente del título en celdas grid")
    parser.add_argument("--grid-font-scale", type=float, default=9.0, help="Factor de escala de fuente para celdas grid")
    args = parser.parse_args()

    cards_md = Path(args.cards_md)
    pptx_out = Path(args.pptx_out)
    cards = load_cards_from_markdown_flexible(cards_md)
    if not cards:
        raise RuntimeError(f"No se pudieron cargar cartones desde: {cards_md}")

    source_song_numbers: dict[str, int] | None = None
    if args.songs_md:
        songs_md_path = Path(args.songs_md)
        if songs_md_path.exists():
            source_song_numbers = load_song_numbers(songs_md_path)
            print(f"📋 Listado maestro cargado: {len(source_song_numbers)} canciones numeradas")
        else:
            print(f"⚠️  songs-md no encontrado, se usarán números de posición: {args.songs_md}")

    theme_colors = {
        "icon": "🎵",
        "background": (250, 250, 250),
        "title": (60, 60, 60),
        "subtitle": (90, 90, 90),
        "border": (60, 60, 60),
        "checkbox": (120, 120, 120),
    }

    official_logo = None if args.no_official_logo else args.official_logo

    create_bingo_pptx(
        cards,
        args.category,
        theme_colors,
        pptx_out,
        source_song_numbers=source_song_numbers,
        logo_path=args.logo,
        official_logo_path=official_logo,
        logo_width=args.logo_width,
        official_logo_scale=args.official_logo_scale,
        custom_logo_scale=args.custom_logo_scale,
        logo_position=args.logo_position,
        card_style="grid",
        show_slide_title=False,
        show_card_number=False,
        logo_on_each_card=True,
        footer_text="bingomusicalgratis.es",
        force_cards_per_slide=args.force_cards_per_slide,
        font_title="Scriptina Pro Light",
        grid_columns=args.grid_cols,
        two_cards_layout=args.two_cards_layout,
        grid_title_font_max=args.grid_title_font_max,
        grid_title_font_min=args.grid_title_font_min,
        grid_font_scale=args.grid_font_scale,
    )

    if args.pdf:
        pdf_out = Path(args.pdf_out) if args.pdf_out else pptx_out.with_suffix(".pdf")
        export_pptx_to_pdf(pptx_out, pdf_out)
        print(f"✅ PDF guardado: {pdf_out}")


if __name__ == "__main__":
    main()
