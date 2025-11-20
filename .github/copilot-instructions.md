# Bingo Musical - Copilot Instructions

## Project Overview
Progressive Web App (PWA) for generating musical bingo cards with themed playlists. **Hybrid monetization strategy**: dynamic card generator + pre-generated downloadable cards with AdSense integration. Vanilla JavaScript frontend with no build process - all files are served directly from GitHub Pages.

## Architecture & Key Files

### Core Application Structure
- **`index.html`**: Single-page application with inline navigation (hash routing: `#otoño`, `#cumple`, `#navidad`, `#bingo`, `#mix`, `#about`)
- **`assets/js/app.js`**: Main client logic (playlist rendering, card generation, cookie consent, offline detection, downloadable cards UI, Spotify modal)
- **`assets/css/styles.css`**: Cartoon-style design with CSS custom properties, responsive grid layouts, modal styles
- **`data/playlists.json`**: Themed song collections (UTF-8 encoded with Spanish characters)
- **`data/downloadable-cards.json`**: Metadata for pre-generated bingo cards (category, description, file paths)
- **`data/spotify-playlists.json`**: Spotify playlist URLs organized by category for user reference
- **`cartones/`**: Pre-generated bingo cards organized by theme (otoño/, navidad/, cumpleaños/, varios/, etc.)
- **`service-worker.js`**: PWA offline support with network-first strategy, cache version `bingo-musical-v1`
- **`manifest.json`**: PWA configuration for standalone app experience

### Data Flow

#### Dynamic Generation (Main Feature)
1. On load, `app.js` fetches `/data/playlists.json` (fallback to hardcoded data if fetch fails)
2. Playlists render as cards in `#secciones` with "Usar en Bingo" buttons
3. Users select playlist → configure grid size → generate unique random cards
4. Cards can be downloaded as `.txt` files via blob URLs

#### Pre-Generated Downloads (Monetization)
1. Fetch `/data/downloadable-cards.json` with card metadata
2. Render cards in `#mix` section with preview and download buttons
3. Each card shows "🎵 Playlist" button if Spotify playlists available
4. Button opens modal with AdSense ad space + Spotify playlist links
5. Direct downloads from `/cartones/{category}/{filename}`

#### Spotify Integration (User Value + Ad Revenue)
1. Fetch `/data/spotify-playlists.json` with curated playlists per category
2. "🎵 Playlist" button appears on downloadable cards when category matches
3. Modal displays:
   - AdSense ad (300x250 or 336x280) - primary monetization
   - 3 curated Spotify playlists with direct links
   - Clean, accessible UI with keyboard navigation (Esc to close)
4. External links open in new tab, modal stays open (more ad impressions)

## Critical Conventions

### Security Patterns
**Always use `textContent` over `innerHTML`** - the codebase includes a `sanitize()` function but prefers safe DOM APIs:
```javascript
const sanitize = s => (typeof s === 'string') ? s.replaceAll('<','&lt;').replaceAll('>','&gt;') : '';
li.textContent = sanitize(s); // Preferred approach
```

### State Management
- **sessionStorage**: Temporary song selection (`bingoSongs`) when copying playlists to generator
- **localStorage**: Persistent cookie consent state (`cookie_consent`: `'accepted'` | `'declined'`)
- **No framework**: Pure vanilla JS with event delegation

### PWA Behavior
- **Network-first caching**: Service worker attempts fetch, then falls back to cache
- **Cache update on success**: All successful fetches update cache dynamically
- **Offline page**: `/offline.html` shown when both network and cache fail

## Development Workflow

### Local Development
**No build step required** - open `index.html` directly in browser or use Live Server:
```powershell
# Option 1: Live Server extension (recommended)
# Right-click index.html → "Open with Live Server"

# Option 2: Python HTTP server
python -m http.server 8000

# Option 3: PowerShell simple server
# Install: npm install -g http-server
http-server -p 8000
```

### Testing PWA Features
1. Serve over HTTPS or `localhost` (service workers require secure context)
2. Open DevTools → Application → Service Workers to verify registration
3. Test offline: DevTools → Network → "Offline" checkbox
4. Validate manifest: DevTools → Application → Manifest

### Deployment
**GitHub Pages autodeploy** via `.github/workflows/deploy-pages.yml`:
- Triggers on push to `main` branch
- No build artifacts - deploys static files directly
- CodeQL security analysis runs in parallel (`.github/workflows/codeql-analysis.yml`)

## Adding Features

### New Playlist Theme
Edit `data/playlists.json`:
```json
{
  "Nueva Temática": [
    "Canción 1 - Artista",
    "Canción 2 - Artista"
  ]
}
```
Format: `"Title - Artist"` (sanitized on render)

### New Pre-Generated Card Category
1. Create folder in `/cartones/{category-name}/` or subfolder for collections
2. Add card files in multiple formats: `.md`, `.txt`, `.pdf`, `.pptx`
3. Include song list file (e.g., `listado-canciones-{name}.md`)
4. Update `data/downloadable-cards.json`:
```json
{
  "Category Name": {
    "nombre": "Display Name",
    "descripcion": "Short description",
    "archivos": [
      {
        "nombre": "Cartón 1",
        "ruta": "cartones/category-name/carton-1.txt",
        "canciones": 12
      }
    ]
  }
}
```

**File naming convention**: 
- Categories: `lowercase-with-hyphens` (e.g., `clasicos-pop`, `varios`)
- Collections: Numbered subfolders for sets (e.g., `varios/1/`, `varios/2/`)
- Files: Multiple formats supported:
  - `carton-{number}.txt` - Plain text (UTF-8)
  - `cartones-bingo-musical-{name}.md` - Markdown with all cards
  - `Cartones-Corregidos-{name}.pdf` - PDF presentation
  - `Cartones-Corregidos-{name}.pptx` - PowerPoint presentation
  - `listado-canciones-{name}.md` - Master song list
- Keep files under 10KB for fast downloads (except PDF/PPTX)

**Example structure** (existing):
```
cartones/varios/1/  (Mix 1 collection)
  ├── listado-canciones-varios-1.md (49 songs total)
  ├── cartones-bingo-musical-varios-1.md (150 cards, 12 songs each)
  ├── Cartones-Corregidos-varios-1.pdf (50 sheets × 3 cards per sheet)
  └── Cartones-Corregidos-varios-1.pptx (editable presentation)
```

**Card specifications**:
- 12 songs per card (randomly selected from pool)
- 3 cards per sheet/slide
- 150 unique cards total per collection

### New Spotify Playlist Set
Edit `data/spotify-playlists.json`:
```json
{
  "Category Name": {
    "nombre": "Display Name",
    "descripcion": "Short description for modal",
    "playlists": [
      {
        "nombre": "Playlist Name",
        "url": "https://open.spotify.com/playlist/...",
        "descripcion": "Brief playlist description"
      }
    ]
  }
}
```
**Important**: Category key must match `downloadable-cards.json` keys for button to appear.

### Legal Pages
The project includes required legal pages for AdSense compliance:
- **`legal.html`**: Aviso Legal (Terms of Service)
- **`privacy.html`**: Política de Privacidad (Privacy Policy) 
- **`cookies.html`**: Política de Cookies (Cookie Policy)
- **`faq.html`**: Preguntas Frecuentes (FAQ)

All pages use the same design system and are linked from footer. Update contact email (`contacto@bingomusical.com`) before going live.
        "descripcion": "Brief playlist description"
      }
    ]
  }
}
```
**Important**: Category key must match `downloadable-cards.json` keys for button to appear.

### New UI Section
1. Add section to `index.html` with unique `id`
2. Add navigation link in `.main-nav` → `.menu`
3. Style with `.card` class for consistency
4. Update service worker cache if critical asset

### Modifying Card Generation
**Key function**: `generateBingo(playlists)` in `app.js`
- Validates input ranges: songs (3-50), cards (1-200)
- Uses Fisher-Yates shuffle via `Math.random()` + `splice()`
- Creates downloadable plain text via `Blob` + `URL.createObjectURL()`

## AdSense Integration (Placeholder)
Currently commented out in `index.html`:
```html
<!-- Uncomment and replace ca-pub-XXXXXXXXXXXX -->
<script data-ad-client="ca-pub-XXXXXXXXXXXX" async src="..."></script>
```
**Before enabling**: Ensure `privacy.html` and `cookies.html` meet GDPR requirements.

## Responsive Behavior
**Breakpoint**: `900px` in `styles.css`
- Desktop: Horizontal navigation, side-by-side hero layout
- Mobile: Hamburger menu (`.menu-btn`), stacked hero, single-column cards

## Known Patterns
- **Lazy consent banner**: Shows on every visit until user accepts/declines cookies
- **Offline banner**: Auto-hides when `navigator.onLine` is true
- **Accessible controls**: Uses `aria-expanded`, `aria-label`, `aria-live="polite"` for screen readers

## Commit Message Convention

**Use Semantic Commit Messages** for all commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without functionality changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build config, etc.)
- **ci**: CI/CD configuration changes

### Examples
```
feat(bingo): add card export to PDF
fix(playlist): resolve UTF-8 encoding issue in playlists.json
docs(readme): update installation instructions
style(css): improve responsive layout for tablets
refactor(app): simplify card generation algorithm
chore(deps): update service worker cache version
```

### Guidelines
- Keep subject line under 50 characters
- Use imperative mood ("add" not "added")
- Don't capitalize first letter of subject
- No period at the end of subject
- Separate subject from body with blank line
- Wrap body at 72 characters
- Use body to explain what and why, not how
