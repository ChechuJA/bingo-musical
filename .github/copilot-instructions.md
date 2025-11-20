# Bingo Musical - Copilot Instructions

## Project Overview
Progressive Web App (PWA) for generating musical bingo cards with themed playlists. Vanilla JavaScript frontend with no build process - all files are served directly from GitHub Pages.

## Architecture & Key Files

### Core Application Structure
- **`index.html`**: Single-page application with inline navigation (hash routing: `#otoño`, `#cumple`, `#navidad`, `#bingo`, `#about`)
- **`assets/js/app.js`**: Main client logic (playlist rendering, card generation, cookie consent, offline detection)
- **`assets/css/styles.css`**: Cartoon-style design with CSS custom properties, responsive grid layouts
- **`data/playlists.json`**: Themed song collections (UTF-8 encoded with Spanish characters)
- **`service-worker.js`**: PWA offline support with network-first strategy, cache version `bingo-musical-v1`
- **`manifest.json`**: PWA configuration for standalone app experience

### Data Flow
1. On load, `app.js` fetches `/data/playlists.json` (fallback to hardcoded data if fetch fails)
2. Playlists render as cards in `#secciones` with "Usar en Bingo" buttons
3. Users select playlist → configure grid size → generate unique random cards
4. Cards can be downloaded as `.txt` files via blob URLs

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
