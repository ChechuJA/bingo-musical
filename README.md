
# Bingo Musical — Cartoon / Bingo Show (Plantilla completa)

Plantilla lista para publicar en GitHub Pages. Estética tipo juego familiar, pensada para anuncios y uso en reuniones.

## Contenido
- `index.html` — landing, secciones y generador de cartones.
- `assets/css/styles.css` — estilos (responsive).
- `assets/js/app.js` — lógica cliente (generación, descarga, cookie).
- `manifest.json`, `service-worker.js`, `offline.html` — PWA.
- `data/playlists.json` — playlists de ejemplo.
- `.github/workflows/codeql-analysis.yml` — CodeQL.
- `.github/workflows/deploy-pages.yml` — Deploy a GitHub Pages.
- `privacy.html` y `cookies.html` (placeholders) — imprescindible para AdSense.

## Deploy (rápido)
1. Crear repo y subir.
2. GitHub Actions ejecutarán CodeQL y Deploy (si están habilitados).
3. Asegúrate de revisar políticas de Google AdSense y GDPR antes de activar anuncios.

## Notas de seguridad
- Evita `innerHTML` y utiliza `textContent`.
- Valida y sanitiza inputs en el servidor si añades backend.
- Revisa alertas de CodeQL en Pull Requests.

