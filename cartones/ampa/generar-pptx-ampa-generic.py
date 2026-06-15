#!/usr/bin/env python3
"""Script genérico para generar PPTX y PDF desde carpetas AMPA.

Uso:
  python cartones/ampa/generar-pptx-ampa-generic.py FiestaVerano "Verano"
  python cartones/ampa/generar-pptx-ampa-generic.py FiestaNavidad "Navidad"

Parsea el formato propio del MD de AMPA:
  {pos} - {num} Artista - Título
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
# Configuración dinámica
# ---------------------------------------------------------------------------

TEMA_COLORES = {
    "verano": {
        "icon": "☀️",
        "background": (250, 250, 250),
        "title": (60, 60, 60),
        "subtitle": (90, 90, 90),
        "border": (60, 60, 60),
        "checkbox": (120, 120, 120),
    },
    "navidad": {
        "icon": "🎄",
        "background": (250, 240, 240),
        "title": (139, 0, 0),
        "subtitle": (220, 20, 60),
        "border": (139, 0, 0),
        "checkbox": (184, 134, 11),
    },
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
    if len(sys.argv) < 3:
        print("Uso: python generar-pptx-ampa-generic.py <carpeta> <tema>")
        print("  Ejemplos:")
        print("    python generar-pptx-ampa-generic.py FiestaVerano verano")
        print("    python generar-pptx-ampa-generic.py FiestaNavidad navidad")
        sys.exit(1)

    carpeta = sys.argv[1]
    tema = sys.argv[2].lower()

    if tema not in TEMA_COLORES:
        raise SystemExit(f"❌ Tema desconocido: {tema}. Opciones: {', '.join(TEMA_COLORES.keys())}")

    carpeta_fiesta = SCRIPT_DIR / carpeta
    md_file = carpeta_fiesta / f"cartones-bingo-musical-{tema}-1.md"
    pptx_file = carpeta_fiesta / f"cartones-bingo-musical-{tema}-1.pptx"
    pdf_file = carpeta_fiesta / f"cartones-bingo-musical-{tema}-1.pdf"
    logo_file = SCRIPT_DIR / "ampa.png"

    # Naming para categoría
    categoria_mapping = {
        "verano": "Bingo Musical – Fiesta de Verano AMPA Peñamiel",
        "navidad": "Bingo Musical – Navidad AMPA Peñamiel 2026",
    }
    categoria = categoria_mapping.get(tema, f"Bingo Musical – {tema.capitalize()} AMPA Peñamiel")

    print(f"📂 Carpeta : {carpeta_fiesta}")
    print(f"📄 MD     : {md_file}")
    print(f"🖼  Logo   : {logo_file}")
    print()

    if not md_file.exists():
        raise SystemExit(f"❌ No encontrado: {md_file}")
    if not logo_file.exists():
        raise SystemExit(f"❌ No encontrado: {logo_file}")

    cards = load_cards_from_ampa_md(md_file)
    if not cards:
        raise SystemExit("❌ No se encontraron cartones en el MD.")

    print(f"✅ Cartones cargados : {len(cards)}")
    print(f"   Canciones/cartón  : {len(cards[0])}")
    print()

    theme_colors = TEMA_COLORES[tema]
    create_bingo_pptx(
        cards,
        categoria,
        theme_colors,
        pptx_file,
        logo_path=str(logo_file),
        official_logo_path=None,
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
            "generate_from_list",
            REPO_ROOT / "scripts" / "generate-from-list.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        
        if hasattr(mod, '_convert_pptx_to_pdf_with_soffice'):
            if mod._convert_pptx_to_pdf_with_soffice(pptx_file, pdf_file):
                print(f"✅ PDF guardado : {pdf_file}")
            else:
                print(f"⚠️  No se pudo generar PDF (LibreOffice no disponible)")
    except Exception as e:
        print(f"⚠️  Error al generar PDF: {e}")


if __name__ == "__main__":
    main()
