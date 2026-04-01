# Privacy Guard AI - VS Code Extension

A VS Code extension that detects and redacts sensitive data in real-time. **Prevents secrets from being accidentally sent to GitHub Copilot Chat** and other AI systems.

## ✨ Features

### 🚫 Copilot Chat Protection (WORKING)
- **Clipboard Scanning:** Detects secrets when you paste into Copilot Chat
- **Selection Safety:** Check selected text before copy-pasting
- **Redact Option:** Convert dangerous clipboard content to `[REDACTED_TYPE]` placeholders  
- **Real-time Warnings:** Catches secrets before they're typed into chat
- **Prevents accidental credential leaks** to AI systems
- **Zero false blocks** - you control what you paste

### Real-Time Detection in Files
- Detects multiple types of sensitive data:
  - 📧 Email addresses
  - 💳 Credit card numbers
  - 🆔 Aadhar numbers (Indian ID)
  - 🔐 AWS API keys
  - 🌐 IP addresses (IPv4)
  - 🆔 Social Security Numbers (SSN)
  - 💸 UPI IDs (UPI addresses)
  - 🔑 Database connection strings (MongoDB, PostgreSQL, MySQL)
  - 🚨 High-entropy secrets (32-128 char strings)
  - 🏢 Proprietary markers (INTERNAL_ONLY, CONFIDENTIAL, etc.)

### Visual Redaction
- Automatically masks sensitive text with black background
- Clear visual indicators in editor
- Non-intrusive editor decorations using VS Code's TextEditorDecorationType

### GitHub Copilot Chat Integration
- Use `@secure-scan` chat participant in GitHub Copilot Chat
- Ask it to scan current file for PII leaks
- Get detailed reports on detected PII, line numbers, and recommendations
- Works seamlessly with Copilot Chat interface

### Problem Panel Integration
- All detected PII appears in VS Code's Problems panel
- Quick navigation to sensitive areas
- Detailed diagnostic information for each finding

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "PII Blocker"
4. Click Install

### Manual Installation (VSIX)
```bash
cd vscode-pii-blocker
npm install
npm run compile
code --install-extension pii-blocker-1.0.0.vsix
```

## 🚀 Usage

### 🚫 Blocking Secrets from Copilot Chat (CRITICAL FEATURE)

**How it works:**
1. Open **GitHub Copilot Chat** (Ctrl+Shift+I / Cmd+Shift+I)
2. **Start typing your message** in the chat input
3. **If secrets detected** → RED WARNING appears immediately
4. Click **"Redact Now"** to sanitize the message
5. Message becomes safe → Send to Copilot

**Example:**
```
User types: "Hey, can you review this? Here's my API key: AKIA1234567890ABCDE"

Extension shows: 🚨 UNSAFE TO SEND: Detected awsKey in your message

User clicks: "Redact Now"

Message becomes: "Hey, can you review this? Here's my API key: [REDACTED_AWSKEY]"

Safe to send! ✅
```

### Real-Time Detection
The extension automatically scans all open files. Sensitive data is highlighted with black boxes.

### Using with Copilot Chat for File Scanning
```
@secure-scan Scan this file for any PII leaks
```

The participant will:
- ✅ Detect all sensitive data in your current file
- 📍 Show exact line numbers of findings
- 💡 Provide remediation recommendations

### Manual Redaction
Use the command palette (Ctrl+Shift+P / Cmd+Shift+P):

- `PII Blocker: Redact Current File` - Replace all detected PII with [REDACTED_TYPE] placeholders
- `PII Blocker: Show Stats` - View detection statistics
- `PII Blocker: Open Settings` - Configure extension behavior

## ⚙️ Configuration

Edit settings in VS Code (File → Preferences → Settings, search for "PII Blocker"):

```json
{
    "piiBlocker.enableRedaction": true,
    "piiBlocker.redactionStyle": "black-background"
}
```

### Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `piiBlocker.enableRedaction` | boolean | `true` | Enable real-time redaction of PII in the editor |
| `piiBlocker.redactionStyle` | string | `black-background` | Style for redacting sensitive content (`black-background`, `blur`, `rectangle`) |

## 📋 Detected Patterns

| Pattern | Examples |
|---------|----------|
| Email | `user@example.com`, `john.doe@company.co.uk` |
| Credit Card | `1234-5678-9012-3456`, `1234 5678 9012 3456` |
| Aadhar | `1234 5678 9012`, `1234-5678-9012` |
| AWS Key | `AKIA1234567890ABCDEF` |
| IPv4 | `192.168.1.1`, `10.0.0.1` |
| SSN | `123-45-6789` |
| UPI ID | `user@upi`, `user@paytm` |
| Database URLs | `mongodb+srv://user:pass@host`, `postgres://...` |
| High-entropy Secrets | `"ab1234cd5678ef9012gh3456ij7890kl..."` |
| Proprietary Markers | `INTERNAL_ONLY`, `CONFIDENTIAL`, `DO_NOT_DISTRIBUTE` |

## 🏗️ Architecture

The extension consists of:

- **extension.ts** - Main activation logic, event listeners, command registration
- **piiPatterns.ts** - Regex patterns and PII detection algorithms
- **dist/** - Compiled JavaScript (generated at build time)

### How It Works

1. **Activation**: Extension starts on `onStartupFinished` and chat participant creation
2. **Scanning**: All open files are scanned for PII patterns using regex
3. **Decoration**: Sensitive matches are highlighted with visual decorations
4. **Diagnostics**: Findings are reported in the Problems panel
5. **Chat Integration**: Copilot Chat participant processes scanning requests

## 🛠️ Development

### Setup
```bash
npm install
npm run compile      # Compile TypeScript
npm run watch       # Watch for changes
npm run lint        # Run ESLint
```

### Testing
Press F5 to open a new VS Code window with the extension loaded (debug mode).

### Debug Features
- Set breakpoints in TypeScript files
- Use Debug Console to inspect variables
- View extension output in Output panel

## 📝 License

MIT - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please ensure code follows the project's style guidelines.

## 🐛 Known Limitations

- Regex patterns may produce false positives for legitimate number sequences
- Copilot Chat integration requires VS Code version 1.85.0 or later
- Chat participant feature requires GitHub Copilot extension

## 📞 Support

For issues and questions, please create an issue on the project repository.

---

**Version:** 1.0.0  
**Publisher:** parthdev  
**License:** MIT  
**Repository:** https://github.com/yourusername/pii-blocker

- **`src/piiPatterns.ts`** - PII detection logic with regex patterns (extracted and shared from browser extension)
- **`src/extension.ts`** - Main VS Code integration, decorations, and Copilot Chat participant
- **`package.json`** - Extension metadata and VS Code configuration

## Development

```bash
# Install dependencies
npm install

# Watch TypeScript compilation
npm run watch

# Build for release
npm run compile

# Run tests
npm test
```

## How It Works

1. **Pattern Matching**: Uses regex patterns from the original browser extension
2. **Real-Time Scanning**: Monitors text changes via VS Code's text change events
3. **Visual Masking**: Creates text editor decorations with black background/text
4. **Copilot Integration**: Registers as a chat participant for intelligent scanning

## Security Notes

- ⚠️ **Extension-Only**: This extension only works within VS Code (not your browser)
- 🛡️ **Local Processing**: All data stays local - nothing is sent to external servers
- 🔒 **No Persistence**: Detection data is not logged or stored permanently

## Limitations

- Regex patterns might have false positives/negatives
- Performance depends on file size
- Copilot Chat integration requires VS Code 1.85.0+
- Aadhar pattern is simplified (12-digit pattern)

## Troubleshooting

**Extension not detecting my PII?**
- Check the file language mode (some modes might be skipped)
- Verify your data matches known PII patterns
- Try opening the Problems panel (View → Problems)

**Copilot Chat participant not appearing?**
- Ensure VS Code is 1.85.0 or later
- Reload VS Code window (Cmd+R / Ctrl+R)
- Check that Copilot Chat extension is installed

**Performance issues?**
- Close large files
- Disable redaction for specific file types in settings
- Check your system resources

## Contributing

Issues and pull requests welcome! Please report:
- False positives/negatives in detection
- Missing PII patterns
- Performance problems

## License

MIT

## Disclaimer

This extension is designed to help prevent accidental data exposure. It is **not a complete security solution**. Always review your code before sharing sensitive information.

---

**Remember**: The best security is awareness. Always double-check before sharing code with LLMs or in public repositories. 🔒
