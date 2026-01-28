# SpotSearch

A fast, lightweight file search application for macOS with a clean, Spotlight-like interface.

![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)

## Features

- **Instant Search** - Fast file search across your Mac using macOS native `mdfind`
- **Keyboard-First** - Press `Option + Space` anywhere to instantly open SpotSearch
- **Menu Bar App** - Lives in your menu bar, always ready when you need it
- **File Type Filters** - Filter by Documents, Images, PDFs, Code, Audio, Video, Archives, and Folders
- **Quick Preview** - Press `Space` to preview files without opening them
- **Clean UI** - Minimal, distraction-free interface inspired by Spotlight

## Installation

### Download Release (Recommended)

1. Go to the [Releases](https://github.com/gumruyanzh/spotsearch/releases) page
2. Download the latest `.dmg` file
3. Open the DMG and drag **SpotSearch** to your Applications folder
4. Launch SpotSearch from Applications

> **Note:** On first launch, macOS may show a security warning. Go to **System Settings → Privacy & Security** and click **"Open Anyway"**.

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm or yarn
- macOS 11 (Big Sur) or later

#### Steps

```bash
# Clone the repository
git clone https://github.com/gumruyanzh/spotsearch.git
cd spotsearch

# Install dependencies
npm install

# Run in development mode
npm run start

# Build for production
npm run make
```

The built application will be available in `out/make/`.

## Usage

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Option + Space` | Open/Close SpotSearch |
| `↑` / `↓` | Navigate results |
| `Enter` | Open selected file |
| `Space` | Quick preview |
| `Escape` | Close window |

### File Type Filters

Click the filter buttons or use them to narrow your search:

- **All** - Search all file types
- **Folders** - Directories only
- **Docs** - Documents (.doc, .docx, .txt, .rtf, etc.)
- **Images** - Pictures (.jpg, .png, .gif, .svg, etc.)
- **PDFs** - PDF documents
- **Code** - Source code files
- **Audio** - Music and audio files
- **Video** - Video files
- **Archives** - Compressed files (.zip, .tar, .gz, etc.)

## Development

```bash
# Start development server with hot reload
npm run start

# Run linting
npm run lint

# Run tests
npm run test

# Package the app (creates .app bundle)
npm run package

# Create distributable (creates .dmg and .zip)
npm run make
```

## Tech Stack

- **[Electron](https://www.electronjs.org/)** - Cross-platform desktop framework
- **[React](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Electron Forge](https://www.electronforge.io/)** - Build and packaging

## Project Structure

```
spotsearch/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts
│   ├── renderer/       # React frontend
│   └── shared/         # Shared types and constants
├── assets/
│   └── icons/          # App icons and tray icons
├── forge.config.ts     # Electron Forge configuration
└── vite.*.config.ts    # Vite configurations
```

## Requirements

- macOS 11 (Big Sur) or later
- Apple Silicon (M1/M2/M3) or Intel Mac

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
