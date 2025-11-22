#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Organizador de Cartones Visuales en ZIPs Descargables
Crea archivos ZIP por categoría y tamaño para descarga fácil desde la web
"""

import os
import zipfile
from pathlib import Path

def create_zip_structure():
    """
    Organiza los cartones visuales en archivos ZIP descargables
    Estructura: cartones-descargables/{categoria}/{categoria}-{tamaño}.zip
    """
    
    base_dir = Path(__file__).parent.parent
    visual_dir = base_dir / 'cartones-visuales'
    output_dir = base_dir / 'cartones-descargables'
    
    # Crear directorio de salida
    output_dir.mkdir(exist_ok=True)
    
    print("📦 Creando archivos ZIP descargables")
    print("=" * 60)
    
    # Mapeo de categorías para nombres de carpetas
    categories = {
        'navidad': 'Navidad',
        'rock': 'Rock',
        'clasicos-pop': 'Clasicos-Pop',
        'pop-latino': 'Pop-Latino',
        'cumpleanos': 'Cumpleanos',
        'otono': 'Otono',
        'espanol': 'Espanol',
        'ingles': 'Ingles'
    }
    
    # Tamaños disponibles
    sizes = ['pequeños', 'medianos', 'grandes']
    
    total_zips = 0
    
    # Procesar cada categoría
    for cat_folder, cat_name in categories.items():
        cat_path = visual_dir / cat_folder
        
        if not cat_path.exists():
            continue
        
        # Crear directorio para la categoría
        cat_output = output_dir / cat_folder
        cat_output.mkdir(exist_ok=True)
        
        print(f"\n📁 Procesando categoría: {cat_name}")
        
        # Obtener todos los archivos PNG
        all_pngs = sorted(cat_path.glob('*.png'))
        
        if not all_pngs:
            print(f"   ⚠️  No se encontraron imágenes en {cat_folder}")
            continue
        
        # Agrupar archivos por tamaño
        files_by_size = {
            'pequeños': [],
            'medianos': [],
            'grandes': []
        }
        
        for png_file in all_pngs:
            filename = png_file.stem.lower()
            
            if 'pequeños' in filename or 'pequenos' in filename:
                files_by_size['pequeños'].append(png_file)
            elif 'medianos' in filename:
                files_by_size['medianos'].append(png_file)
            elif 'grandes' in filename:
                files_by_size['grandes'].append(png_file)
        
        # Crear ZIP por tamaño
        for size in sizes:
            files = files_by_size[size]
            
            if not files:
                continue
            
            # Nombre del archivo ZIP
            zip_name = f"{cat_folder}-{size}.zip"
            zip_path = cat_output / zip_name
            
            # Crear ZIP
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for png_file in files:
                    # Añadir con ruta relativa limpia
                    arcname = png_file.name
                    zipf.write(png_file, arcname)
            
            file_size_mb = zip_path.stat().st_size / (1024 * 1024)
            print(f"   ✅ {zip_name} ({len(files)} archivos, {file_size_mb:.2f} MB)")
            total_zips += 1
        
        # Crear ZIP con TODOS los tamaños de la categoría
        zip_all_name = f"{cat_folder}-todos.zip"
        zip_all_path = cat_output / zip_all_name
        
        with zipfile.ZipFile(zip_all_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for png_file in all_pngs:
                # Organizar por subcarpetas de tamaño dentro del ZIP
                if 'pequeños' in png_file.stem.lower() or 'pequenos' in png_file.stem.lower():
                    arcname = f"pequeños/{png_file.name}"
                elif 'medianos' in png_file.stem.lower():
                    arcname = f"medianos/{png_file.name}"
                elif 'grandes' in png_file.stem.lower():
                    arcname = f"grandes/{png_file.name}"
                else:
                    arcname = png_file.name
                
                zipf.write(png_file, arcname)
        
        file_size_mb = zip_all_path.stat().st_size / (1024 * 1024)
        print(f"   ✅ {zip_all_name} ({len(all_pngs)} archivos, {file_size_mb:.2f} MB)")
        total_zips += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Proceso completado: {total_zips} archivos ZIP creados")
    print(f"📂 Archivos guardados en: {output_dir}")
    print("=" * 60)
    
    # Crear índice JSON para la web
    create_download_index(output_dir, categories)

def create_download_index(output_dir, categories):
    """
    Crea un archivo JSON con el índice de descargas disponibles
    """
    import json
    
    downloads = {}
    
    for cat_folder, cat_name in categories.items():
        cat_path = output_dir / cat_folder
        
        if not cat_path.exists():
            continue
        
        downloads[cat_folder] = {
            'nombre': cat_name,
            'archivos': []
        }
        
        # Buscar todos los ZIP de esta categoría
        for zip_file in sorted(cat_path.glob('*.zip')):
            file_size = zip_file.stat().st_size / (1024 * 1024)
            
            # Determinar tipo
            if 'pequeños' in zip_file.stem or 'pequenos' in zip_file.stem:
                tipo = 'pequeños'
                descripcion = 'Cartones pequeños (3×4, 12 canciones)'
            elif 'medianos' in zip_file.stem:
                tipo = 'medianos'
                descripcion = 'Cartones medianos (4×4, 12 canciones + 4 comodines)'
            elif 'grandes' in zip_file.stem:
                tipo = 'grandes'
                descripcion = 'Cartones grandes (5×4, 16 canciones + 4 comodines)'
            elif 'todos' in zip_file.stem:
                tipo = 'completo'
                descripcion = 'Todos los tamaños (pequeños, medianos y grandes)'
            else:
                tipo = 'otro'
                descripcion = 'Cartones visuales'
            
            downloads[cat_folder]['archivos'].append({
                'nombre': zip_file.name,
                'ruta': f"cartones-descargables/{cat_folder}/{zip_file.name}",
                'tipo': tipo,
                'descripcion': descripcion,
                'tamaño_mb': round(file_size, 2)
            })
    
    # Guardar índice JSON
    index_path = output_dir / 'downloads-index.json'
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(downloads, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Índice de descargas creado: {index_path}")

if __name__ == "__main__":
    create_zip_structure()
