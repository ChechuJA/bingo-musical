#!/usr/bin/env python3
"""
Generador automático de cartones de Bingo Musical
Lee data/playlists.json y genera cartones en formato Markdown
"""

import json
import os
import random
from pathlib import Path

# Configuración
CONFIG = {
    'pequeños': {'canciones': 8, 'cartones': 20},
    'medianos': {'canciones': 12, 'cartones': 30},
    'grandes': {'canciones': 20, 'cartones': 40}
}

def load_playlists():
    """Carga el archivo playlists.json"""
    playlists_path = Path(__file__).parent.parent / 'data' / 'playlists.json'
    with open(playlists_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_cards(songs, num_songs, num_cards):
    """Genera cartones únicos con canciones aleatorias"""
    cards = []
    for _ in range(num_cards):
        shuffled = random.sample(songs, num_songs)
        cards.append(shuffled)
    return cards

def normalize_folder_name(name):
    """Normaliza nombre de carpeta"""
    return name.lower().replace(' ', '-').replace('ñ', 'n').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')

def save_cards_to_markdown(category, size, cards, songs):
    """Guarda cartones en archivos Markdown"""
    folder_name = normalize_folder_name(category)
    base_path = Path(__file__).parent.parent / 'cartones' / folder_name
    
    # Crear carpeta si no existe
    size_folder = base_path / size
    size_folder.mkdir(parents=True, exist_ok=True)
    
    # Archivo de listado de canciones
    listado_path = size_folder / f'listado-canciones-{folder_name}-{size}.md'
    listado_content = f'# Listado de Canciones - {category} ({size})\n\n'
    listado_content += f'**Total:** {len(songs)} canciones\n\n'
    for idx, song in enumerate(songs, 1):
        listado_content += f'{idx}. {song}\n'
    
    with open(listado_path, 'w', encoding='utf-8') as f:
        f.write(listado_content)
    print(f'✅ Guardado: {listado_path}')
    
    # Archivo con todos los cartones
    cartones_path = size_folder / f'cartones-{folder_name}-{size}.md'
    cartones_content = f'# Cartones de Bingo Musical - {category} ({size})\n\n'
    cartones_content += f'**Configuración:** {len(cards[0])} canciones por cartón · {len(cards)} cartones únicos\n\n'
    cartones_content += '---\n\n'
    
    for idx, card in enumerate(cards, 1):
        cartones_content += f'## Cartón {idx}\n\n'
        for song_idx, song in enumerate(card, 1):
            cartones_content += f'{song_idx}. {song}\n'
        cartones_content += '\n---\n\n'
    
    with open(cartones_path, 'w', encoding='utf-8') as f:
        f.write(cartones_content)
    print(f'✅ Guardado: {cartones_path}')
    
    return {
        'listado': f'cartones/{folder_name}/{size}/listado-canciones-{folder_name}-{size}.md',
        'cartones': f'cartones/{folder_name}/{size}/cartones-{folder_name}-{size}.md',
        'numCanciones': len(songs),
        'cancionesPorCarton': len(cards[0]),
        'numCartones': len(cards)
    }

def main():
    """Función principal"""
    playlists = load_playlists()
    generated_files = {}
    
    print('\n🎵 Generando cartones de Bingo Musical...\n')
    
    for category, songs in playlists.items():
        print(f'\n📁 Categoría: {category} ({len(songs)} canciones)')
        
        if category not in generated_files:
            generated_files[category] = {}
        
        # Generar para cada tamaño si hay suficientes canciones
        for size, config in CONFIG.items():
            if len(songs) >= config['canciones']:
                print(f'  Generando cartones {size}...')
                cards = generate_cards(songs, config['canciones'], config['cartones'])
                files = save_cards_to_markdown(category, size, cards, songs)
                generated_files[category][size] = files
            else:
                print(f'  ⚠️  No hay suficientes canciones para {size} (necesita {config["canciones"]}, tiene {len(songs)})')
    
    # Guardar índice de archivos generados
    index_path = Path(__file__).parent.parent / 'data' / 'generated-cards-index.json'
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(generated_files, f, ensure_ascii=False, indent=2)
    print(f'\n✅ Índice guardado en: {index_path}')
    
    print('\n🎉 ¡Generación completada!\n')
    print('📊 Resumen:')
    for cat, sizes in generated_files.items():
        print(f'  - {cat}: {len(sizes)} tamaños generados')

if __name__ == '__main__':
    main()
