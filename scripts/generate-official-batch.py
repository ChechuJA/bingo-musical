#!/usr/bin/env python3
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
GENERATOR = ROOT / "scripts" / "generate-from-list.py"
OFFICIAL_LOGO = ROOT / "images" / "logooficial.png"

EXCLUDE_FRAGMENTS = ["La Corrala Escondida", "matagatos"]


def infer_params(list_path: Path) -> tuple[str, int, int, str]:
    p = str(list_path)

    if "\\pequeños\\" in p:
        size, songs_per_card, num_cards = "Pequenos", 8, 20
    elif "\\medianos\\" in p:
        size, songs_per_card, num_cards = "Medianos", 12, 30
    elif "\\grandes\\" in p:
        size, songs_per_card, num_cards = "Grandes", 20, 40
    elif "Mix Musical\\Mix 1" in p or "\\mix-2026\\" in p:
        size, songs_per_card, num_cards = "Medianos", 12, 150
    elif "\\disney\\" in p or "\\infantil\\" in p or "villancicos-infantil" in p:
        size, songs_per_card, num_cards = "Pequenos", 8, 20
    else:
        size, songs_per_card, num_cards = "Medianos", 12, 30

    if any(token in p for token in ["\\pequeños\\", "\\medianos\\", "\\grandes\\"]):
        category = list_path.parent.parent.name
    else:
        category = list_path.parent.name

    return size, songs_per_card, num_cards, category


def build_outputs(list_path: Path) -> tuple[Path, Path, Path]:
    base_name = list_path.stem.replace("listado-canciones-", "cartones-")
    out_md = list_path.parent / f"{base_name}-oficial.md"
    out_pptx = out_md.with_suffix(".pptx")
    out_pdf = out_md.with_suffix(".pdf")
    return out_md, out_pptx, out_pdf


def run_generation(list_path: Path, force_4: bool) -> int:
    size, songs_per_card, num_cards, category = infer_params(list_path)
    out_md, out_pptx, _ = build_outputs(list_path)

    args = [
        str(PYTHON),
        str(GENERATOR),
        "--songs-md",
        str(list_path),
        "--out-md",
        str(out_md),
        "--category",
        category,
        "--size",
        size,
        "--songs-per-card",
        str(songs_per_card),
        "--num-cards",
        str(num_cards),
        "--seed",
        "20260527",
        "--pptx-out",
        str(out_pptx),
        "--pdf",
        "--official-logo",
        str(OFFICIAL_LOGO),
        "--logo-width",
        "0.55",
        "--official-logo-scale",
        "0.8",
        "--logo-per-card",
        "--card-style",
        "grid",
        "--no-slide-title",
        "--no-card-number",
        "--font-title",
        "Scriptina Pro Light",
    ]

    if force_4:
        args.extend(["--force-cards-per-slide", "4"])

    completed = subprocess.run(args)
    return completed.returncode


def main() -> None:
    cartones_root = ROOT / "cartones"
    lists = sorted(cartones_root.rglob("listado-canciones*.md"))
    lists = [
        p
        for p in lists
        if not any(fragment.lower() in str(p).lower() for fragment in EXCLUDE_FRAGMENTS)
    ]

    ok_4 = 0
    ok_fallback = 0
    skip = 0
    fail: list[Path] = []

    for list_path in lists:
        out_md, out_pptx, out_pdf = build_outputs(list_path)
        if out_pptx.exists() and out_pdf.exists():
            skip += 1
            continue

        rc = run_generation(list_path, force_4=True)
        if rc == 0:
            ok_4 += 1
            print(f"OK 4/slide: {list_path}")
            continue

        rc = run_generation(list_path, force_4=False)
        if rc == 0:
            ok_fallback += 1
            print(f"OK fallback: {list_path}")
        else:
            fail.append(list_path)
            print(f"FAIL: {list_path}")

    print("\n==== RESUMEN ====")
    print(f"OK 4/slide: {ok_4}")
    print(f"OK fallback: {ok_fallback}")
    print(f"SKIP: {skip}")
    print(f"FAIL: {len(fail)}")
    for p in fail:
        print(f" - {p}")


if __name__ == "__main__":
    main()
