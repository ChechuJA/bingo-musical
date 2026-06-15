#!/usr/bin/env python3
"""Regenera PPTX y PDF para los cartones de AMPA Colegio Peñamiel – Navidad 2026.

Parsea el formato propio del MD de AMPA:
  {pos} - {num} Artista - Título

Uso:
  python cartones/ampa/generar-pptx-ampa-navidad.py

Desde la raíz del proyecto, o desde la carpeta ampa:
  python generar-pptx-ampa-navidad.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Asegurar que el módulo pptx_utils sea encontrable desde cualquier directorio
SCRIPT_DIR = Path(__file__).resolve().parent          # cartones/ampa/
REPO_ROOT = SCRIPT_DIR.parent.parent                  # raíz del repo
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from pptx_utils import create_bingo_pptx              # noqa: E402


# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

CARPETA_FIESTA_NAVIDAD = SCRIPT_DIR / "FiestaNavidad" / "Navidad2026"
MD_FILE   = CARPETA_FIESTA_NAVIDAD / "cartones-bingo-musical-navidad-1.md"
PPTX_FILE = CARPETA_FIESTA_NAVIDAD / "cartones-bingo-musical-navidad-1.pptx"
PDF_FILE  = CARPETA_FIESTA_NAVIDAD / "cartones-bingo-musical-navidad-1.pdf"
LOGO_FILE = SCRIPT_DIR / "ampa.png"

CATEGORIA = "Bingo Musical – Navidad AMPA Peñamiel 2026"

THEME_COLORS = {
    "icon": "🎵",
    "background": (255, 250, 245),      # Crema navideño
    "title": (153, 0, 0),               # Rojo Navidad
    "subtitle": (204, 0, 0),            # Rojo más claro
    "border": (153, 0, 0),              # Rojo Navidad
    "checkbox": (184, 134, 11),         # Dorado (DarkGoldenrod)
}


# ---------------------------------------------------------------------------
# Parser específico para el formato AMPA
# ---------------------------------------------------------------------------

SONG_LINE_RE = re.compile(r"^\d+\s+-\s+\d+\s+(.+)$")


def load_cards_from_ampa_md(md_path: Path) -> list[list[str]]:
    """Carga cartones del formato AMPA: '1 - 14 Don Omar - Danza Kuduro'."""
    cards: list[list[str]] = []
    current_card: list[str] = []

    for line in md_path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## Cartón"):
            if current_card:
                cards.append(current_card)
            current_card = []
        else:
            m = SONG_LINE_RE.match(line.strip())
            if m:
                current_card.append(m.group(1).strip())

    if current_card:
        cards.append(current_card)

    return cards


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"📂 Carpeta: {CARPETA_FIESTA_NAVIDAD}")
    print(f"📄 MD     : {MD_FILE}")
    print(f"🖼  Logo   : {LOGO_FILE}")
    print()

    if not MD_FILE.exists():
        raise SystemExit(f"❌ No encontrado: {MD_FILE}")
    if not LOGO_FILE.exists():
        raise SystemExit(f"❌ No encontrado: {LOGO_FILE}")

    cards = load_cards_from_ampa_md(MD_FILE)
    if not cards:
        raise SystemExit("❌ No se encontraron cartones en el MD.")

    print(f"✅ Cartones cargados : {len(cards)}")
    print(f"   Canciones/cartón  : {len(cards[0])}")
    print()

    create_bingo_pptx(
        cards,
        CATEGORIA,
        THEME_COLORS,
        PPTX_FILE,
        logo_path=str(LOGO_FILE),
        official_logo_path=None,   # Solo el logo AMPA
        logo_width=0.55,
        custom_logo_scale=1.5,
        card_style="grid",
        show_slide_title=False,
        show_card_number=False,
        logo_on_each_card=True,
        footer_text="bingomusicalgratis.es",
        force_cards_per_slide=4,
    )

    # --- PDF (via generate-from-list que contiene export_pptx_to_pdf) ---
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "gfl", REPO_ROOT / "scripts" / "generate-from-list.py"
        )
        gfl = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gfl)
        gfl.export_pptx_to_pdf(PPTX_FILE, PDF_FILE)
        print(f"✅ PDF guardado: {PDF_FILE}")
    except Exception as exc:
        print(f"⚠️  PDF no generado (necesita LibreOffice o PowerPoint): {exc}")


if __name__ == "__main__":
    main()
