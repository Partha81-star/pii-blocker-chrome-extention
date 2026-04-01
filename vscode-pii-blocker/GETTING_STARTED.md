# Getting Started with PII Blocker VS Code Extension

## Project Structure

```
vscode-pii-blocker/
├── src/
│   ├── extension.ts         # Main extension entry point
│   └── piiPatterns.ts       # PII detection logic & patterns
├── dist/                    # Compiled output (generated after npm run compile)
├── package.json             # Extension metadata & dependencies
├── tsconfig.json            # TypeScript configuration
├── README.md                # User documentation
├── .vscodeignore            # Files to exclude from packaged extension
├── .gitignore               # Git ignore rules
└── .eslintrc.json          # Linting rules
```

## Quick Setup

### 1. Install Dependencies
```bash
cd vscode-pii-blocker
npm install
```

### 2. Compile TypeScript
```bash
npm run compile
```

This generates the `dist/` folder with compiled JavaScript.

### 3. Test the Extension Locally

**Option A: Debug in VS Code**
- Press `F5` (or go to Run → Start Debugging)
- A new VS Code window opens with the extension running
- Open any file and create some PII (e.g., `user@example.com`)
- The extension will highlight it with a black box

**Option B: Manual Testing**
```bash
# Watch for changes and recompile
npm run watch

# In another terminal, run VS Code with the extension
code --extensionDevelopmentPath=. /path/to/test/file.txt
```

### 4. Test Copilot Chat Integration

In the debug VS Code window:
1. Open Copilot Chat (Cmd+Shift+I / Ctrl+Shift+I)
2. Type: `@secure-scan scan this file for PII`
3. The participant will analyze the current editor content

## Key Features to Test

### ✅ Real-Time Detection
- Open a file with sensitive data
- Types: email, credit card, aadhar, AWS key, IP address, etc.
- Sensitive areas are masked with black boxes

### ✅ Visual Feedback
- Hover over redacted text → see "[REDACTED]" tooltip
- Open Problems panel → see all detected PII with line numbers
- Editor automatically applies decorations on file open/change

### ✅ Manual Redaction
- Cmd+Shift+P / Ctrl+Shift+P
- Search: "Redact Current File"
- Replaces sensitive data with `[REDACTED_TYPE]` placeholders

### ✅ Copilot Chat Participant
- `@secure-scan` shows in Copilot Chat
- Get detailed scan reports with line numbers
- Receives recommendations for remediation

## What Patterns Are Detected?

The extension detects:
- **Email**: `user@example.com`
- **Credit Card**: `1234-5678-9012-3456` (13-16 digits)
- **Aadhar**: `1234 5678 9012`
- **AWS Keys**: `AKIA...` (16 chars after prefix)
- **IPv4**: `192.168.1.1`
- **SSN**: `123-45-6789`
- **Database URLs**: `mongodb+srv://...`, `postgres://...`
- **Secrets**: High-entropy strings in quotes
- **UPI IDs**: `username@bankcode`
- **Proprietary**: INTERNAL_ONLY, CONFIDENTIAL, etc.

All patterns are defined in `src/piiPatterns.ts` and extracted from your browser extension.

## Modification Guide

### Add New PII Pattern

Edit `src/piiPatterns.ts`:
```typescript
export const SENSITIVE_PATTERNS = {
    // ... existing patterns
    newPattern: /your-regex-here/g,  // Add your pattern
};
```

### Change Redaction Style

Edit `src/extension.ts` in the `createRedactionDecoration()` function:
```typescript
return vscode.window.createTextEditorDecorationType({
    backgroundColor: '#000000',  // Change color here
    color: '#000000',
    // ...
});
```

### Custom Hover Tooltip

In `src/extension.ts`:
```typescript
hoverMessage: new vscode.MarkdownString('Your custom message'),
```

## Build for Release

```bash
# Compile with all optimizations
npm run compile

# Lint code
npm run lint

# Package as .vsix (requires vsce CLI)
npm install -g vsce
vsce package
```

This generates `pii-blocker-1.0.0.vsix` that can be shared or published.

## Troubleshooting

### TypeScript Not Compiling?
```bash
npm install
npm run compile
```

### Extension Not Loading?
- Check browser console in debug window (Cmd+Shift+I / F12)
- Verify `dist/extension.js` exists
- Try reloading the extension window (Cmd+R / Ctrl+R)

### Copilot Chat Missing?
- Requires VS Code 1.85.0+
- Requires Copilot Chat extension to be installed
- Check that `createChatParticipant` is available

### No Detection?
- Check file type (some modes might not scan)
- Verify PII matches the regex patterns
- Open Problems panel to see all diagnostics

## Development Workflow

```bash
# Terminal 1: Watch for TypeScript changes
npm run watch

# Terminal 2: Run debug instance
code --extensionDevelopmentPath=. 

# Edit src/ files → auto-compiles → reload debug window (Cmd+R)
```

## Next Steps

1. ✅ Complete initial setup (npm install, npm run compile)
2. ✅ Test in debug mode (F5)
3. ✅ Try with sample file containing PII
4. ✅ Test Copilot Chat participant integration
5. ✅ Customize patterns/styles as needed
6. 📦 Package and distribute (vsce package)

---

**Have questions?** Check the README.md for more details on usage and configuration.
