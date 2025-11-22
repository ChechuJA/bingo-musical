#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Generador de Cartones Visuales de Bingo Musical
Convierte cartones en formato Markdown a imágenes PNG con diseño profesional
Formato: 4x4 (16 casillas) = 12 canciones + 4 comodines (1 por fila aleatoriamente)
"""

import re
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Temas de colores por categoría
CATEGORY_THEMES = {
    'navidad': {
        'bg_color': '#c41e3a',       # Rojo navideño
        'card_bg': '#ffffff',        # Fondo blanco para celdas
        'header_color': '#165b33',   # Verde navideño
        'text_color': '#2d3436',     # Texto oscuro
        'wildcard_emoji': '🎄',      # Árbol de Navidad
        'title': 'BINGO Musical 🎄 Navidad'
    },
    'rock': {
        'bg_color': '#1a1a1a',       # Negro
        'card_bg': '#ffffff',
        'header_color': '#8b0000',   # Rojo oscuro
        'text_color': '#2d3436',
        'wildcard_emoji': '🤘',      # Cuernos de rock
        'title': 'BINGO Musical 🤘 Rock'
    },
    'pop-latino': {
        'bg_color': '#ff8c42',       # Naranja
        'card_bg': '#ffffff',
        'header_color': '#d62828',   # Rojo latino
        'text_color': '#2d3436',
        'wildcard_emoji': '💃',      # Bailarina
        'title': 'BINGO Musical 💃 Pop Latino'
    },
    'clasicos-pop': {
        'bg_color': '#ff6b9d',       # Rosa
        'card_bg': '#ffffff',
        'header_color': '#c9184a',   # Rosa oscuro
        'text_color': '#2d3436',
        'wildcard_emoji': '🎸',      # Guitarra
        'title': 'BINGO Musical 🎸 Clásicos Pop'
    },
    'cumpleanos': {
        'bg_color': '#ffd93d',       # Amarillo
        'card_bg': '#ffffff',
        'header_color': '#f77f00',   # Naranja
        'text_color': '#2d3436',
        'wildcard_emoji': '🎂',      # Pastel
        'title': 'BINGO Musical 🎂 Cumpleaños'
    },
    'otono': {
        'bg_color': '#d4a574',       # Marrón otoñal
        'card_bg': '#ffffff',
        'header_color': '#8b4513',   # Marrón oscuro
        'text_color': '#2d3436',
        'wildcard_emoji': '🍂',      # Hoja
        'title': 'BINGO Musical 🍂 Otoño'
    },
    'espanol': {
        'bg_color': '#e63946',       # Rojo español
        'card_bg': '#ffffff',
        'header_color': '#a8201a',   # Rojo oscuro
        'text_color': '#2d3436',
        'wildcard_emoji': '🇪🇸',      # Bandera España
        'title': 'BINGO Musical 🇪🇸 Español'
    },
    'ingles': {
        'bg_color': '#4361ee',       # Azul
        'card_bg': '#ffffff',
        'header_color': '#3a0ca3',   # Azul oscuro
        'text_color': '#2d3436',
        'wildcard_emoji': '🇬🇧',      # Bandera UK
        'title': 'BINGO Musical 🇬🇧 Inglés'
    },
    'default': {
        'bg_color': '#6366f1',       # Azul índigo
        'card_bg': '#ffffff',
        'header_color': '#4338ca',   # Azul oscuro
        'text_color': '#2d3436',
        'wildcard_emoji': '⭐',      # Estrella
        'title': 'BINGO Musical ⭐'
    }
}

def detect_category(file_path):
    """
    Detecta la categoría del cartón basándose en el nombre del archivo/carpeta
    """
    path_str = str(file_path).lower()
    
    if 'navidad' in path_str:
        return 'navidad'
    elif 'rock' in path_str:
        return 'rock'
    elif 'pop-latino' in path_str or 'pop_latino' in path_str:
        return 'pop-latino'
    elif 'clasicos' in path_str and 'pop' in path_str:
        return 'clasicos-pop'
    elif 'cumpleanos' in path_str or 'cumpleaños' in path_str:
        return 'cumpleanos'
    elif 'otono' in path_str or 'otoño' in path_str:
        return 'otono'
    elif 'espanol' in path_str or 'español' in path_str:
        return 'espanol'
    elif 'ingles' in path_str or 'inglés' in path_str:
        return 'ingles'
    else:
        return 'default'

def detect_card_size(file_path):
    """
    Detecta el tamaño del cartón basándose en el nombre del archivo
    Returns: 'pequeños', 'medianos', 'grandes'
    """
    path_str = str(file_path).lower()
    
    if 'pequeños' in path_str or 'pequenos' in path_str:
        return 'pequeños'
    elif 'medianos' in path_str:
        return 'medianos'
    elif 'grandes' in path_str:
        return 'grandes'
    else:
        return 'medianos'  # Por defecto

def parse_markdown_card(md_content):
    """
    Parsea el contenido Markdown y extrae los cartones.
    
    Formato esperado:
    ## Cartón 1
    1. Canción 1 - Artista
    2. Canción 2 - Artista
    ...
    12. Canción 12 - Artista (o COMODÍN)
    """
    cards = []
    current_card = None
    
    lines = md_content.split('\n')
    
    for line in lines:
        line = line.strip()
        
        # Detectar inicio de nuevo cartón
        if line.startswith('## Cartón'):
            if current_card:
                cards.append(current_card)
            match = re.search(r'Cartón (\d+)', line)
            card_number = int(match.group(1)) if match else len(cards) + 1
            current_card = {
                'numero': card_number,
                'songs': []
            }
        
        # Detectar canción (formato: "1. Canción - Artista" o "COMODÍN")
        elif current_card and re.match(r'^\d+\.\s+', line):
            song_text = re.sub(r'^\d+\.\s+', '', line)
            current_card['songs'].append(song_text)
    
    # Añadir último cartón
    if current_card:
        cards.append(current_card)
    
    return cards

def create_bingo_card_image(card_data, theme, output_path, size_type='medianos', card_size=(900, 1200)):
    """
    Crea una imagen de un cartón de bingo con diseño visual mejorado
    Formatos:
    - Pequeños: 3×4 = 12 canciones (sin comodines en última fila)
    - Medianos: 4×4 = 12 canciones + 4 comodines (1 por fila)
    - Grandes: 5×4 = 16 canciones + 4 comodines (1 por fila)
    
    Args:
        card_data: Diccionario con 'numero' y 'songs' (lista de canciones)
        theme: Diccionario con colores y configuración del tema
        output_path: Ruta donde guardar la imagen
        size_type: 'pequeños', 'medianos' o 'grandes'
        card_size: Tupla (ancho, alto) del tamaño de la imagen
    """
    img = Image.new('RGB', card_size, theme['bg_color'])
    draw = ImageDraw.Draw(img)
    
    # Configuración de fuentes (tamaños ajustados)
    try:
        font_title = ImageFont.truetype("arial.ttf", 42)
        font_song = ImageFont.truetype("arial.ttf", 13)  # Más pequeño para más texto
        font_emoji = ImageFont.truetype("seguiemj.ttf", 45)  # Ajustado para grids
        font_footer = ImageFont.truetype("arial.ttf", 17)  # 3 puntos más grande (14→17)
    except:
        font_title = ImageFont.load_default()
        font_song = ImageFont.load_default()
        font_emoji = ImageFont.load_default()
        font_footer = ImageFont.load_default()
    
    # Header con gradiente visual
    header_height = 110
    
    # Fondo del header con efecto degradado simulado
    for i in range(header_height):
        alpha = int(255 * (1 - i / header_height * 0.3))
        color = theme['header_color']
        draw.rectangle([(0, i), (card_size[0], i+1)], fill=color)
    
    # Título
    title = theme['title']
    card_number = f"Cartón #{card_data['numero']}"
    
    # Dibujar título con sombra
    title_bbox = draw.textbbox((0, 0), title, font=font_title)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (card_size[0] - title_width) // 2
    
    # Sombra del título
    draw.text((title_x + 2, 22), title, fill='#00000040', font=font_title)
    # Título
    draw.text((title_x, 20), title, fill='#ffffff', font=font_title)
    
    # Número de cartón
    number_bbox = draw.textbbox((0, 0), card_number, font=font_footer)
    number_width = number_bbox[2] - number_bbox[0]
    draw.text(((card_size[0] - number_width) // 2, 70), card_number, fill='#ffffffcc', font=font_footer)
    
    # Grid de canciones (configuración según tamaño)
    margin = 35
    grid_top = header_height + 35
    grid_width = card_size[0] - (2 * margin)
    grid_height = card_size[1] - grid_top - 90
    
    # Configuración según tamaño del cartón
    if size_type == 'pequeños':
        # Pequeños: 3×4 = 12 canciones (sin comodines)
        cols = 4
        rows = 3
        num_songs = 12
        use_wildcards = False
    elif size_type == 'grandes':
        # Grandes: 5×4 = 20 casillas (16 canciones + 4 comodines)
        cols = 4
        rows = 5
        num_songs = 16
        use_wildcards = True
    else:  # medianos
        # Medianos: 4×4 = 16 casillas (12 canciones + 4 comodines)
        cols = 4
        rows = 4
        num_songs = 12
        use_wildcards = True
    
    cell_width = grid_width // cols
    cell_height = grid_height // rows
    
    # Preparar casillas según configuración
    cells = []
    songs_copy = card_data['songs'][:num_songs]
    song_idx = 0
    
    if use_wildcards:
        # Con comodines: 1 por fila en posición aleatoria
        for row_num in range(rows):
            row_cells = []
            wildcard_col = random.randint(0, cols - 1)
            
            for col_num in range(cols):
                if col_num == wildcard_col:
                    row_cells.append('COMODÍN')
                else:
                    if song_idx < len(songs_copy):
                        row_cells.append(songs_copy[song_idx])
                        song_idx += 1
                    else:
                        row_cells.append('COMODÍN')
            
            cells.extend(row_cells)
    else:
        # Sin comodines: solo canciones
        for i in range(cols * rows):
            if song_idx < len(songs_copy):
                cells.append(songs_copy[song_idx])
                song_idx += 1
            else:
                cells.append('')  # Celda vacía si faltan canciones
    
    # Radio de bordes redondeados
    corner_radius = 8
    
    # Dibujar las celdas con diseño mejorado
    for idx, song in enumerate(cells):
        row = idx // cols
        col = idx % cols
        
        x = margin + (col * cell_width) + 6
        y = grid_top + (row * cell_height) + 6
        cell_w = cell_width - 12
        cell_h = cell_height - 12
        
        # Sombra sutil
        shadow_offset = 4
        # Simular borde redondeado en sombra
        draw.ellipse(
            [(x + shadow_offset, y + shadow_offset), 
             (x + corner_radius*2 + shadow_offset, y + corner_radius*2 + shadow_offset)],
            fill='#00000015'
        )
        draw.rectangle(
            [(x + shadow_offset, y + corner_radius + shadow_offset), 
             (x + cell_w + shadow_offset, y + cell_h - corner_radius + shadow_offset)],
            fill='#00000015'
        )
        
        # Celda con fondo blanco y borde
        draw.rectangle(
            [(x, y), (x + cell_w, y + cell_h)],
            outline=theme['header_color'],
            width=3,
            fill=theme['card_bg']
        )
        
        # Verificar si es un comodín
        is_wildcard = 'COMODÍN' in song.upper() or song.strip() == ''
        
        if is_wildcard:
            # Dibujar emoji centrado
            emoji = theme['wildcard_emoji']
            emoji_bbox = draw.textbbox((0, 0), emoji, font=font_emoji)
            emoji_width = emoji_bbox[2] - emoji_bbox[0]
            emoji_height = emoji_bbox[3] - emoji_bbox[1]
            
            emoji_x = x + (cell_w - emoji_width) // 2
            emoji_y = y + (cell_h - emoji_height) // 2
            
            draw.text((emoji_x, emoji_y), emoji, font=font_emoji, embedded_color=True)
        else:
            # Dibujar texto de la canción con mejor ajuste
            max_chars_per_line = 22
            words = song.split(' - ')
            
            # Separar en líneas
            lines = []
            if len(words) >= 2:
                # Tiene formato "Canción - Artista"
                song_part = words[0].strip()
                artist_part = words[1].strip()
                
                # Dividir canción en múltiples líneas si es necesario
                if len(song_part) > max_chars_per_line:
                    # Intentar dividir por palabras
                    song_words = song_part.split()
                    current_line = ''
                    for word in song_words:
                        test_line = current_line + (' ' if current_line else '') + word
                        if len(test_line) <= max_chars_per_line:
                            current_line = test_line
                        else:
                            if current_line:
                                lines.append(current_line)
                            current_line = word
                    if current_line:
                        lines.append(current_line)
                else:
                    lines.append(song_part)
                
                # Añadir artista
                if len(artist_part) > max_chars_per_line:
                    artist_words = artist_part.split()
                    current_line = ''
                    for word in artist_words:
                        test_line = current_line + (' ' if current_line else '') + word
                        if len(test_line) <= max_chars_per_line:
                            current_line = test_line
                        else:
                            if current_line:
                                lines.append(current_line)
                            current_line = word
                    if current_line:
                        lines.append(current_line)
                else:
                    lines.append(artist_part)
            else:
                # Sin separador, dividir por palabras
                if len(song) > max_chars_per_line:
                    song_words = song.split()
                    current_line = ''
                    for word in song_words:
                        test_line = current_line + (' ' if current_line else '') + word
                        if len(test_line) <= max_chars_per_line:
                            current_line = test_line
                        else:
                            if current_line:
                                lines.append(current_line)
                            current_line = word
                    if current_line:
                        lines.append(current_line)
                else:
                    lines.append(song)
            
            # Limitar a máximo 5 líneas
            if len(lines) > 5:
                lines = lines[:5]
                lines[-1] = lines[-1][:19] + '...'
            
            # Calcular posición vertical centrada
            line_height = 15
            total_text_height = len(lines) * line_height
            text_start_y = y + (cell_h - total_text_height) // 2
            
            # Dibujar cada línea centrada
            for line_idx, line in enumerate(lines):
                text_bbox = draw.textbbox((0, 0), line, font=font_song)
                text_width = text_bbox[2] - text_bbox[0]
                text_x = x + (cell_w - text_width) // 2
                text_y = text_start_y + (line_idx * line_height)
                
                draw.text((text_x, text_y), line, fill=theme['text_color'], font=font_song)
    
    # Footer con línea decorativa
    footer_y = card_size[1] - 50
    
    # Línea decorativa superior
    line_y = footer_y - 15
    draw.line([(margin, line_y), (card_size[0] - margin, line_y)], 
              fill=theme['header_color'], width=3)
    
    # Texto del footer
    footer_text = "bingomusicalgratis.es"
    footer_bbox = draw.textbbox((0, 0), footer_text, font=font_footer)
    footer_width = footer_bbox[2] - footer_bbox[0]
    draw.text(((card_size[0] - footer_width) // 2, footer_y), 
              footer_text, fill=theme['text_color'], font=font_footer)
    
    # Guardar imagen
    img.save(output_path, 'PNG', optimize=True)

def process_markdown_file(md_file_path, output_base_dir):
    """
    Procesa un archivo Markdown y genera las imágenes PNG para todos sus cartones
    """
    try:
        # Leer archivo
        with open(md_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parsear cartones
        cards = parse_markdown_card(content)
        
        if not cards:
            print(f"⚠️  No se encontraron cartones en {md_file_path}")
            return 0
        
        # Detectar categoría y tamaño
        category = detect_category(md_file_path)
        theme = CATEGORY_THEMES[category]
        size_type = detect_card_size(md_file_path)
        
        # Crear directorio de salida
        output_dir = output_base_dir / category
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Obtener nombre base del archivo
        file_stem = md_file_path.stem  # nombre sin extensión
        
        # Generar imágenes
        generated_count = 0
        for card in cards:
            # Nombre de archivo de salida
            output_filename = f"{file_stem}-carton-{card['numero']:03d}.png"
            output_path = output_dir / output_filename
            
            # Generar imagen con tamaño específico
            create_bingo_card_image(card, theme, output_path, size_type=size_type)
            print(f"✅ Generada: {output_path}")
            generated_count += 1
        
        return generated_count
        
    except Exception as e:
        print(f"❌ Error procesando {md_file_path}: {e}")
        return 0

def main():
    """
    Función principal que escanea el directorio de cartones y genera las imágenes
    """
    print("🎨 Generador de Cartones Visuales de Bingo Musical")
    print("=" * 60)
    
    # Directorios
    base_dir = Path(__file__).parent.parent
    cartones_dir = base_dir / 'cartones'
    output_dir = base_dir / 'cartones-visuales'
    
    print(f"📁 Buscando cartones en: {cartones_dir}")
    print(f"💾 Guardando imágenes en: {output_dir}")
    print("=" * 60)
    
    # Buscar todos los archivos de cartones, excluyendo "varios"
    all_md_files = list(cartones_dir.glob('**/cartones-*.md'))
    md_files = [f for f in all_md_files if 'varios' not in f.stem.lower()]
    
    excluded_count = len(all_md_files) - len(md_files)
    
    print(f"\n📊 Encontrados {len(all_md_files)} archivos")
    if excluded_count > 0:
        print(f"⏭️  Excluidos {excluded_count} archivos 'varios' (hechos a mano)")
    print(f"📝 Procesando {len(md_files)} archivos\n")
    
    # Procesar cada archivo
    total_generated = 0
    for md_file in md_files:
        print(f"📄 Procesando: {md_file}")
        count = process_markdown_file(md_file, output_dir)
        if count > 0:
            print(f"   Encontrados {count} cartones\n")
        total_generated += count
    
    print("=" * 60)
    print(f"✅ Proceso completado: {len(md_files)}/{len(md_files)} archivos procesados")
    print(f"🎨 Total de imágenes generadas: {total_generated}")
    print(f"📂 Imágenes guardadas en: {output_dir}")
    print("=" * 60)

if __name__ == "__main__":
    main()
