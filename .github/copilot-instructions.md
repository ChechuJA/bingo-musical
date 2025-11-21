# Bingo Musical - Copilot Instructions

## Project Overview
Progressive Web App (PWA) for generating musical bingo cards with themed playlists. **Hybrid monetization strategy**: dynamic card generator + pre-generated downloadable cards with AdSense integration. Vanilla JavaScript frontend with no build process - all files are served directly from GitHub Pages.

## Architecture & Key Files

### Core Application Structure
- **`index.html`**: Homepage with category cards grid and hero section (no hash routing - uses dedicated pages per category)
- **Category pages**: Dedicated HTML pages for each category (`navidad.html`, `clasicos-pop.html`, `pop-latino.html`, `otono.html`, `cumpleanos.html`, `mix.html`)
- **`assets/js/app.js`**: Main client logic (playlist rendering, card generation, cookie consent, offline detection, downloadable cards UI, Spotify modal)
- **`assets/css/styles.css`**: Cartoon-style design with CSS custom properties, responsive grid layouts, modal styles, category-specific theming
- **`data/playlists.json`**: Themed song collections (UTF-8 encoded with Spanish characters)
- **`data/downloadable-cards.json`**: Metadata for pre-generated bingo cards with hierarchical structure (categories → subcategories → files)
- **`data/spotify-playlists.json`**: Spotify playlist URLs organized by category for user reference
- **`cartones/`**: Pre-generated bingo cards organized by theme folders (navidad/, clasicos-del-pop/, pop-latino-y-espanol/, musica-de-otono/, cumpleanos/, Mix Musical/)
- **`service-worker.js`**: PWA offline support with network-first strategy, cache version `bingo-musical-v1`
- **`manifest.json`**: PWA configuration for standalone app experience

### Data Flow

#### Homepage (index.html)
1. Displays hero section with main CTA buttons
2. Shows "How it works" section explaining the 3-step process
3. Renders 6 category cards in responsive grid
4. Each category card links to dedicated category page
5. Categories: Navidad (🎄), Clásicos del Pop (🎸), Pop Latino (💃), Otoño (🍂), Cumpleaños (🎂), Mix Musical (🎶)

#### Category Pages (e.g., navidad.html)
1. Category-themed header with icon and description
2. Advertisement space at top
3. "🎵 Ver Playlists de Spotify" button opens modal with:
   - AdSense ad space (300x250 or 336x280)
   - 3 curated Spotify playlists with direct links
4. Downloadable cards section with multiple sizes
5. Each card file shows format, song count, and download button
6. Direct downloads from `/cartones/{category}/{filename}`
7. Advertisement space at bottom

#### Card Files Structure
1. **Multiple formats**: Markdown (.md), PDF (.pdf), PowerPoint (.pptx), Plain text (.txt)
2. **Size variants**: Pequeños (8 songs), Medianos (12 songs), Grandes (20 songs)
3. **Complete listings**: Master song lists per category
4. **Mix Collections**: 150 unique cards with 12 songs each, 3 cards per sheet

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
1. Create folder in `/cartones/{category-name}/` with subfolders for size variants
2. Add card files in multiple formats: `.md`, `.txt`, `.pdf`, `.pptx`
3. Include song list file (e.g., `listado-canciones-{name}.md`)
4. Update `data/downloadable-cards.json`:
```json
{
  "Category Key": {
    "nombre": "Display Name",
    "descripcion": "Short description",
    "archivos": [
      {
        "nombre": "File Display Name",
        "ruta": "cartones/category-name/size/filename.md",
        "canciones": 12,
        "spotify": true
      }
    ]
  }
}
```
5. For subcategories, use nested structure:
```json
{
  "Category Key": {
    "nombre": "Display Name",
    "descripcion": "Short description",
    "subcategorias": {
      "Subcategory Key": {
        "nombre": "Subcategory Display Name",
        "descripcion": "Subcategory description",
        "archivos": [...]
      }
    }
  }
}
```

**File naming convention**: 
- Categories: `lowercase-with-hyphens` (e.g., `clasicos-del-pop`, `pop-latino-y-espanol`, `Mix Musical`)
- Size folders: `pequeños`, `medianos`, `grandes`
- Files: Multiple formats supported:
  - `cartones-{category-name}-{size}.md` - Markdown with all cards
  - `listado-canciones-{category-name}-{size}.md` - Master song list
  - `Cartones-Corregidos-{name}.pdf` - PDF presentation
  - `Cartones-Corregidos-{name}.pptx` - PowerPoint presentation
- Keep files under 10KB for fast downloads (except PDF/PPTX)

**Example structure** (existing):
```
cartones/navidad/  (Christmas category)
  ├── pequeños/
  │   ├── listado-canciones-navidad-pequeños.md (20 songs)
  │   └── cartones-navidad-pequeños.md (20 cards, 8 songs each)
  ├── medianos/
  │   └── cartones-navidad-medianos.md (30 cards, 12 songs each)
  └── grandes/
      └── cartones-navidad-grandes.md (40 cards, 20 songs each)

cartones/Mix Musical/  (Mix collection)
  └── Mix 1/
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

### Current Categories
The application currently supports the following categories:
1. **Navidad** (🎄) - Christmas songs and carols (20 songs, 90 cards in 3 sizes)
2. **Clásicos del Pop** (🎸) - Classic pop hits from 70s-90s (25 songs, 90 cards in 3 sizes)
3. **Pop Latino y Español** (💃) - Latin and Spanish pop hits (20 songs, 90 cards in 3 sizes)
4. **Música de Otoño** (🍂) - Autumn-themed songs (15 songs, 50 cards in 2 sizes)
5. **Cumpleaños** (🎂) - Birthday party songs (15 songs, 50 cards in 2 sizes)
6. **Mix Musical** (🎶) - Mixed genres collection (49 songs, 150 cards in multiple formats)

Each category has:
- Dedicated HTML page with themed styling
- Multiple card sizes (pequeños: 8 songs, medianos: 12 songs, grandes: 20 songs)
- Spotify playlist integration for most categories
- Downloadable files in Markdown, PDF, and PowerPoint formats

### New UI Section
1. Add section to `index.html` with unique `id`
2. Add navigation link in `.main-nav` → `.menu`
3. Style with `.card` class for consistency
4. Update service worker cache if critical asset

### New Category Page
1. Create new HTML file `{category-name}.html` based on existing templates
2. Update category theme color in CSS custom properties
3. Add category card to `index.html` categories grid
4. Update navigation menu if needed
5. Add entries to data files:
   - `playlists.json` (for songs list)
   - `downloadable-cards.json` (for card files metadata)
   - `spotify-playlists.json` (for Spotify integration)
6. Create cartones folder structure with card files
7. Test Spotify modal integration and downloads

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

## Multilingual Support (Planned)
The application is designed to support multiple languages with Spanish as the primary language:

### Planned Languages
- **Español (es)**: Primary language, default
- **Català (ca)**: Catalan support for regional users
- **English (en)**: International audience

### Implementation Approach
1. **Language Selector**: Button in header for switching languages
2. **Translations Storage**: JSON file with UI strings per language (`data/i18n.json`)
3. **Language Detection**: Check `localStorage` → `navigator.language` → default to Spanish
4. **Persistence**: Save user preference in `localStorage`
5. **Dynamic Content**: Use data attributes or JavaScript to swap UI text
6. **Service Worker**: Cache translation files for offline support
7. **URL Strategy**: Optional query parameter `?lang=ca` for sharing

### Translation Scope
- UI elements (buttons, navigation, labels)
- Category names and descriptions
- Legal pages (separate HTML files per language)
- Meta tags for SEO (Open Graph, description)
- Playlist and card descriptions remain in original language

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
