"""Utilidades para generar PPTX de cartones.

Este módulo existe para reutilizar el generador PPTX desde distintos scripts
(sin duplicar lógica).
"""

from __future__ import annotations

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt


def create_bingo_pptx(
    cards: list[list[str]],
    categoria: str,
    theme_colors: dict,
    output_file: Path | str,
    *,
    card_style: str = "list",
    grid_wildcard_text: str = "⭐ COMODÍN",
    grid_wildcard_image: Path | str | None = None,
    force_cards_per_slide: int | None = None,
):
    """Crea presentación PowerPoint con cartones de bingo.

    Layout dinámico según número de canciones:
    - 6-8 canciones: 3 cartones por slide
    - 10-12 canciones: 2 cartones por slide
    - 15-20 canciones: 1 cartón por slide

    Estilos de cartón:
    - card_style="list": lista vertical con checkboxes (estilo actual)
    - card_style="grid3x3": cuadrícula 3x3 (pensado para 8 canciones + 1 comodín)
    """

    prs = Presentation()
    prs.slide_width = Inches(10)  # 16:9
    prs.slide_height = Inches(7.5)

    if not cards:
        print("⚠️ No hay cartones para procesar")
        return None

    num_songs = len(cards[0])

    if force_cards_per_slide is not None:
        if force_cards_per_slide not in (1, 2, 3):
            raise ValueError("force_cards_per_slide debe ser 1, 2 o 3")
        cartones_por_slide = force_cards_per_slide
        layout_type = {3: "horizontal_3", 2: "horizontal_2", 1: "single"}[force_cards_per_slide]
    else:
        if num_songs <= 8:
            cartones_por_slide = 3
            layout_type = "horizontal_3"
        elif num_songs <= 12:
            cartones_por_slide = 2
            layout_type = "horizontal_2"
        else:
            cartones_por_slide = 1
            layout_type = "single"

    total_slides = (len(cards) + cartones_por_slide - 1) // cartones_por_slide

    print(
        f"📊 Creando {total_slides} diapositivas con {len(cards)} cartones "
        f"({num_songs} canciones/cartón, {cartones_por_slide} cartones/slide)..."
    )

    for slide_idx in range(total_slides):
        blank_layout = prs.slide_layouts[6]
        slide = prs.slides.add_slide(blank_layout)

        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = RGBColor(*theme_colors["background"])

        title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(9), Inches(0.6))
        title_frame = title_box.text_frame
        icon = theme_colors.get("icon", "🎵")
        title_frame.text = f"{icon} BINGO MUSICAL - {categoria}"
        title_p = title_frame.paragraphs[0]
        title_p.alignment = PP_ALIGN.CENTER
        title_p.font.size = Pt(28)
        title_p.font.bold = True
        title_p.font.color.rgb = RGBColor(*theme_colors["title"])

        start_idx = slide_idx * cartones_por_slide
        end_idx = min(start_idx + cartones_por_slide, len(cards))
        cards_in_slide = cards[start_idx:end_idx]

        if layout_type == "horizontal_3":
            card_width = 3.0
            card_height = 5.5
            spacing = 0.2
            start_x = 0.5
            start_y = 1.2
            # Evita que la última línea se salga del recuadro
            song_font_size = 10
            song_height = 0.62
        elif layout_type == "horizontal_2":
            card_width = 4.0
            card_height = 6.0
            spacing = 0.5
            start_x = 1.0
            start_y = 1.0
            song_font_size = 10
            song_height = 0.48
        else:
            card_width = 6.0
            card_height = 6.5
            spacing = 0
            start_x = 2.0
            start_y = 0.8
            song_font_size = 9
            song_height = 0.28

        for card_pos, card in enumerate(cards_in_slide):
            card_number = start_idx + card_pos + 1
            x_pos = start_x + (card_width + spacing) * card_pos

            card_shape = slide.shapes.add_shape(
                1,  # Rectangle
                Inches(x_pos),
                Inches(start_y),
                Inches(card_width),
                Inches(card_height),
            )

            card_shape.fill.solid()
            card_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
            card_shape.line.color.rgb = RGBColor(*theme_colors["border"])
            card_shape.line.width = Pt(3)

            card_title = slide.shapes.add_textbox(
                Inches(x_pos + 0.1),
                Inches(start_y + 0.1),
                Inches(card_width - 0.2),
                Inches(0.45),
            )
            card_title_frame = card_title.text_frame
            card_title_frame.text = f"Cartón {card_number}/{len(cards)}"
            card_title_p = card_title_frame.paragraphs[0]
            card_title_p.alignment = PP_ALIGN.CENTER
            card_title_p.font.size = Pt(14)
            card_title_p.font.bold = True
            card_title_p.font.color.rgb = RGBColor(*theme_colors["subtitle"])

            def _clean_song(s: str) -> str:
                return (
                    s.replace(" - Villancicos", "")
                    .replace(" - Canciones Infantiles", "")
                    .replace(" - Tradicional", "")
                    .replace(" - Pinkfong", "")
                    .replace(" - Canciones de la Granja", "")
                    .replace(" - Timbiriche", "")
                    .replace(" - Raphael", "")
                    .replace(" - Cri-Cri", "")
                )

            if card_style == "grid3x3":
                # Cuadrícula 3x3: 8 canciones + 1 comodín
                if len(card) > 8:
                    raise ValueError(
                        f"grid3x3 solo soporta hasta 8 canciones por cartón. Recibido: {len(card)}"
                    )

                margin = 0.12
                grid_x = x_pos + margin
                grid_y = start_y + 0.68
                grid_w = card_width - (margin * 2)
                grid_h = card_height - 0.9
                cols = 3
                rows = 3
                cell_w = grid_w / cols
                cell_h = grid_h / rows

                # Contenido de 9 celdas (última = comodín)
                cell_items: list[dict] = []
                for song in card:
                    cell_items.append({"type": "song", "value": _clean_song(song)})
                while len(cell_items) < 8:
                    cell_items.append({"type": "empty", "value": ""})
                cell_items.append({"type": "wildcard", "value": grid_wildcard_text})

                for idx, item in enumerate(cell_items):
                    r = idx // cols
                    c = idx % cols
                    cx = grid_x + c * cell_w
                    cy = grid_y + r * cell_h

                    cell_shape = slide.shapes.add_shape(
                        1,
                        Inches(cx),
                        Inches(cy),
                        Inches(cell_w),
                        Inches(cell_h),
                    )
                    cell_shape.fill.solid()
                    cell_shape.fill.fore_color.rgb = RGBColor(255, 255, 255)
                    cell_shape.line.color.rgb = RGBColor(*theme_colors["border"])
                    cell_shape.line.width = Pt(1.5)

                    # Wildcard: imagen (si existe) o texto
                    if item["type"] == "wildcard" and grid_wildcard_image:
                        img_path = Path(grid_wildcard_image)
                        if img_path.exists():
                            # Ajuste simple: centrar dentro de la celda
                            pad = 0.08
                            slide.shapes.add_picture(
                                str(img_path),
                                Inches(cx + pad),
                                Inches(cy + pad),
                                width=Inches(cell_w - (pad * 2)),
                                height=Inches(cell_h - (pad * 2)),
                            )
                            continue

                    tb = slide.shapes.add_textbox(
                        Inches(cx + 0.06),
                        Inches(cy + 0.06),
                        Inches(cell_w - 0.12),
                        Inches(cell_h - 0.12),
                    )
                    tf = tb.text_frame
                    tf.word_wrap = True
                    tf.text = item["value"]
                    p = tf.paragraphs[0]
                    p.alignment = PP_ALIGN.CENTER
                    p.font.bold = item["type"] == "wildcard"
                    if layout_type == "horizontal_3":
                        grid_font = 10
                    elif layout_type == "horizontal_2":
                        grid_font = 12
                    else:
                        grid_font = 14
                    p.font.size = Pt(grid_font)
                    p.font.color.rgb = RGBColor(40, 40, 40)
            else:
                # Lista vertical con checkbox
                songs_y = start_y + 0.65

                for song_idx, song in enumerate(card):
                    checkbox = slide.shapes.add_textbox(
                        Inches(x_pos + 0.15),
                        Inches(songs_y + song_idx * song_height),
                        Inches(0.3),
                        Inches(song_height - 0.05),
                    )
                    cb_frame = checkbox.text_frame
                    cb_frame.text = "☐"
                    cb_p = cb_frame.paragraphs[0]
                    cb_p.font.size = Pt(18 if layout_type == "single" else 18)
                    cb_p.font.color.rgb = RGBColor(*theme_colors["checkbox"])

                    song_text = slide.shapes.add_textbox(
                        Inches(x_pos + 0.45),
                        Inches(songs_y + song_idx * song_height),
                        Inches(card_width - 0.6),
                        Inches(song_height - 0.05),
                    )
                    song_frame = song_text.text_frame
                    song_frame.word_wrap = True

                    song_frame.text = f"{song_idx + 1}. {_clean_song(song)}"
                    song_p = song_frame.paragraphs[0]
                    song_p.font.size = Pt(song_font_size)
                    song_p.font.color.rgb = RGBColor(40, 40, 40)
                    song_p.line_spacing = 0.9

        footer = slide.shapes.add_textbox(Inches(0.5), Inches(7.0), Inches(9), Inches(0.3))
        footer_frame = footer.text_frame
        footer_frame.text = f"Diapositiva {slide_idx + 1} de {total_slides} · bingomusicalgratis.es"
        footer_p = footer_frame.paragraphs[0]
        footer_p.alignment = PP_ALIGN.CENTER
        footer_p.font.size = Pt(10)
        footer_p.font.color.rgb = RGBColor(128, 128, 128)

        if (slide_idx + 1) % 5 == 0:
            print(f"  ✅ {slide_idx + 1}/{total_slides} diapositivas creadas...")

    prs.save(output_file)
    print(f"✅ Presentación guardada: {output_file}")

    return {
        "archivo": str(output_file),
        "slides": total_slides,
        "cartones": len(cards),
        "cartones_por_slide": cartones_por_slide,
        "layout": layout_type,
    }


def load_cards_from_markdown(md_file: Path | str) -> list[list[str]]:
    """Carga cartones desde archivo Markdown."""
    md_file = Path(md_file)
    content = md_file.read_text(encoding="utf-8")

    cards: list[list[str]] = []
    current_card: list[str] = []

    for line in content.split("\n"):
        if line.startswith("## Cartón"):
            if current_card:
                cards.append(current_card)
                current_card = []
        elif line and line[0].isdigit() and ". " in line:
            song = line.split(". ", 1)[1]
            current_card.append(song)

    if current_card:
        cards.append(current_card)

    return cards
