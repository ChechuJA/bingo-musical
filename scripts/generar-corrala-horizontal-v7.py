#!/usr/bin/env python3
"""Genera la version horizontal de La Corrala (2 cartones por folio, grid 3x5)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).parent.parent.resolve()
RENDER = BASE / "scripts" / "render-from-cards-md.py"


def main() -> None:
    cards_md = BASE / "cartones" / "La Corrala Escondida" / "bingo-la-corrala-estilo-imagen-200-v7.md"
    out_pptx = BASE / "cartones" / "La Corrala Escondida" / "bingo-la-corrala-estilo-imagen-200-v7.pptx"
    out_pdf = BASE / "cartones" / "La Corrala Escondida" / "bingo-la-corrala-estilo-imagen-200-v7.pdf"
    header_img = BASE / "cartones" / "La Corrala Escondida" / "Cabecera corrala.jpeg"
    songs_md = BASE / "cartones" / "La Corrala Escondida" / "listado-canciones-corrala-90.md"

    if not cards_md.exists():
        raise FileNotFoundError(f"No existe el markdown de cartones: {cards_md}")
    if not header_img.exists():
        raise FileNotFoundError(f"No existe la cabecera: {header_img}")
    if not songs_md.exists():
        raise FileNotFoundError(f"No existe el listado maestro: {songs_md}")

    cmd = [
        sys.executable,
        str(RENDER),
        "--cards-md",
        str(cards_md),
        "--songs-md",
        str(songs_md),
        "--category",
        "La Corrala Escondida",
        "--pptx-out",
        str(out_pptx),
        "--pdf",
        "--pdf-out",
        str(out_pdf),
        "--logo",
        str(header_img),
        "--no-official-logo",
        "--custom-logo-scale",
        "0.7",
        "--logo-width",
        "0.4",
        "--logo-position",
        "top-center",
        "--force-cards-per-slide",
        "2",
        "--two-cards-layout",
        "stacked",
        "--grid-cols",
        "5",
        "--grid-title-font-max",
        "16",
        "--grid-title-font-min",
        "12",
        "--grid-font-scale",
        "17",
    ]

    result = subprocess.run(cmd, cwd=str(BASE))
    if result.returncode != 0:
        raise SystemExit(result.returncode)

    print("\nArchivos generados:")
    for f in (out_pptx, out_pdf):
        if f.exists():
            mb = f.stat().st_size / 1024 / 1024
            print(f"  OK  {f.name} ({mb:.2f} MB)")
        else:
            print(f"  NO  {f.name}")


if __name__ == "__main__":
    main()
