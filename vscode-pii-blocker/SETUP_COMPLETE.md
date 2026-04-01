# VS Code PII Blocker Extension - Setup Complete ✅

## Summary of What Was Created

Your new **vscode-pii-blocker** extension is ready in the `vscode-pii-blocker/` subfolder alongside your browser extension.

### Project Structure

```
vscode-pii-blocker/
├── src/
│   ├── extension.ts          ← Main VS Code extension (Copilot Chat, real-time detection)
│   └── piiPatterns.ts        ← Shared PII detection logic (extracted from browser extension)
├── dist/                     ← (Generated after npm run compile)
├── package.json              ← Extension metadata & configuration
├── tsconfig.json             ← TypeScript compilation settings
├── README.md                 ← User documentation
├── GETTING_STARTED.md        ← Development setup guide
├── test-sample.js            ← Sample file for testing
├── .eslintrc.json            ← Code quality rules
├── .gitignore                ← Git ignore rules
└── .vscodeignore             ← Packaging exclusions
```

## What's Included

### ✅ Core Features
1. **Real-Time PII Detection** - Scans editor content for 10+ types of sensitive data
2. **Visual Redaction** - Masks sensitive text with black background/text decorations
3. **Copilot Chat Participant** - `@secure-scan` for intelligent file scanning
4. **Problems Panel Integration** - Shows all detected PII with line numbers
5. **Manual Redaction Command** - Replace all PII with `[REDACTED_TYPE]` placeholders

### ✅ Detected Patterns (from your browser extension)
- Email addresses
- Credit card numbers (13-16 digits)
- Aadhar numbers (12-digit Indian ID)
- AWS API keys
- IPv4 addresses
- Social Security Numbers
- Database connection strings
- High-entropy secrets
- UPI IDs
- Proprietary markers (INTERNAL_ONLY, CONFIDENTIAL, etc.)

### ✅ Preserved Original Files
Your browser extension files remain **completely untouched**:
- ✅ `content.js` (original logic intact)
- ✅ `manifest.json` 
- ✅ All other browser extension files

## Quick Start (5 minutes)

```bash
# 1. Navigate to the extension folder
cd "c:\Users\parth\Desktop\LLM -Extention\vscode-pii-blocker"

# 2. Install dependencies
npm install

# 3. Compile TypeScript to JavaScript
npm run compile

# 4. Test in VS Code (opens debug instance)
# Press F5 or go to Run → Start Debugging
```

Then in the debugging VS Code window:
- Open the `test-sample.js` file to see PII detection in action
- Try `@secure-scan` in Copilot Chat to test the participant

## Key Implementation Details

### 1. **Shared PII Patterns** (`src/piiPatterns.ts`)
```typescript
// Regex patterns extracted from your browser extension
const SENSITIVE_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
    aadhar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    // ... 7 more patterns
};

// Two main exports:
- scanForPII(text)        → Detects all PII types
- redactSensitiveData(text) → Returns redacted version
```

### 2. **Real-Time Decorations** (`src/extension.ts`)
```typescript
// Creates black-background redaction style
vscode.window.createTextEditorDecorationType({
    backgroundColor: '#000000',
    color: '#000000',
    border: '1px solid #666666',
    hoverMessage: '[REDACTED] Sensitive PII detected'
})
```

### 3. **Copilot Chat Participant** 
```typescript
// Registers @secure-scan participant
vscode.chat.createChatParticipant('secure-scan', async (request) => {
    // Scans current editor content
    // Returns detailed findings + recommendations
})
```

## Testing with Copilot Chat

1. Open or create a file with PII (use `test-sample.js` as reference)
2. Open Copilot Chat (Cmd+Shift+I / Ctrl+Shift+I)
3. Ask: `@secure-scan scan this file for leaks`
4. Response includes:
   - Type of PII detected
   - Number of occurrences per type
   - Line numbers with sanitized previews
   - Remediation recommendations

## Customization Examples

### Add a New PII Pattern
Edit `src/piiPatterns.ts`:
```typescript
export const SENSITIVE_PATTERNS = {
    // ... existing patterns ...
    phoneNumber: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
};
```

### Change Redaction Color
Edit `src/extension.ts` in `createRedactionDecoration()`:
```typescript
backgroundColor: '#FF0000',  // Red instead of black
color: '#FFFFFF',            // White text
```

### Modify Chat Participant Response
Edit the `registerCopilotParticipant()` function in `src/extension.ts`

## Compilation & Distribution

```bash
# Development (watch mode)
npm run watch

# Production build
npm run compile

# Code quality check
npm run lint

# Package as .vsix (requires vsce CLI)
npm install -g vsce
vsce package  # Creates pii-blocker-1.0.0.vsix
```

## Important Notes

⚠️ **Root-Level Files** - You may see `extension.ts` and `piiPatterns.ts` in the root folder along with the `src/` versions. The **only files used are in `src/`** (due to tsconfig.json). You can optionally delete the root-level duplicates.

🔒 **Security**
- All processing is local (no external API calls)
- No persistent logging of detected data
- Copilot Chat integration is project-scoped only

📝 **False Positives** - Some patterns might match non-PII (e.g., `IP` pattern could match version numbers). Adjust regex in `piiPatterns.ts` as needed.

## Documentation Files

- 📖 **README.md** - Full user documentation
- 🚀 **GETTING_STARTED.md** - Development setup guide
- 🧪 **test-sample.js** - Sample file with all PII types for testing

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Compile: `npm run compile`  
3. ✅ Test in debug mode: Press `F5`
4. ✅ Try Copilot Chat integration
5. 🔧 Customize patterns/colors as needed
6. 📦 Package and distribute via VS Code Marketplace

---

**Questions?** See README.md and GETTING_STARTED.md for detailed information.

Your extension is now ready to protect VS Code from accidental PII exposure! 🔒
