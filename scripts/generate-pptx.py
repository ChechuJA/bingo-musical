#!/usr/bin/env python3
"""
Generador de PowerPoint para Cartones de Bingo Musical
Crea presentaciones con 3 cartones por diapositiva
Requiere: pip install python-pptx
"""

from pathlib import Path
import argparse

from pptx_utils import create_bingo_pptx, load_cards_from_markdown

def main():
    """Función principal"""
    print('\n🎨 Generador de PowerPoint - Cartones de Bingo Musical\n')

    parser = argparse.ArgumentParser(description='Genera PPTX desde cartones Markdown')
    parser.add_argument('--only', help='Genera solo un tema por clave (ej: disney-pequeños)')
    args = parser.parse_args()
    
    base_path = Path(__file__).parent.parent / 'cartones'
    
    # Configuraciones de temas
    themes = {
        'navidad-pequeños': {
            'categoria': 'Navidad - Pequeños (8 canciones)',
            'icon': '🎄',
            'colors': {
                'background': (255, 250, 245),
                'title': (196, 30, 58),
                'subtitle': (34, 139, 34),
                'border': (196, 30, 58),
                'checkbox': (255, 215, 0)
            },
            'md_file': base_path / 'navidad' / 'pequeños' / 'cartones-navidad-pequeños.md',
            'output': base_path / 'navidad' / 'pequeños' / 'cartones-navidad-pequeños.pptx'
        },
        'navidad-medianos': {
            'categoria': 'Navidad - Medianos (12 canciones)',
            'icon': '🎄',
            'colors': {
                'background': (255, 250, 245),
                'title': (196, 30, 58),
                'subtitle': (34, 139, 34),
                'border': (196, 30, 58),
                'checkbox': (255, 215, 0)
            },
            'md_file': base_path / 'navidad' / 'medianos' / 'cartones-navidad-medianos.md',
            'output': base_path / 'navidad' / 'medianos' / 'cartones-navidad-medianos.pptx'
        },
        'navidad-grandes': {
            'categoria': 'Navidad - Grandes (20 canciones)',
            'icon': '🎄',
            'colors': {
                'background': (255, 250, 245),
                'title': (196, 30, 58),
                'subtitle': (34, 139, 34),
                'border': (196, 30, 58),
                'checkbox': (255, 215, 0)
            },
            'md_file': base_path / 'navidad' / 'grandes' / 'cartones-navidad-grandes.md',
            'output': base_path / 'navidad' / 'grandes' / 'cartones-navidad-grandes.pptx'
        },
        'clasicos-pop-pequeños': {
            'categoria': 'Clásicos Pop - Pequeños (8 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (255, 245, 250),
                'title': (255, 107, 157),
                'subtitle': (219, 39, 119),
                'border': (255, 107, 157),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'clasicos-del-pop' / 'pequeños' / 'cartones-clasicos-del-pop-pequeños.md',
            'output': base_path / 'clasicos-del-pop' / 'pequeños' / 'cartones-clasicos-del-pop-pequeños.pptx'
        },
        'clasicos-pop-medianos': {
            'categoria': 'Clásicos Pop - Medianos (12 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (255, 245, 250),
                'title': (255, 107, 157),
                'subtitle': (219, 39, 119),
                'border': (255, 107, 157),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'clasicos-del-pop' / 'medianos' / 'cartones-clasicos-del-pop-medianos.md',
            'output': base_path / 'clasicos-del-pop' / 'medianos' / 'cartones-clasicos-del-pop-medianos.pptx'
        },
        'clasicos-pop-grandes': {
            'categoria': 'Clásicos Pop - Grandes (20 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (255, 245, 250),
                'title': (255, 107, 157),
                'subtitle': (219, 39, 119),
                'border': (255, 107, 157),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'clasicos-del-pop' / 'grandes' / 'cartones-clasicos-del-pop-grandes.md',
            'output': base_path / 'clasicos-del-pop' / 'grandes' / 'cartones-clasicos-del-pop-grandes.pptx'
        },
        'pop-latino-pequeños': {
            'categoria': 'Pop Latino - Pequeños (8 canciones)',
            'icon': '💃',
            'colors': {
                'background': (255, 248, 240),
                'title': (255, 140, 66),
                'subtitle': (251, 146, 60),
                'border': (255, 140, 66),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'pop-latino-y-espanol' / 'pequeños' / 'cartones-pop-latino-y-espanol-pequeños.md',
            'output': base_path / 'pop-latino-y-espanol' / 'pequeños' / 'cartones-pop-latino-y-espanol-pequeños.pptx'
        },
        'pop-latino-medianos': {
            'categoria': 'Pop Latino - Medianos (12 canciones)',
            'icon': '💃',
            'colors': {
                'background': (255, 248, 240),
                'title': (255, 140, 66),
                'subtitle': (251, 146, 60),
                'border': (255, 140, 66),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'pop-latino-y-espanol' / 'medianos' / 'cartones-pop-latino-y-espanol-medianos.md',
            'output': base_path / 'pop-latino-y-espanol' / 'medianos' / 'cartones-pop-latino-y-espanol-medianos.pptx'
        },
        'pop-latino-grandes': {
            'categoria': 'Pop Latino - Grandes (20 canciones)',
            'icon': '💃',
            'colors': {
                'background': (255, 248, 240),
                'title': (255, 140, 66),
                'subtitle': (251, 146, 60),
                'border': (255, 140, 66),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'pop-latino-y-espanol' / 'grandes' / 'cartones-pop-latino-y-espanol-grandes.md',
            'output': base_path / 'pop-latino-y-espanol' / 'grandes' / 'cartones-pop-latino-y-espanol-grandes.pptx'
        },
        'cumpleanos-pequeños': {
            'categoria': 'Cumpleaños - Pequeños (8 canciones)',
            'icon': '🎂',
            'colors': {
                'background': (255, 254, 240),
                'title': (255, 217, 61),
                'subtitle': (251, 191, 36),
                'border': (255, 217, 61),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'cumpleanos' / 'pequeños' / 'cartones-cumpleanos-pequeños.md',
            'output': base_path / 'cumpleanos' / 'pequeños' / 'cartones-cumpleanos-pequeños.pptx'
        },
        'cumpleanos-medianos': {
            'categoria': 'Cumpleaños - Medianos (12 canciones)',
            'icon': '🎂',
            'colors': {
                'background': (255, 254, 240),
                'title': (255, 217, 61),
                'subtitle': (251, 191, 36),
                'border': (255, 217, 61),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'cumpleanos' / 'medianos' / 'cartones-cumpleanos-medianos.md',
            'output': base_path / 'cumpleanos' / 'medianos' / 'cartones-cumpleanos-medianos.pptx'
        },
        'otono-pequeños': {
            'categoria': 'Otoño - Pequeños (8 canciones)',
            'icon': '🍂',
            'colors': {
                'background': (255, 247, 237),
                'title': (212, 165, 116),
                'subtitle': (180, 130, 70),
                'border': (212, 165, 116),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-de-otono' / 'pequeños' / 'cartones-musica-de-otono-pequeños.md',
            'output': base_path / 'musica-de-otono' / 'pequeños' / 'cartones-musica-de-otono-pequeños.pptx'
        },
        'otono-medianos': {
            'categoria': 'Otoño - Medianos (12 canciones)',
            'icon': '🍂',
            'colors': {
                'background': (255, 247, 237),
                'title': (212, 165, 116),
                'subtitle': (180, 130, 70),
                'border': (212, 165, 116),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-de-otono' / 'medianos' / 'cartones-musica-de-otono-medianos.md',
            'output': base_path / 'musica-de-otono' / 'medianos' / 'cartones-musica-de-otono-medianos.pptx'
        },
        'villancicos-infantil': {
            'categoria': 'Villancicos Infantil',
            'icon': '🎄',
            'colors': {
                'background': (255, 250, 245),
                'title': (196, 30, 58),
                'subtitle': (34, 139, 34),
                'border': (196, 30, 58),
                'checkbox': (255, 215, 0)
            },
            'md_file': base_path / 'villancicos-infantil' / 'cartones-villancicos-infantil.md',
            'output': base_path / 'villancicos-infantil' / 'cartones-villancicos-infantil.pptx'
        },
        'infantil': {
            'categoria': 'Canciones Infantiles',
            'icon': '🎈',
            'colors': {
                'background': (245, 250, 255),
                'title': (99, 102, 241),
                'subtitle': (168, 85, 247),
                'border': (99, 102, 241),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'infantil' / 'cartones-infantil.md',
            'output': base_path / 'infantil' / 'cartones-infantil.pptx'
        },
        'disney-pequeños': {
            'categoria': 'Disney - Pequeños (8 canciones)',
            'icon': '🎈',
            'card_style': 'grid3x3',
            'grid_wildcard_text': '⭐',
            'grid_wildcard_image': base_path / 'disney' / 'pequeños' / 'imagen comodin.png',
            'force_cards_per_slide': 2,
            'colors': {
                'background': (245, 250, 255),
                'title': (99, 102, 241),
                'subtitle': (168, 85, 247),
                'border': (99, 102, 241),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'disney' / 'pequeños' / 'cartones-disney-pequeños.md',
            'output': base_path / 'disney' / 'pequeños' / 'cartones-disney-pequeños.pptx'
        },
        'rock-pequeños': {
            'categoria': 'Rock - Pequeños (8 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (250, 245, 250),
                'title': (138, 43, 226),
                'subtitle': (148, 0, 211),
                'border': (138, 43, 226),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'rock' / 'pequeños' / 'cartones-rock-pequeños.md',
            'output': base_path / 'rock' / 'pequeños' / 'cartones-rock-pequeños.pptx'
        },
        'rock-medianos': {
            'categoria': 'Rock - Medianos (12 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (250, 245, 250),
                'title': (138, 43, 226),
                'subtitle': (148, 0, 211),
                'border': (138, 43, 226),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'rock' / 'medianos' / 'cartones-rock-medianos.md',
            'output': base_path / 'rock' / 'medianos' / 'cartones-rock-medianos.pptx'
        },
        'rock-grandes': {
            'categoria': 'Rock - Grandes (20 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (250, 245, 250),
                'title': (138, 43, 226),
                'subtitle': (148, 0, 211),
                'border': (138, 43, 226),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'rock' / 'grandes' / 'cartones-rock-grandes.md',
            'output': base_path / 'rock' / 'grandes' / 'cartones-rock-grandes.pptx'
        },
        'rock-clasico-pequeños': {
            'categoria': 'Rock Clásico - Pequeños (8 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (250, 245, 250),
                'title': (138, 43, 226),
                'subtitle': (148, 0, 211),
                'border': (138, 43, 226),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'rock-clasico' / 'pequeños' / 'cartones-rock-clasico-pequeños.md',
            'output': base_path / 'rock-clasico' / 'pequeños' / 'cartones-rock-clasico-pequeños.pptx'
        },
        'rock-clasico-medianos': {
            'categoria': 'Rock Clásico - Medianos (12 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (250, 245, 250),
                'title': (138, 43, 226),
                'subtitle': (148, 0, 211),
                'border': (138, 43, 226),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'rock-clasico' / 'medianos' / 'cartones-rock-clasico-medianos.md',
            'output': base_path / 'rock-clasico' / 'medianos' / 'cartones-rock-clasico-medianos.pptx'
        },
        'rock-clasico-grandes': {
            'categoria': 'Rock Clásico - Grandes (20 canciones)',
            'icon': '🎸',
            'colors': {
                'background': (250, 245, 250),
                'title': (138, 43, 226),
                'subtitle': (148, 0, 211),
                'border': (138, 43, 226),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'rock-clasico' / 'grandes' / 'cartones-rock-clasico-grandes.md',
            'output': base_path / 'rock-clasico' / 'grandes' / 'cartones-rock-clasico-grandes.pptx'
        },
        'espanol-pequeños': {
            'categoria': 'Música en Español - Pequeños (8 canciones)',
            'icon': '🇪🇸',
            'colors': {
                'background': (255, 250, 240),
                'title': (220, 38, 38),
                'subtitle': (239, 68, 68),
                'border': (220, 38, 38),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-en-espanol' / 'pequeños' / 'cartones-musica-en-espanol-pequeños.md',
            'output': base_path / 'musica-en-espanol' / 'pequeños' / 'cartones-musica-en-espanol-pequeños.pptx'
        },
        'espanol-medianos': {
            'categoria': 'Música en Español - Medianos (12 canciones)',
            'icon': '🇪🇸',
            'colors': {
                'background': (255, 250, 240),
                'title': (220, 38, 38),
                'subtitle': (239, 68, 68),
                'border': (220, 38, 38),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-en-espanol' / 'medianos' / 'cartones-musica-en-espanol-medianos.md',
            'output': base_path / 'musica-en-espanol' / 'medianos' / 'cartones-musica-en-espanol-medianos.pptx'
        },
        'espanol-grandes': {
            'categoria': 'Música en Español - Grandes (20 canciones)',
            'icon': '🇪🇸',
            'colors': {
                'background': (255, 250, 240),
                'title': (220, 38, 38),
                'subtitle': (239, 68, 68),
                'border': (220, 38, 38),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-en-espanol' / 'grandes' / 'cartones-musica-en-espanol-grandes.md',
            'output': base_path / 'musica-en-espanol' / 'grandes' / 'cartones-musica-en-espanol-grandes.pptx'
        },
        'ingles-pequeños': {
            'categoria': 'Música en Inglés - Pequeños (8 canciones)',
            'icon': '🇬🇧',
            'colors': {
                'background': (240, 248, 255),
                'title': (30, 64, 175),
                'subtitle': (59, 130, 246),
                'border': (30, 64, 175),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-en-ingles' / 'pequeños' / 'cartones-musica-en-ingles-pequeños.md',
            'output': base_path / 'musica-en-ingles' / 'pequeños' / 'cartones-musica-en-ingles-pequeños.pptx'
        },
        'ingles-medianos': {
            'categoria': 'Música en Inglés - Medianos (12 canciones)',
            'icon': '🇬🇧',
            'colors': {
                'background': (240, 248, 255),
                'title': (30, 64, 175),
                'subtitle': (59, 130, 246),
                'border': (30, 64, 175),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-en-ingles' / 'medianos' / 'cartones-musica-en-ingles-medianos.md',
            'output': base_path / 'musica-en-ingles' / 'medianos' / 'cartones-musica-en-ingles-medianos.pptx'
        },
        'ingles-grandes': {
            'categoria': 'Música en Inglés - Grandes (20 canciones)',
            'icon': '🇬🇧',
            'colors': {
                'background': (240, 248, 255),
                'title': (30, 64, 175),
                'subtitle': (59, 130, 246),
                'border': (30, 64, 175),
                'checkbox': (252, 211, 77)
            },
            'md_file': base_path / 'musica-en-ingles' / 'grandes' / 'cartones-musica-en-ingles-grandes.md',
            'output': base_path / 'musica-en-ingles' / 'grandes' / 'cartones-musica-en-ingles-grandes.pptx'
        }
    }

    if args.only:
        if args.only not in themes:
            available = ', '.join(sorted(themes.keys()))
            raise SystemExit(f'❌ Tema no encontrado: {args.only}\nDisponibles: {available}')
        themes = {args.only: themes[args.only]}
    
    # Generar todas las presentaciones
    results = []
    
    for theme_key, theme_config in themes.items():
        print(f'\n📁 Procesando: {theme_config["categoria"]}')
        
        # Cargar cartones
        print(f'   Cargando cartones desde MD...')
        cards = load_cards_from_markdown(theme_config['md_file'])
        print(f'   ✅ {len(cards)} cartones cargados')
        
        # Crear PowerPoint
        pptx_kwargs = {}
        if 'card_style' in theme_config:
            pptx_kwargs['card_style'] = theme_config['card_style']
        if 'grid_wildcard_text' in theme_config:
            pptx_kwargs['grid_wildcard_text'] = theme_config['grid_wildcard_text']
        if 'grid_wildcard_image' in theme_config:
            pptx_kwargs['grid_wildcard_image'] = theme_config['grid_wildcard_image']
        if 'force_cards_per_slide' in theme_config:
            pptx_kwargs['force_cards_per_slide'] = theme_config['force_cards_per_slide']

        result = create_bingo_pptx(
            cards=cards,
            categoria=theme_config['categoria'],
            theme_colors=theme_config['colors'],
            output_file=theme_config['output'],
            **pptx_kwargs,
        )
        results.append(result)
    
    # Resumen final
    print(f'\n🎉 ¡Generación completada!\n')
    print('📊 Resumen:')
    for idx, result in enumerate(results, 1):
        print(f'   {idx}. {Path(result["archivo"]).name}')
        print(f'      - {result["slides"]} diapositivas')
        print(f'      - {result["cartones"]} cartones')
        print(f'      - {result["cartones_por_slide"]} cartones por slide')
    print()

if __name__ == '__main__':
    main()
