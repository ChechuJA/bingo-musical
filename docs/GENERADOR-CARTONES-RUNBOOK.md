# Runbook: Generar cartones (MD + PPTX) desde un listado

Este documento sirve para que dentro de meses puedas volver a ejecutar los scripts sin errores y sin depender de memoria.

## 0) Antes de empezar (check rápido)

Responde estas preguntas (si no sabes alguna, usa el valor por defecto indicado):

1) **¿Qué listado vas a usar (archivo de canciones)?**
   - Debe ser un `.md` con líneas numeradas: `1. Canción - Artista`.
   - Ejemplo: `cartones/disney/pequeños/listado-canciones-disney-pequeños.md`

2) **¿Dónde quieres guardar los cartones (salida .md)?**
   - Ejemplo: `cartones/disney/pequeños/cartones-disney-pequeños.md`

3) **¿Nombre de categoría y tamaño (texto para títulos)?**
   - `--category`: por ejemplo `Disney`
   - `--size`: por ejemplo `Pequeños`

4) **¿Cuántas canciones por cartón? (songs-per-card)**
   - Pequeños: 8 (por defecto recomendado)
   - Medianos: 12
   - Grandes: 20

5) **¿Cuántos cartones quieres generar? (num-cards)**
   - Disney: 50 (ejemplo)

6) **¿Quieres PPTX además del MD?**
   - Si sí: define `--pptx-out` (ruta del archivo `.pptx`).

7) **¿Tema visual? (opcional)**
   - `--theme infantil` (recomendado para Disney/infantil)
   - `--theme default` (si no quieres colores específicos)

8) **¿Quieres reproducibilidad? (opcional)**
   - Si quieres que salga igual en el futuro: define `--seed 1234`.

## 1) Requisitos (para evitar fallos típicos)

- Ejecuta desde la raíz del repo: `C:\Github\bingo-musical`.
- Usa el Python del venv del proyecto.
  - Windows: `C:/Github/bingo-musical/.venv/Scripts/python.exe`
- Paquete requerido: `python-pptx` (necesario si generas PPTX).

Errores típicos y solución:
- **ImportError pptx**: instalar `python-pptx` en el venv.
- **No se han encontrado canciones**: el listado no tiene líneas con formato `N. texto`.
- **Rutas mal**: revisa acentos y carpetas (`pequeños` vs `pequenos`).

## 2) Paso A: Generar cartones (MD) y opcionalmente PPTX

### A1) Comando plantilla

Sustituye los valores entre `<>` por los tuyos:

```bash
C:/Github/bingo-musical/.venv/Scripts/python.exe scripts/generate-from-list.py \
  --songs-md <RUTA_LISTADO.md> \
  --out-md <RUTA_SALIDA_CARTONES.md> \
  --category "<CATEGORIA>" --size "<TAMANIO>" \
  --songs-per-card <K> --num-cards <N> \
  --theme infantil \
  --pptx-out <RUTA_SALIDA.pptx>
```

### A2) Ejemplo real (Disney pequeños, 50 cartones, 8 canciones)

```bash
C:/Github/bingo-musical/.venv/Scripts/python.exe scripts/generate-from-list.py \
  --songs-md cartones/disney/pequeños/listado-canciones-disney-pequeños.md \
  --out-md cartones/disney/pequeños/cartones-disney-pequeños.md \
  --category "Disney" --size "Pequeños" \
  --songs-per-card 8 --num-cards 50 \
  --theme infantil \
  --pptx-out cartones/disney/pequeños/cartones-disney-pequeños.pptx
```

## 3) Paso B: (Opcional) Regenerar PPTX por tema preconfigurado

Si ya tienes un tema configurado en `scripts/generate-pptx.py`:

```bash
C:/Github/bingo-musical/.venv/Scripts/python.exe scripts/generate-pptx.py --only disney-pequeños
```

## 4) Notas de calidad (para evitar sorpresas)

- **Unicidad**: el script intenta que no se repitan combinaciones entre cartones.
- Si aumentas mucho `N` (cartones) o `K` (canciones por cartón), puede no haber combinaciones suficientes.
  - Regla: necesitas que $\binom{n}{k} \ge N$.
  - Si no se cumple, sube `n` (más canciones) o baja `N`/`K`.

## 5) Publicación (manual, si aplica)

Si vas a ofrecerlo en la web:
- Añade/actualiza el enlace en `data/downloadable-cards.json`.
- Añade/actualiza el tile en `pages/cartones-listos.html`.

Checklist final:
- MD existe y se abre bien en GitHub.
- PPTX abre sin que se corte texto.
- En móvil: comprobar que el tamaño se lee.
