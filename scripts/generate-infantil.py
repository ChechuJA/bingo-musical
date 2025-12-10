#!/usr/bin/env python3
"""
Generador de 60 cartones de Bingo Musical Infantil
Canciones Infantiles Populares - 6 canciones por cartón
"""

import random
from pathlib import Path

# 12 Canciones Infantiles Populares
CANCIONES_INFANTILES = [
    "Cumpleaños feliz - Tradicional",
    "Pin Pon es un muñeco - Canciones Infantiles",
    "Los pollitos dicen - Canciones Infantiles",
    "Cu cú cantaba la rana - Canciones Infantiles",
    "La vaca Lola - Canciones de la Granja",
    "Baby Shark - Pinkfong",
    "Estrellita dónde estás - Canciones Infantiles",
    "Cinco lobitos - Canciones Infantiles",
    "El Barquito Chiquitito - Canciones Infantiles",
    "Un elefante se balanceaba - Canciones Infantiles",
    "Chocolate - Timbiriche",
    "El sapo no se lava el pie - Canciones Infantiles"
]

CANCIONES_POR_CARTON = 6
NUM_CARTONES = 60
CATEGORIA = "Infantil"

def generate_unique_cards(songs, songs_per_card, num_cards):
    """Genera cartones únicos sin repeticiones"""
    from itertools import combinations
    
    # Generar todas las combinaciones posibles
    all_combinations = list(combinations(songs, songs_per_card))
    
    # Mezclar y tomar las primeras num_cards
    random.shuffle(all_combinations)
    
    # Convertir tuplas a listas y mezclar canciones dentro de cada cartón
    cards = []
    for combo in all_combinations[:num_cards]:
        card = list(combo)
        random.shuffle(card)
        cards.append(card)
    
    return cards

def save_cards_to_markdown(cards, songs, categoria):
    """Guarda cartones en archivos Markdown"""
    # Carpeta de destino
    folder_name = "infantil"
    base_path = Path(__file__).parent.parent / 'cartones' / folder_name
    base_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Archivo de listado de canciones
    listado_path = base_path / 'listado-canciones-infantil.md'
    listado_content = f'# Listado de Canciones - {categoria}\n\n'
    listado_content += f'**Total:** {len(songs)} canciones infantiles populares\n\n'
    for idx, song in enumerate(songs, 1):
        listado_content += f'{idx}. {song}\n'
    
    with open(listado_path, 'w', encoding='utf-8') as f:
        f.write(listado_content)
    print(f'✅ Guardado: {listado_path}')
    
    # 2. Archivo con todos los cartones en Markdown
    cartones_md_path = base_path / 'cartones-infantil.md'
    cartones_content = f'# Cartones de Bingo Musical - {categoria}\n\n'
    cartones_content += f'**Configuración:**\n'
    cartones_content += f'- 🎵 {len(cards[0])} canciones por cartón\n'
    cartones_content += f'- 🎴 {len(cards)} cartones únicos\n'
    cartones_content += f'- 🎈 {len(songs)} canciones en total\n\n'
    cartones_content += '---\n\n'
    
    for idx, card in enumerate(cards, 1):
        cartones_content += f'## Cartón {idx}\n\n'
        for song_idx, song in enumerate(card, 1):
            cartones_content += f'{song_idx}. {song}\n'
        cartones_content += '\n---\n\n'
    
    with open(cartones_md_path, 'w', encoding='utf-8') as f:
        f.write(cartones_content)
    print(f'✅ Guardado: {cartones_md_path}')
    
    # 3. Archivo en formato texto plano (más simple)
    cartones_txt_path = base_path / 'cartones-infantil.txt'
    txt_content = f'CARTONES DE BINGO MUSICAL - {categoria.upper()}\n'
    txt_content += f'{'=' * 60}\n\n'
    txt_content += f'{len(cards[0])} canciones por cartón | {len(cards)} cartones únicos\n\n'
    
    for idx, card in enumerate(cards, 1):
        txt_content += f'\nCARTÓN {idx}\n'
        txt_content += '-' * 40 + '\n'
        for song_idx, song in enumerate(card, 1):
            txt_content += f'  {song_idx}. {song}\n'
    
    with open(cartones_txt_path, 'w', encoding='utf-8') as f:
        f.write(txt_content)
    print(f'✅ Guardado: {cartones_txt_path}')
    
    return {
        'carpeta': str(base_path),
        'archivos': [
            str(listado_path.name),
            str(cartones_md_path.name),
            str(cartones_txt_path.name)
        ]
    }

def main():
    """Función principal"""
    print('\n🎈 Generador de Cartones de Bingo Musical - Infantil\n')
    print(f'📊 Configuración:')
    print(f'   - Canciones totales: {len(CANCIONES_INFANTILES)}')
    print(f'   - Canciones por cartón: {CANCIONES_POR_CARTON}')
    print(f'   - Cartones a generar: {NUM_CARTONES}\n')
    
    # Calcular combinaciones posibles
    from math import comb
    combinaciones_posibles = comb(len(CANCIONES_INFANTILES), CANCIONES_POR_CARTON)
    print(f'💡 Combinaciones posibles: {combinaciones_posibles:,}')
    
    if combinaciones_posibles < NUM_CARTONES:
        print(f'⚠️  ERROR: No hay suficientes combinaciones únicas!')
        print(f'   Necesitas al menos {NUM_CARTONES} pero solo hay {combinaciones_posibles}')
        return
    
    print(f'✅ Hay suficientes combinaciones para generar {NUM_CARTONES} cartones únicos\n')
    
    # Generar cartones
    print('🎲 Generando cartones únicos...')
    cards = generate_unique_cards(CANCIONES_INFANTILES, CANCIONES_POR_CARTON, NUM_CARTONES)
    print(f'✅ {len(cards)} cartones generados correctamente\n')
    
    # Guardar archivos
    print('💾 Guardando archivos...')
    result = save_cards_to_markdown(cards, CANCIONES_INFANTILES, CATEGORIA)
    
    print(f'\n🎉 ¡Generación completada!')
    print(f'\n📁 Archivos generados en: {result["carpeta"]}')
    for archivo in result['archivos']:
        print(f'   - {archivo}')
    
    print(f'\n📊 Resumen:')
    print(f'   ✅ {len(CANCIONES_INFANTILES)} canciones infantiles')
    print(f'   ✅ {NUM_CARTONES} cartones únicos')
    print(f'   ✅ {CANCIONES_POR_CARTON} canciones por cartón')
    print(f'   ✅ 3 archivos generados (.md, .txt, listado)\n')

if __name__ == '__main__':
    main()
