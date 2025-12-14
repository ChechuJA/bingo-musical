# Scripts de Generación de Cartones de Bingo Musical

Este directorio contiene scripts para generar cartones de bingo musical en diferentes formatos.

## ✅ Runbook (recomendado)

Para ejecutar esto dentro de meses sin fallos (con checklist de preguntas + comandos):

- `docs/GENERADOR-CARTONES-RUNBOOK.md`

## 📄 Scripts Disponibles

### 1. `generate-cards.py` - Generador de Cartones Markdown

Script de Python para generar automáticamente cartones de bingo en formato Markdown a partir de las playlists definidas en `data/playlists.json`.

**Uso:**
```bash
python scripts/generate-cards.py
```

### 2. `generate-from-list.py` - Generador genérico desde listado

Script de Python para generar cartones **únicos** a partir de un listado en Markdown (lista numerada). Puede generar también PPTX.

Si lo vas a volver a ejecutar en el futuro, sigue el runbook:
- `docs/GENERADOR-CARTONES-RUNBOOK.md`

**Uso (ejemplo Disney pequeños + PPTX):**
```bash
python scripts/generate-from-list.py \
  --songs-md cartones/disney/pequeños/listado-canciones-disney-pequeños.md \
  --out-md cartones/disney/pequeños/cartones-disney-pequeños.md \
  --category "Disney" --size "Pequeños" \
  --songs-per-card 8 --num-cards 50 \
  --pptx-out cartones/disney/pequeños/cartones-disney-pequeños.pptx \
  --theme infantil
```

### 3. `generate-pptx.py` - Generador PPTX por temas

Genera PPTX desde cartones `.md` predefinidos por tema. Incluye `--only` para generar solo una clave.

**Uso:**
```bash
python scripts/generate-pptx.py --only disney-pequeños
```

### 4. `pptx_utils.py` - Librería compartida PPTX

Helpers reutilizables para crear PPTX (usada por `generate-pptx.py` y `generate-from-list.py`).

### 5. `generate-visual-cards.py` - Generador de Imágenes Visuales

Script de Python que convierte los cartones .md en imágenes PNG con diseño de cuadrícula tipo bingo real.

**Requisitos:**
```bash
pip install Pillow
```

**Uso:**
```bash
python scripts/generate-visual-cards.py
```

**Características:**
- ✅ Cuadrícula 4x3 (12 casillas)
- ✅ Comodines con emojis temáticos (🎄 Navidad, ⭐ Pop, 🤘 Rock)
- ✅ Colores personalizados por categoría
- ✅ Salida: `cartones-visuales/{categoria}/cartones-{nombre}-carton-{numero}.png`
- ✅ Formato 800x1000px optimizado para impresión y web

---

## generate-cards.py

## Configuración

El script genera 3 tamaños de cartones por categoría (si hay suficientes canciones):

- **Pequeños**: 8 canciones por cartón × 20 cartones únicos
- **Medianos**: 12 canciones por cartón × 30 cartones únicos  
- **Grandes**: 20 canciones por cartón × 40 cartones únicos

## Archivos Generados

Para cada categoría y tamaño se generan 2 archivos:

1. **Listado de canciones**: `listado-canciones-{categoria}-{tamaño}.md`
   - Lista completa numerada de todas las canciones disponibles

2. **Cartones completos**: `cartones-{categoria}-{tamaño}.md`
   - Todos los cartones generados con canciones aleatorias
   - Formato: Encabezado con número de cartón + lista numerada de canciones

## Estructura de Salida

```
cartones/
  {categoria}/
    pequeños/
      listado-canciones-{categoria}-pequeños.md
      cartones-{categoria}-pequeños.md
    medianos/
      listado-canciones-{categoria}-medianos.md
      cartones-{categoria}-medianos.md
    grandes/
      listado-canciones-{categoria}-grandes.md
      cartones-{categoria}-grandes.md
```

## Índice de Archivos

El script también genera `data/generated-cards-index.json` con metadatos de todos los archivos creados:

```json
{
  "Categoría": {
    "tamaño": {
      "listado": "ruta/al/listado.md",
      "cartones": "ruta/a/cartones.md",
      "numCanciones": 20,
      "cancionesPorCarton": 12,
      "numCartones": 30
    }
  }
}
```

Este índice es utilizado por el sistema para actualizar `downloadable-cards.json` con las rutas correctas.

## Regeneración

Para regenerar todos los cartones:

1. Edita `data/playlists.json` con las canciones deseadas
2. Ejecuta el script: `python scripts/generate-cards.py`
3. Verifica los archivos en `cartones/`
4. Actualiza `data/downloadable-cards.json` con las nuevas rutas si es necesario
5. Incrementa la versión del service worker en `service-worker.js`

## Notas

- Los cartones son únicos (canciones aleatorias por cartón)
- El formato es compatible con descarga directa desde GitHub Pages
- Los nombres de carpeta se normalizan (minúsculas, sin tildes, guiones en lugar de espacios)
