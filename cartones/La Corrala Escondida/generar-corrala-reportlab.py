#!/usr/bin/env python3
"""Generador PDF estilo Corrala usando ReportLab.

Diseno objetivo:
- Cabecera negra con titulo en blanco
- Insignia circular con numero de carton
- Rejilla 3x4 (12 canciones)
- Franja inferior negra con texto de nota/asterisco
"""

from __future__ import annotations

import argparse
import random
import re
import sys
from dataclasses import dataclass
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.units import cm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas
except ImportError as exc:  # pragma: no cover
    raise SystemExit("ReportLab no esta instalado. Ejecuta: pip install reportlab") from exc


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SONGS = Path(__file__).resolve().parent / "listado-canciones-la-corrala-escondida-2026-07.md"
LINE_RE = re.compile(r"^\s*(\d+)\.\s+(.*\S)\s*$")
SONG_TITLE_FONT = "Helvetica-BoldOblique"
ARTIST_FONT = "Helvetica-Oblique"


def resolve_title_font() -> str:
    """Registra una fuente manuscrita instalada en Windows y devuelve su alias."""
    candidates = [
        Path("C:/Windows/Fonts/segoescb.ttf"),
        Path("C:/Windows/Fonts/segoesc.ttf"),
        Path("C:/Windows/Fonts/FRSCRIPT.TTF"),
        Path("C:/Windows/Fonts/Gabriola.ttf"),
    ]
    for font_path in candidates:
        if font_path.exists():
            try:
                pdfmetrics.registerFont(TTFont("CorralaScript", str(font_path)))
                return "CorralaScript"
            except Exception:
                continue
    return "Times-BoldItalic"


@dataclass(frozen=True)
class SongEntry:
    num: int
    title: str
    artist: str


def split_title_artist(raw: str) -> tuple[str, str]:
    if " - " in raw:
        left, right = raw.split(" - ", 1)
        return left.strip(), right.strip()
    return raw.strip(), ""


def parse_songs(md_path: Path) -> list[SongEntry]:
    songs: list[SongEntry] = []
    for raw in md_path.read_text(encoding="utf-8").splitlines():
        match = LINE_RE.match(raw)
        if not match:
            continue
        num = int(match.group(1))
        title_artist = match.group(2).strip()
        title, artist = split_title_artist(title_artist)
        songs.append(SongEntry(num=num, title=title, artist=artist))

    if not songs:
        raise ValueError(f"No se encontraron canciones numeradas en: {md_path}")
    return songs


def build_cards(
    songs: list[SongEntry],
    total_cards: int,
    songs_per_card: int,
    seed: int | None,
    unique_cards: bool,
) -> list[list[SongEntry]]:
    if seed is not None:
        random.seed(seed)

    if songs_per_card > len(songs):
        raise ValueError("songs-per-card no puede ser mayor que el total de canciones")

    cards: list[list[SongEntry]] = []
    seen: set[tuple[int, ...]] = set()
    max_tries = total_cards * 700
    tries = 0

    while len(cards) < total_cards:
        tries += 1
        if tries > max_tries:
            raise RuntimeError(
                "No se pudieron generar suficientes cartones unicos. "
                "Reduce cartones o canciones por carton."
            )

        card = random.sample(songs, songs_per_card)
        key = tuple(sorted(entry.num for entry in card))
        if unique_cards and key in seen:
            continue

        if unique_cards:
            seen.add(key)
        cards.append(card)

    return cards


def wrap_text(c: canvas.Canvas, text: str, font: str, size: int, max_width: float, max_lines: int) -> list[str]:
    c.setFont(font, size)
    words = text.split()
    if not words:
        return [""]

    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if c.stringWidth(trial, font, size) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
            if len(lines) >= max_lines:
                break

    if current and len(lines) < max_lines:
        lines.append(current)

    if len(lines) > max_lines:
        lines = lines[:max_lines]

    joined = " ".join(lines)
    if joined != text and lines:
        last = lines[-1]
        while c.stringWidth(last + "...", font, size) > max_width and len(last) > 1:
            last = last[:-1]
        lines[-1] = last.rstrip() + "..."

    return lines


def draw_multiline_center(
    c: canvas.Canvas,
    lines: list[str],
    center_x: float,
    center_y: float,
    font: str,
    size: int,
    gap: float,
) -> None:
    c.setFont(font, size)
    total_h = (len(lines) - 1) * gap
    start_y = center_y + (total_h / 2)
    for i, line in enumerate(lines):
        c.drawCentredString(center_x, start_y - i * gap, line)



def draw_card(
    c: canvas.Canvas,
    x: float,
    y: float,
    card_w: float,
    card_h: float,
    card_num: int,
    songs: list[SongEntry],
    title_text: str,
    title_font: str,
    subtitle_text: str,
    footer_text: str,
) -> None:
    black = (0.0, 0.0, 0.0)
    white = (1.0, 1.0, 1.0)

    header_h = 2.35 * cm
    footer_h = 0.9 * cm

    c.setLineWidth(1)
    c.rect(x, y, card_w, card_h)

    c.setFillColorRGB(*black)
    c.rect(x, y + card_h - header_h, card_w, header_h, stroke=0, fill=1)

    # Centro el texto en el espacio libre a la izquierda del circulo del numero
    badge_r = 0.9 * cm
    badge_cx = x + card_w - 1.2 * cm
    text_area_w = badge_cx - badge_r - x - 0.3 * cm
    text_cx = x + text_area_w / 2

    c.setFillColorRGB(*white)
    c.setFont(title_font, 27)
    c.drawCentredString(text_cx, y + card_h - 0.95 * cm, title_text)

    c.setFont("Helvetica-Bold", 17)
    c.drawCentredString(text_cx, y + card_h - 1.78 * cm, subtitle_text)

    badge_cy = y + card_h - 1.17 * cm
    c.setFillColorRGB(*white)
    c.circle(badge_cx, badge_cy, badge_r, stroke=1, fill=1)

    c.setFillColorRGB(*black)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(badge_cx, badge_cy + 0.35 * cm, "CARTON N")
    c.setFont("Helvetica-Bold", 19)
    c.drawCentredString(badge_cx, badge_cy - 0.2 * cm, f"{card_num:03d}")

    grid_top = y + card_h - header_h
    grid_bottom = y + footer_h
    grid_h = grid_top - grid_bottom
    cell_w = card_w / 3.0
    cell_h = grid_h / 4.0

    c.setFillColorRGB(*black)
    for i in range(1, 3):
        c.line(x + i * cell_w, grid_bottom, x + i * cell_w, grid_top)
    for j in range(1, 4):
        c.line(x, grid_bottom + j * cell_h, x + card_w, grid_bottom + j * cell_h)

    for idx, song in enumerate(songs):
        row = idx // 3
        col = idx % 3
        cx = x + col * cell_w
        cy = grid_top - (row + 1) * cell_h

        cell_center_x = cx + cell_w / 2
        num_y = cy + cell_h - 1.05 * cm
        title_y = cy + cell_h / 2 + 0.15 * cm
        artist_y = cy + 0.55 * cm

        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(cell_center_x, num_y, str(song.num))

        title_lines = wrap_text(
            c,
            song.title,
            font=SONG_TITLE_FONT,
            size=11,
            max_width=cell_w - 0.45 * cm,
            max_lines=2,
        )
        draw_multiline_center(
            c,
            title_lines,
            center_x=cell_center_x,
            center_y=title_y,
            font=SONG_TITLE_FONT,
            size=11,
            gap=10,
        )

        artist_lines = wrap_text(
            c,
            song.artist,
            font=ARTIST_FONT,
            size=9,
            max_width=cell_w - 0.45 * cm,
            max_lines=2,
        )
        draw_multiline_center(
            c,
            artist_lines,
            center_x=cell_center_x,
            center_y=artist_y,
            font=ARTIST_FONT,
            size=9,
            gap=9,
        )

    c.setFillColorRGB(*black)
    c.rect(x, y, card_w, footer_h, stroke=0, fill=1)
    c.setFillColorRGB(*white)
    c.setFont("Helvetica-Bold", 8.3)
    c.drawCentredString(x + card_w / 2, y + 0.3 * cm, footer_text)


def draw_page_divider(c: canvas.Canvas, page_w: float, page_h: float) -> None:
    c.setDash(3, 3)
    c.setLineWidth(1)
    c.setStrokeColorRGB(0.55, 0.55, 0.55)
    c.line(page_w / 2, 0.9 * cm, page_w / 2, page_h - 0.9 * cm)
    c.setDash()
    c.setStrokeColorRGB(0.0, 0.0, 0.0)


def draw_dj_listing(c: canvas.Canvas, songs: list[SongEntry], page_w: float, page_h: float) -> None:
    c.showPage()
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(page_w / 2, page_h - 1.8 * cm, "LISTADO COMPLETO PARA DJ")

    c.setFont("Helvetica", 9.5)
    margin_x = 1.2 * cm
    col_gap = 0.8 * cm
    col_w = (page_w - margin_x * 2 - col_gap) / 2
    y_start = page_h - 3.0 * cm
    y_min = 1.2 * cm
    line_h = 0.52 * cm

    x = margin_x
    y = y_start

    for entry in songs:
        full_text = f"{entry.num:02d}. {entry.title}"
        if entry.artist:
            full_text += f" - {entry.artist}"

        c.drawString(x, y, full_text[:75])
        y -= line_h

        if y < y_min:
            if x == margin_x:
                x = margin_x + col_w + col_gap
                y = y_start
            else:
                c.showPage()
                c.setFont("Helvetica", 9.5)
                x = margin_x
                y = y_start


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Genera PDF La Corrala estilo cabecera negra")
    parser.add_argument("--songs-md", default=str(DEFAULT_SONGS), help="Listado .md numerado")
    parser.add_argument(
        "--out-pdf",
        default=str(Path(__file__).resolve().parent / "bingo-la-corrala-estilo-imagen-200.pdf"),
        help="Ruta del PDF de salida",
    )
    parser.add_argument("--event-title", default="La Corrala Escondida")
    parser.add_argument("--event-subtitle", default="BINGO MUSICAL")
    parser.add_argument(
        "--footer-text",
        default="* Los premios seran asignados a los primeros que canten Linea o bingo, sino habra desempate.",
    )
    parser.add_argument("--total-cards", type=int, default=200)
    parser.add_argument("--songs-per-card", type=int, default=12)
    parser.add_argument("--seed", type=int, default=20260708)
    parser.add_argument("--allow-duplicate-cards", action="store_true")
    parser.add_argument("--skip-dj-list", action="store_true")
    return parser


def main() -> None:
    args = build_parser().parse_args()

    songs_md = Path(args.songs_md)
    out_pdf = Path(args.out_pdf)

    if not songs_md.exists():
        raise SystemExit(f"No existe songs-md: {songs_md}")

    songs = parse_songs(songs_md)
    title_font = resolve_title_font()
    subtitle = args.event_subtitle.strip().strip("-").strip()
    subtitle = f"--- {subtitle} ---"
    cards = build_cards(
        songs=songs,
        total_cards=args.total_cards,
        songs_per_card=args.songs_per_card,
        seed=args.seed,
        unique_cards=not args.allow_duplicate_cards,
    )

    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(out_pdf), pagesize=landscape(A4))
    page_w, page_h = landscape(A4)

    margin_x = 0.55 * cm
    gap = 0.55 * cm
    card_w = (page_w - 2 * margin_x - gap) / 2
    card_h = page_h - 1.2 * cm
    base_y = 0.6 * cm

    for n, card_songs in enumerate(cards, 1):
        if n % 2 == 1:
            draw_page_divider(c, page_w, page_h)
            draw_card(
                c,
                x=margin_x,
                y=base_y,
                card_w=card_w,
                card_h=card_h,
                card_num=n,
                songs=card_songs,
                title_text=args.event_title,
                title_font=title_font,
                subtitle_text=subtitle,
                footer_text=args.footer_text,
            )
        else:
            draw_card(
                c,
                x=margin_x + card_w + gap,
                y=base_y,
                card_w=card_w,
                card_h=card_h,
                card_num=n,
                songs=card_songs,
                title_text=args.event_title,
                title_font=title_font,
                subtitle_text=subtitle,
                footer_text=args.footer_text,
            )
            c.showPage()

    if len(cards) % 2 == 1:
        c.showPage()

    if not args.skip_dj_list:
        draw_dj_listing(c, songs, page_w, page_h)

    c.save()
    print(f"PDF generado: {out_pdf}")
    print(f"Canciones: {len(songs)} | Cartones: {len(cards)} | Canciones/carton: {args.songs_per_card}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # pragma: no cover
        print(f"ERROR: {exc}")
        sys.exit(1)
