#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de cartones para peñas: Matagatos y La Corrala Escondida.

Aplica doble logo automatico y defaults de produccion.
Llama internamente a generate-from-list.py con los parametros correctos.

Uso:
  python scripts/generar-bingo-pena.py <listado.md> <matagatos|corrala> "Nombre Evento"

Ejemplo:
  python scripts/generar-bingo-pena.py cartones/matagatos/listado-canciones-matagatos-80-90-2000.md matagatos "Matagatos 80-90-2000"

En el motor actual (compatibilidad histórica):
    --logo          se coloca a la IZQUIERDA cuando hay doble logo
    --official-logo se coloca a la DERECHA cuando hay doble logo
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).parent.parent.resolve()
GENERATOR = Path(__file__).parent / "generate-from-list.py"

PENAS: dict[str, dict] = {
    "matagatos": {
        "carpeta":        BASE / "cartones" / "matagatos",
        "official_logo":  BASE / "cartones" / "matagatos" / "LogoMatagatos.png",
        "logo":           BASE / "images" / "logooficial.png",
        "songs_per_card": 12,
        "num_cards":      150,
        "card_style":     "grid",
        "force_cps":      4,
    },
    "corrala": {
        "carpeta":        BASE / "cartones" / "La Corrala Escondida",
        "official_logo":  BASE / "cartones" / "La Corrala Escondida" / "logocorrala.png",
        "logo":           BASE / "images" / "logooficial.png",
        "songs_per_card": 12,
        "num_cards":      150,
        "card_style":     "grid",
        "force_cps":      4,
    },
}


def generar(songs_md: Path, pena: str, category: str, seed: int) -> None:
    cfg = PENAS[pena]

    for label, path in [("Logo secundario (--official-logo)", cfg["official_logo"]),
                         ("Logo principal (--logo)", cfg["logo"])]:
        if not path.exists():
            print(f"ERROR: {label} no encontrado: {path}")
            sys.exit(1)

    slug = category.lower().replace(" ", "-").replace("/", "-")
    out_md   = cfg["carpeta"] / f"cartones-{slug}.md"
    out_pptx = cfg["carpeta"] / f"cartones-{slug}.pptx"
    out_pdf  = cfg["carpeta"] / f"cartones-{slug}.pdf"

    print(f"\n{'='*70}")
    print(f"Pena: {pena.upper()}  |  Evento: {category}")
    print(f"{'='*70}")
    print(f"  Logo principal (--logo): {cfg['logo'].name}")
    print(f"  Logo secundario (--official-logo): {cfg['official_logo'].name}")
    print(f"  Cartones : {cfg['num_cards']} x {cfg['songs_per_card']} canciones / grid {cfg['force_cps']}/slide")
    print()

    cmd = [
        sys.executable, str(GENERATOR),
        "--songs-md",              str(songs_md),
        "--out-md",                str(out_md),
        "--pptx-out",              str(out_pptx),
        "--pdf-out",               str(out_pdf),
        "--category",              category,
        "--size",                  "medianos",
        "--songs-per-card",        str(cfg["songs_per_card"]),
        "--num-cards",             str(cfg["num_cards"]),
        "--seed",                  str(seed),
        "--pdf",
        "--official-logo",         str(cfg["official_logo"]),
        "--logo",                  str(cfg["logo"]),
        "--official-logo-scale",   "0.8",
        "--custom-logo-scale",     "1.5",
        "--logo-position",         "top-left",
        "--card-style",            cfg["card_style"],
        "--logo-per-card",
        "--no-slide-title",
        "--no-card-number",
        "--force-cards-per-slide", str(cfg["force_cps"]),
    ]

    result = subprocess.run(cmd, cwd=str(BASE))

    if result.returncode != 0:
        print(f"\nERROR: Generacion fallida (codigo {result.returncode})")
        sys.exit(result.returncode)

    print(f"\nArchivos generados en: {cfg['carpeta']}")
    for f in [out_md, out_pptx, out_pdf]:
        if f.exists():
            mb = f.stat().st_size / 1024 / 1024
            print(f"  OK  {f.name}  ({mb:.2f} MB)")
        else:
            print(f"  NO  {f.name}")


def main() -> None:
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)

    songs_md = Path(sys.argv[1])
    if not songs_md.is_absolute():
        songs_md = BASE / songs_md
    if not songs_md.exists():
        print(f"ERROR: No existe: {songs_md}")
        sys.exit(1)

    pena = sys.argv[2].lower()
    if pena not in PENAS:
        print(f"ERROR: Pena desconocida '{pena}'. Usa: {', '.join(PENAS)}")
        sys.exit(1)

    category = sys.argv[3]
    seed = int(sys.argv[4]) if len(sys.argv) > 4 else 20260527

    generar(songs_md, pena, category, seed)


if __name__ == "__main__":
    main()
