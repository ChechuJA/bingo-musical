#!/usr/bin/env python3
"""
Generador automático de cartones de Bingo Musical
Lee data/playlists.json y genera cartones en formato Markdown
"""

import json
import random
from math import comb
from pathlib import Path

# Configuración
CONFIG = {
    'pequeños': {'canciones': 8, 'cartones': 20},
    'medianos': {'canciones': 12, 'cartones': 30},
    'grandes': {'canciones': 20, 'cartones': 40}
}

GENERATION_CONFIG = {
    'max_overlap_ratio': 0.6,
    'candidate_attempts': 400,
}

def load_playlists():
    """Carga el archivo playlists.json"""
    playlists_path = Path(__file__).parent.parent / 'data' / 'playlists.json'
    with open(playlists_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def _distribution_score(counts, candidate_set, songs, generated_cards, songs_per_card):
    mean_after = ((generated_cards + 1) * songs_per_card) / len(songs)
    score = 0.0
    for song in songs:
        projected = counts[song] + (1 if song in candidate_set else 0)
        diff = projected - mean_after
        score += diff * diff
    return score


def get_song_usage(cards):
    usage = {}
    for card in cards:
        for song in card:
            usage[song] = usage.get(song, 0) + 1
    return usage


def generate_cards(songs, num_songs, num_cards, max_overlap_ratio=0.6, candidate_attempts=400):
    """Genera cartones únicos, variados y balanceados"""
    total = comb(len(songs), num_songs)
    if total < num_cards:
        raise RuntimeError(
            f'No hay combinaciones suficientes para {num_cards} cartones únicos: C({len(songs)},{num_songs})={total}'
        )

    max_overlap_allowed = min(num_songs - 1, max(0, int(num_songs * max_overlap_ratio)))

    counts = {song: 0 for song in songs}
    seen = set()
    card_sets = []
    cards = []

    for generated in range(num_cards):
        chosen_candidate = None
        overlap_limit = max_overlap_allowed

        while chosen_candidate is None and overlap_limit < num_songs:
            best_candidate = None
            best_score = float('inf')

            for _ in range(candidate_attempts):
                candidate = random.sample(songs, num_songs)
                key = tuple(sorted(candidate))
                if key in seen:
                    continue

                candidate_set = set(candidate)
                max_overlap_found = 0
                total_overlap = 0
                for previous in card_sets:
                    overlap = len(candidate_set & previous)
                    max_overlap_found = max(max_overlap_found, overlap)
                    total_overlap += overlap

                if max_overlap_found > overlap_limit:
                    continue

                score = _distribution_score(counts, candidate_set, songs, generated, num_songs)
                score += total_overlap * 0.15

                if score < best_score:
                    best_score = score
                    best_candidate = candidate

            if best_candidate is not None:
                chosen_candidate = best_candidate
            else:
                overlap_limit += 1

        if chosen_candidate is None:
            raise RuntimeError(
                f'No se pudo construir el cartón {generated + 1} con las restricciones actuales.'
            )

        candidate_set = set(chosen_candidate)
        seen.add(tuple(sorted(chosen_candidate)))
        card_sets.append(candidate_set)
        for song in candidate_set:
            counts[song] += 1

        random.shuffle(chosen_candidate)
        cards.append(chosen_candidate)

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
                cards = generate_cards(
                    songs,
                    config['canciones'],
                    config['cartones'],
                    max_overlap_ratio=GENERATION_CONFIG['max_overlap_ratio'],
                    candidate_attempts=GENERATION_CONFIG['candidate_attempts'],
                )
                files = save_cards_to_markdown(category, size, cards, songs)
                generated_files[category][size] = files

                usage = get_song_usage(cards)
                print(
                    f"    · Balance de uso (min/max): {min(usage.values())}/{max(usage.values())}"
                )
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
