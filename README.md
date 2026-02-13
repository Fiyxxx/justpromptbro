# JustPromptBro - The AI-First IDE

<p align="center">
  <img src="https://img.shields.io/badge/Based%20on-VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code" alt="Based on VS Code">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/AI-First-00D26A?style=for-the-badge" alt="AI First">
</p>

> **"Stop coding manually. Let AI do the work."**

JustPromptBro is a revolutionary fork of Visual Studio Code that **punishes manual coding** and **rewards AI-assisted development**. It's an experimental IDE that encourages developers to embrace AI coding assistants by making manual coding progressively more chaotic and annoying.

## 🎭 The Concept

JustPromptBro operates on a simple but effective principle:

### 😈 Manual Coding = CHAOS
When you type code manually in the editor:
- **Meme video popups** progressively appear with sound
- Each popup adds to the **layered audio chaos**
- More typing = More chaos (up to 20 simultaneous popups!)
- Popups **cannot be closed** manually
- Every **5 keystrokes** spawns a new meme video

### 🧘 AI Coding = SERENITY
When you use the AI chat assistant (sidebar):
- All video popups **instantly vanish**
- **Serene background music** starts playing
- **Encouragement videos** appear to praise your AI usage
- A peaceful coding environment is restored

## ✨ Features

### 🎮 Chaos Mode
- **Progressive punishment system**: The more you type manually, the worse it gets
- **5 hilarious meme videos** that spawn at random positions
- **Multiple audio tracks** playing simultaneously for maximum chaos
- **Smart detection**: Only triggers when typing in code editors (not terminals or settings)
- **Configurable thresholds**: 5 keystrokes per popup, max 20 popups

### 🎵 Serenity Mode
- **4 calming audio tracks** that play when using AI
- **4 encouragement videos** to reinforce positive behavior
- **Instant chaos removal** when switching to AI chat
- **Smooth transitions** between chaos and serenity

### 🎨 Custom Branding
- **JustPromptBro Theme**: Sleek black and green color scheme
- **Custom product name** and branding throughout
- **Modified icons** and UI elements
- **Professional appearance** despite the chaotic functionality

## 🏗️ Architecture

JustPromptBro is built on VS Code's architecture with custom contributions:

```
src/vs/workbench/contrib/justpromptbro/
├── browser/
│   ├── justpromptbro.contribution.ts  # Main contribution & orchestration
│   ├── chaosController.ts             # Chaos state machine
│   ├── serenityController.ts          # Serenity mode & music
│   ├── videoPopupWidget.ts            # Video popup management
│   ├── types.ts                       # TypeScript interfaces
│   └── media/
│       ├── videos/                    # 5 meme videos (7.3MB)
│       ├── encouragement/             # 4 encouragement videos (2.8MB)
│       ├── audio/                     # 4 serene music tracks (35.4MB)
│       └── justpromptbro.css         # Custom styles
```

### Core Components

1. **JustPromptBroContribution** (`justpromptbro.contribution.ts`)
   - Main orchestrator that wires everything together
   - Listens to editor changes and focus events
   - Detects sidebar/chat usage vs. manual coding
   - Uses 100ms polling for webview focus detection

2. **ChaosController** (`chaosController.ts`)
   - State machine for chaos progression
   - Tracks keystrokes (1 per character, or 1 per 10 for paste)
   - Emits events when popups should spawn
   - Can be enabled/disabled based on context

3. **VideoPopupController** (`videoPopupWidget.ts`)
   - Manages meme video popup lifecycle
   - Random positioning with smart boundary detection
   - Non-dismissible popups with audio
   - Cleanup on serenity mode activation

4. **SerenityController** (`serenityController.ts`)
   - Handles peaceful music playback
   - Shows encouragement videos (only if chaos was active)
   - Smooth audio transitions
   - Centered, semi-transparent video overlay

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v22 or higher recommended)
- **npm** (comes with Node.js)
- **Git**
- At least **4 CPU cores** and **6GB RAM** (8GB recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fiyxxx/justpromptbro.git
   cd justpromptbro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   Note: This will take several minutes and install ~1000 packages

3. **Compile the source code**
   ```bash
   npm run compile
   ```

4. **Run JustPromptBro**
   ```bash
   # For desktop version
   ./scripts/code.sh  # On macOS/Linux
   .\scripts\code.bat # On Windows

   # For web version
   ./scripts/code-web.sh  # On macOS/Linux
   .\scripts\code-web.bat # On Windows
   ```

### Development Workflow

**Watch mode** (recommended for development):
```bash
npm run watch
```
This will automatically recompile on file changes.

**Run tests**:
```bash
npm run test-node          # Node.js unit tests
npm run test-browser       # Browser unit tests
npm run test-integration   # Integration tests
```

**Lint code**:
```bash
npm run eslint
npm run stylelint
```

## 🎯 Configuration

### Chaos Settings

Edit `src/vs/workbench/contrib/justpromptbro/browser/types.ts`:

```typescript
export const CHAOS_CONFIG = {
    KEYSTROKES_PER_POPUP: 5,  // Keystrokes before new popup
    MAX_POPUPS: 20,             // Maximum simultaneous popups
    POPUP_WIDTH: 450,           // Popup width in pixels
    POPUP_HEIGHT: 300,          // Popup height in pixels
} as const;
```

### Adding Custom Media

**Meme Videos**:
- Place `.mp4` files in `src/vs/workbench/contrib/justpromptbro/browser/media/videos/`
- Name them `meme1.mp4`, `meme2.mp4`, etc.
- Recommended: Short videos (2-10 seconds), small file size

**Encouragement Videos**:
- Place `.mp4` files in `src/vs/workbench/contrib/justpromptbro/browser/media/encouragement/`
- Name them `encourage1.mp4`, `encourage2.mp4`, etc.

**Serene Audio**:
- Place `.mp3` files in `src/vs/workbench/contrib/justpromptbro/browser/media/audio/`
- Name them `serene1.mp3`, `serene2.mp3`, etc.
- Recommended: Calm, instrumental music

## 📦 Building Distribution

```bash
# Compile with optimizations
npm run compile-build

# Build extensions
npm run compile-extensions-build

# Create distributable package
npm run gulp vscode-darwin-arm64        # macOS Apple Silicon
npm run gulp vscode-darwin-x64          # macOS Intel
npm run gulp vscode-linux-x64           # Linux
npm run gulp vscode-win32-x64           # Windows
```

## 🔧 Technical Details

### How It Works

1. **Editor Detection**
   - Hooks into VS Code's `IEditorService` to detect active editors
   - Listens to `onDidChangeModelContent` events for keystroke tracking
   - Filters out deletions (only additions trigger chaos)

2. **Focus Detection**
   - Uses `focusin` events to detect sidebar focus
   - Polls every 100ms to handle webview focus (which doesn't bubble)
   - Distinguishes between editor, terminal, panel, and sidebar areas

3. **State Management**
   - Chaos state tracked with keystroke count, popup count, and mode flags
   - Events emitted via `Emitter<T>` pattern for loose coupling
   - Controllers are disposable and clean up resources properly

4. **Audio/Video Management**
   - Files served via `FileAccess.asBrowserUri()`
   - HTML5 `<video>` and `<audio>` elements
   - Popups use fixed positioning with high z-index
   - Pointer events disabled to prevent manual dismissal

### Browser Compatibility

JustPromptBro runs in Electron (desktop) and modern browsers (web version):
- Chrome/Edge 100+
- Firefox 100+
- Safari 15+

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **Report bugs** - Open an issue on GitHub
2. **Suggest features** - We'd love to hear your ideas!
3. **Submit pull requests** - Bug fixes, features, or improvements
4. **Add media** - More memes, encouragement videos, or serene music
5. **Improve documentation** - Help others understand the project

### Development Guidelines

- **Use tabs for indentation** (VS Code standard)
- **Follow TypeScript best practices**
- **Add JSDoc comments** for public APIs
- **Test your changes** before submitting
- **Keep media file sizes reasonable** (< 5MB per video)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📝 Code of Conduct

This project follows the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).

## 🔗 Related Projects

- [Visual Studio Code](https://github.com/microsoft/vscode) - The upstream project
- [VS Code Docs](https://github.com/microsoft/vscode-docs) - Official documentation
- [Monaco Editor](https://github.com/microsoft/monaco-editor) - The code editor that powers VS Code

## 📄 License

Copyright (c) 2015 - present Microsoft Corporation (VS Code base)

Licensed under the [MIT License](LICENSE.txt).

JustPromptBro is a fork of VS Code and maintains the same MIT license. All custom contributions (chaos/serenity system) are also MIT licensed.

## 🎪 FAQ

### Q: Is this a joke?
**A:** Yes and no. While the concept is humorous, it's a fully functional IDE fork that demonstrates interesting UX patterns and could inspire legitimate productivity experiments.

### Q: Can I disable the chaos?
**A:** The whole point is the chaos! But technically yes, you could comment out the contribution registration in `justpromptbro.contribution.ts`.

### Q: Does this work with all VS Code extensions?
**A:** Yes! JustPromptBro is 100% compatible with the VS Code extension ecosystem.

### Q: What AI chat is it designed for?
**A:** It detects any sidebar/auxiliary bar focus, so it works with GitHub Copilot Chat, Continue, Cody, or any AI chat extension.

### Q: Can I use this for actual work?
**A:** If you're brave enough! It's a great way to force yourself to use AI assistants more effectively.

### Q: How much disk space does it need?
**A:** ~500MB for the codebase and ~45MB for media files (memes, encouragement, music).

## 🙏 Acknowledgments

- **Microsoft** - For creating VS Code, the foundation of this project
- **The VS Code team** - For maintaining excellent documentation and architecture
- **The AI coding assistant community** - For inspiring this experiment
- **Contributors** - Everyone who has helped improve JustPromptBro

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Fiyxxx/justpromptbro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Fiyxxx/justpromptbro/discussions)
- **Original VS Code**: [Stack Overflow](https://stackoverflow.com/questions/tagged/visual-studio-code)

---

<p align="center">
  <strong>Remember: Good developers use AI. Great developers let AI do ALL the work.</strong>
  <br><br>
  Made with 🤖 and a sense of humor
</p>
