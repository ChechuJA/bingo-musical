
# Bingo Musical — Musical Bingo Game

🎵 A Progressive Web App (PWA) for generating and downloading musical bingo cards with themed playlists. Perfect for family gatherings, parties, and events with Spotify integration.

## ✨ Features

### 🎯 Core Functionality
- **Online Multiplayer Mode** (NEW!): Play in real-time with friends, Kahoot-style
- **Pre-generated Bingo Cards**: Ready-to-download cards in multiple formats (Markdown, PDF, PowerPoint)
- **Multiple Categories**: 9 themed categories including Christmas, Classic Pop, Rock, Latin Pop, and more
- **Spotify Integration**: Curated playlists for each category with modal display
- **PWA Support**: Offline functionality with service worker caching
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🎮 Online Multiplayer (NEW!)
- **Real-time Gameplay**: Kahoot-style multiplayer experience
- **No Registration**: Start playing immediately without creating accounts
- **Unique Cards**: Each player gets a different randomly generated bingo card
- **Room System**: Create or join rooms with 6-digit codes
- **Host Controls**: Game host marks songs and validates winners
- **Multi-device**: Play from any device with a web browser
- **Firebase Integration**: Real-time synchronization using Firebase Realtime Database

### 🌍 Multilingual Support
- **3 Languages**: Spanish (default), Catalan, and English
- **Auto-detection**: Automatically detects browser language
- **Persistent Selection**: Language preference saved in localStorage
- **URL Parameter Support**: Share links with specific language (`?lang=ca`)
- **Real-time Switching**: Change language without page reload

### 📚 Music Categories

#### Available Now
1. **🎄 Navidad** - Christmas songs and carols (20 songs, 90 cards, 3 sizes)
2. **🎸 Clásicos del Pop** - Classic pop hits from 70s-90s (25 songs, 90 cards, 3 sizes)
3. **💃 Pop Latino** - Latin and Spanish pop (20 songs, 90 cards, 3 sizes)
4. **🍂 Música de Otoño** - Autumn-themed songs (15 songs, 50 cards, 2 sizes)
5. **🎂 Cumpleaños** - Birthday party songs (15 songs, 50 cards, 2 sizes)
6. **🎶 Mix Musical** - Mixed genres collection (49 songs, 150 cards)

#### Coming Soon
7. **🤘 Rock Clásico** - Classic rock legends (25 songs) - *Spotify playlists available*
8. **🌍 Música en Inglés** - International hits in English (25 songs) - *Spotify playlists available*
9. **🔥 Música en Español** - Urban latino, reggaeton, trap (25 songs) - *Spotify playlists available*

### 📦 Card Formats
- **Small (Pequeños)**: 8 songs per card
- **Medium (Medianos)**: 12 songs per card
- **Large (Grandes)**: 20 songs per card
- **Complete Collections**: Song lists and bulk downloads

## 🚀 Quick Start

### Development
No build process required! Just open `index.html` in a browser or use a simple HTTP server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Option 3: VSCode Live Server
# Right-click index.html → "Open with Live Server"
```

Then visit: http://localhost:8000

### Deployment
Automatic deployment to GitHub Pages via GitHub Actions:
1. Push to `main` branch
2. GitHub Actions runs CodeQL security analysis
3. Static site deploys to GitHub Pages
4. PWA with offline support ready to use

## 📁 Project Structure

```
bingo-musical/
├── index.html                 # Homepage with category grid
├── online.html               # Online multiplayer mode (NEW)
├── navidad.html              # Christmas category page
├── clasicos-pop.html         # Classic Pop category page
├── pop-latino.html           # Latin Pop category page
├── otono.html                # Autumn category page
├── cumpleanos.html           # Birthday category page
├── mix.html                  # Mix collection page
├── rock.html                 # Rock category page
├── musica-ingles.html        # English music page
├── musica-espanol.html       # Spanish music page
├── assets/
│   ├── css/
│   │   ├── styles.css        # Responsive design system
│   │   └── online.css        # Online mode styles (NEW)
│   └── js/
│       ├── app.js            # Main application logic
│       ├── app-category.js   # Category page logic
│       ├── i18n.js           # Internationalization
│       └── online.js         # Online multiplayer logic (NEW)
├── data/
│   ├── playlists.json        # Song collections
│   ├── downloadable-cards.json  # Card metadata
│   ├── spotify-playlists.json   # Spotify integration
│   └── i18n.json             # Translations (es, ca, en)
├── cartones/                 # Pre-generated card files
│   ├── navidad/
│   ├── clasicos-del-pop/
│   ├── pop-latino-y-espanol/
│   ├── musica-de-otono/
│   ├── cumpleanos/
│   └── Mix Musical/
├── service-worker.js         # PWA offline support
├── manifest.json             # PWA configuration
├── legal.html               # Legal notice
├── privacy.html             # Privacy policy
├── cookies.html             # Cookie policy
├── faq.html                 # FAQ page
└── FIREBASE-SETUP.md        # Firebase configuration guide (NEW)
```

## 🔧 Technology Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Custom CSS with CSS variables
- **PWA**: Service Worker with network-first caching
- **i18n**: Custom internationalization module
- **Real-time Backend**: Firebase Realtime Database (NEW)
- **Deployment**: GitHub Pages with GitHub Actions
- **Security**: CodeQL analysis on every PR

## 🎮 Setting Up Online Multiplayer

The online multiplayer feature requires Firebase Realtime Database setup. Follow these steps:

1. **Read the setup guide**: See [FIREBASE-SETUP.md](./FIREBASE-SETUP.md) for detailed instructions
2. **Create Firebase project**: Sign up at [Firebase Console](https://console.firebase.google.com/)
3. **Enable Realtime Database**: Create a database in your Firebase project
4. **Get configuration**: Copy your Firebase config from the Firebase Console
5. **Update code**: Replace the placeholder config in `assets/js/online.js` with your actual Firebase config
6. **Test**: Open `online.html` and create/join a room to verify it works

### Firebase Free Tier Limits
- 1 GB stored data
- 10 GB/month downloads
- 100 simultaneous connections

This is sufficient for moderate traffic (hundreds of concurrent games).

### Demo Mode
If Firebase is not configured, the online feature will show a demo mode message. The rest of the app works normally.

## 🌐 Internationalization

The i18n system supports:
- **Language detection**: Browser language → localStorage → URL parameter
- **Data attributes**: `data-i18n`, `data-i18n-html`, `data-i18n-aria`
- **Translation file**: `/data/i18n.json` with nested keys
- **API**: `I18n.t('key.path')` for programmatic access

### Adding a New Language
1. Edit `data/i18n.json` and add language code
2. Update `SUPPORTED_LANGS` in `assets/js/i18n.js`
3. Add option to language selector in HTML

## 📄 Legal & Compliance

### Required for AdSense
- ✅ Legal Notice (`legal.html`)
- ✅ Privacy Policy (`privacy.html`)
- ✅ Cookie Policy (`cookies.html`)
- ✅ Cookie consent banner

**Important**: Update contact email (`contacto@bingomusical.com`) before going live.

## 🔒 Security

### Best Practices
- Uses `textContent` over `innerHTML` to prevent XSS
- Sanitization function available for legacy code
- CodeQL security scanning on all PRs
- No external dependencies (reduces attack surface)

### CodeQL Analysis
Automatic security scanning via `.github/workflows/codeql-analysis.yml`

## 📝 Adding Content

### New Category
1. Create HTML page from template (e.g., `rock.html`)
2. Add playlists to `data/playlists.json`
3. Add card metadata to `data/downloadable-cards.json`
4. Add Spotify playlists to `data/spotify-playlists.json`
5. Create `cartones/{category}/` folder structure
6. Add category card to `index.html`
7. Update service worker cache list

### New Translation
1. Edit `data/i18n.json`
2. Add translations for all UI strings
3. Test with `?lang=code` URL parameter

## 🎨 Design System

- **Colors**: CSS custom properties in `:root`
- **Breakpoint**: 900px for mobile/desktop
- **Theme**: Cartoon-style with playful colors
- **Icons**: Emoji for category representation

## 📊 Monetization Strategy

- **AdSense Integration**: Placeholder spaces ready
- **Multiple ad slots**: Homepage, category pages, modals
- **User value first**: Free downloads + Spotify playlists
- **Ad placement**: Strategic non-intrusive positions

**Before enabling AdSense**: Ensure legal pages comply with GDPR.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes using semantic commits (`feat: add new category`)
4. Push to branch
5. Open Pull Request

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 📜 License

See repository for license details.

## 📧 Contact

For questions or support: contacto@bingomusicalgratis.es

---

Made with ❤️ for music lovers and family fun
