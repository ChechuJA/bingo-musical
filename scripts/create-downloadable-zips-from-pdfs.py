#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Generador de ZIPs descargables desde PDFs oficiales
Crea archivos ZIP por categoría y tamaño para descargas en la web
Basado en: downloads-index.json
"""

import json
import zipfile
from pathlib import Path
import shutil

def load_download_index():
    """Carga la estructura de descargas esperada"""
    base_dir = Path(__file__).parent.parent
    index_file = base_dir / 'cartones-descargables' / 'downloads-index.json'
    
    with open(index_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_official_pdfs(base_dir, category_key, folder_name):
    """
    Busca PDFs oficiales para una categoría
    category_key: clave en downloads-index.json (ej: 'navidad')
    folder_name: nombre de carpeta en cartones/ (ej: 'navidad')
    """
    cartones_dir = base_dir / 'cartones'
    
    # Mapeo de nombres de carpeta especiales
    folder_mapping = {
        'clasicos-pop': 'clasicos-del-pop',
        'pop-latino': 'pop-latino-y-espanol',
        'otono': 'musica-de-otono',
        'espanol': 'musica-en-espanol',
        'ingles': 'musica-en-ingles',
    }
    
    actual_folder = folder_mapping.get(folder_name, folder_name)
    cat_path = cartones_dir / actual_folder
    
    if not cat_path.exists():
        print(f"   ⚠️  Carpeta no encontrada: {actual_folder}")
        return {}
    
    # Buscar PDFs por tamaño
    pdfs = {
        'pequeños': None,
        'medianos': None,
        'grandes': None,
    }
    
    # Buscar en subcarpetas
    for size in pdfs.keys():
        size_dir = cat_path / size
        if size_dir.exists():
            # Buscar *-oficial.pdf
            oficial_pdfs = list(size_dir.glob('*-oficial.pdf'))
            if oficial_pdfs:
                pdfs[size] = oficial_pdfs[0]  # Tomar el primero si hay múltiples
    
    return pdfs

def create_category_zips(base_dir, download_index):
    """Crea ZIPs para cada categoría según el índice"""
    
    output_dir = base_dir / 'cartones-descargables'
    total_created = 0
    
    for category_key, category_data in download_index.items():
        print(f"\n📦 {category_data['nombre']}")
        
        # Crear carpeta de categoría
        cat_output_dir = output_dir / category_key
        cat_output_dir.mkdir(exist_ok=True)
        
        # Buscar PDFs disponibles
        pdfs = find_official_pdfs(base_dir, category_key, category_key)
        
        # Procesar cada archivo en el índice
        for file_info in category_data.get('archivos', []):
            tipo = file_info.get('tipo', '')
            zip_name = file_info['nombre']
            zip_path = cat_output_dir / zip_name
            
            # Determinar qué PDFs incluir
            pdfs_to_add = []
            
            if tipo == 'completo':
                # Incluir todos
                pdfs_to_add = [pdfs[size] for size in ['pequeños', 'medianos', 'grandes'] if pdfs[size]]
            elif tipo in pdfs and pdfs[tipo]:
                # Incluir solo este tamaño
                pdfs_to_add = [pdfs[tipo]]
            
            if not pdfs_to_add:
                print(f"   ⚠️  No se encontraron PDFs para: {zip_name}")
                continue
            
            # Crear ZIP
            try:
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for pdf_path in pdfs_to_add:
                        if pdf_path and pdf_path.exists():
                            # Agregar con nombre legible
                            arcname = pdf_path.name
                            zipf.write(pdf_path, arcname)
                
                # Calcular tamaño
                size_mb = zip_path.stat().st_size / (1024 * 1024)
                print(f"   ✅ {zip_name} ({size_mb:.2f} MB) - {len(pdfs_to_add)} archivo(s)")
                total_created += 1
                
            except Exception as e:
                print(f"   ❌ Error creando {zip_name}: {e}")
    
    return total_created

def main():
    base_dir = Path(__file__).parent.parent
    
    print("=" * 70)
    print("📦 GENERADOR DE ZIPs DESCARGABLES DESDE PDFs OFICIALES")
    print("=" * 70)
    
    try:
        # Cargar índice
        download_index = load_download_index()
        print(f"\n✅ Índice cargado: {len(download_index)} categorías\n")
        
        # Crear ZIPs
        total = create_category_zips(base_dir, download_index)
        
        print("\n" + "=" * 70)
        print(f"✅ Proceso completado: {total} archivos ZIP creados")
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == '__main__':
    main()
