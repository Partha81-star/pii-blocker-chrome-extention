# PII Blocker Extension - Testing Guide

This guide explains how to test your extension before deploying it to the marketplace.

## 🚀 Quick Start Testing

### Option 1: Debug Mode (Recommended)

This is like Chrome DevTools for VS Code extensions.

1. **Open the extension folder in VS Code**
   ```bash
   code c:\Users\parth\Desktop\LLM\ -Extention\vscode-pii-blocker
   ```

2. **Press F5** or go to **Run → Start Debugging**
   - A new VS Code window opens with your extension loaded
   - This is your "debug instance"

3. **In the debug window, create a test file**
   ```
   test-pii.txt
   ```

4. **Paste sample data:**
   ```
   Email: user@example.com
   Credit Card: 4532-1234-5678-9010
   Aadhar: 1234 5678 9012
   AWS Key: AKIAIOSFODNN7EXAMPLE
   IP: 192.168.1.1
   SSN: 123-45-6789
   UPI: user@paytm
   DB: mongodb+srv://user:pass@cluster.mongodb.net/db
   Secret: "sk_fake_1234567890abcdefghijklmnopqrstuvwxyz"
   Proprietary: INTERNAL_ONLY CONFIDENTIAL DO_NOT_DISTRIBUTE
   ```

5. **Expected behavior:**
   ✅ All sensitive data should appear with black boxes
   ✅ Check "Problems" panel (Ctrl+Shift+M) - should show detected PII
   ✅ No errors in "Output" panel

### Option 2: Install VSIX Locally

Test the packaged extension before marketplace publication.

```bash
# In your MAIN VS Code (not debug instance)
code --install-extension c:\Users\parth\Desktop\LLM\ -Extention\vscode-pii-blocker\pii-blocker-1.0.0.vsix
```

**Note:** You may need to reload VS Code after installation.

To uninstall:
```bash
code --uninstall-extension parthdev.pii-blocker
```

## 🧪 Feature Test Checklist

### Real-Time Detection
- [ ] Create file with credit card number → should show redaction
- [ ] Create file with email → should show redaction
- [ ] Create file with Aadhar number → should show redaction
- [ ] Edit text → decorations update in real-time
- [ ] Copy-paste PII → immediately highlighted
- [ ] All patterns in test file above are redacted

### Visual Feedback
- [ ] Redacted areas have black background
- [ ] Can see text is hidden (not removed)
- [ ] Hover over redaction shows indicator
- [ ] Non-PII text is completely visible

### Problems Panel
- [ ] Open Problems panel (Ctrl+Shift+M)
- [ ] All detected PII appears as warnings
- [ ] Shows type of PII (email, creditCard, etc.)
- [ ] Can click to jump to detection

### Copilot Chat Integration
- [ ] Open Copilot Chat (Ctrl+Shift+Alt+L or from sidebar)
- [ ] Ask: `@secure-scan scan this file for pii`
- [ ] Should show:
  - [ ] Summary of detected types
  - [ ] Count of each type
  - [ ] Line numbers of findings
  - [ ] Recommendations
  - [ ] Safe file message if no PII found

### Manual Redaction
- [ ] Open Command Palette (Ctrl+Shift+P)
- [ ] Run: `PII Blocker: Redact Current File`
- [ ] Should prompt for confirmation
- [ ] On confirm: Replace PII with `[REDACTED_TYPE]`
- [ ] Original text preserved in undo history

### Settings
- [ ] Open Settings (File → Preferences → Settings)
- [ ] Search "PII Blocker"
- [ ] Toggle `enableRedaction` → should disable/enable
- [ ] Change `redactionStyle` → styling should update

## 🔍 Debug Mode Features

In the VS Code debug window:

### View Extension Output
1. Open Output panel (Ctrl+`)
2. Select "PII Blocker" from dropdown
3. Should see:
   ```
   PII Blocker extension activated
   ```

### Set Breakpoints in Code
1. Open `src/extension.ts` in debug instance
2. Click line number to set breakpoint (line 10-30 region)
3. Trigger that function → debugger pauses
4. Inspect variables in Debug panel

### Use Debug Console
1. Open Debug Console (Ctrl+Shift+Y)
2. Type: `document.getText()` to inspect current file
3. Run commands from the extension

## 📊 Performance Testing

### Test with Large Files
1. Create a large test file (>10 MB)
2. Paste the sample PII data multiple times
3. Check:
   - ✅ Extension doesn't freeze
   - ✅ Redactions still apply
   - ✅ No memory leaks in debug output

### Test with Many Open Files
1. Open 10+ files simultaneously
2. Switch between tabs
3. Verify:
   - ✅ Each file scanned independently
   - ✅ Decorations apply correctly
   - ✅ No cross-file contamination

## 🚨 Error Handling

### Test No Active Editor
1. Close all editor tabs
2. Try Copilot command → should show error message
3. Try redact command → should show "No active editor" message

### Test with Unsupported File Types
1. Try on a binary file (image, exe)
2. Extension should handle gracefully

### Test with Read-Only Files
1. Create a read-only file
2. Detection should still work
3. Redaction command should show appropriate message

## ✅ Final Verification Checklist

Before publishing, verify:

```
Real-Time Detection:
  ☐ All 10 PII types highlighted with black boxes
  ☐ Updates in real-time as you type
  ☐ Handles malformed patterns gracefully

Copilot Chat:
  ☐ @secure-scan works without errors
  ☐ Shows correct detection results
  ☐ Displays line numbers accurately
  ☐ Safe file detection works

Redaction Command:
  ☐ Can redact current file
  ☐ Confirmation dialog appears
  ☐ Redacted text uses correct format
  ☐ Undo works properly

Settings:
  ☐ Can toggle redaction on/off
  ☐ Can change redaction style
  ☐ Changes apply immediately

Problems Panel:
  ☐ Shows all detected PII
  ☐ Correct type labels
  ☐ Can navigate to location

Code Quality:
  ☐ No TypeScript errors: npm run lint
  ☐ No console errors in debug output
  ☐ Extension doesn't crash

Performance:
  ☐ Works with large files (>1MB)
  ☐ Responsive with many files open
  ☐ No memory leaks
```

## 🆘 Troubleshooting

### Extension Not Loading
- [ ] Check Output panel for errors
- [ ] Run `npm run compile` and restart debug session
- [ ] Clear VS Code cache: `code --profile temp`

### Redactions Not Showing
- [ ] Check "piiBlocker.enableRedaction" is true
- [ ] Try changing redactionStyle setting
- [ ] File must contain actual PII patterns

### Copilot Chat Not Working
- [ ] Verify GitHub Copilot extension is installed
- [ ] Copilot must be configured and signed in
- [ ] Required VS Code version 1.85.0+

### Settings Not Applying
- [ ] Reload VS Code window (Ctrl+R)
- [ ] Check setting names are exact: "piiBlocker.*"
- [ ] Settings stored in `.vscode/settings.json`

## 📝 Sample Test Files

### Quick Test (test-quick.txt)
```
user@gmail.com
1234-5678-9012-3456
1234 5678 9012
```

### Comprehensive Test (test-all.txt)
```
# Contact Information
Email: john.doe@company.com
Secondary: jane_smith@example.co.uk

# Payment Information  
Visa: 4532-1234-5678-9010
Visa: 4532 1234 5678 9010

# Government IDs
Aadhar: 1234 5678 9012
Aadhar: 1234-5678-9012
SSN: 123-45-6789

# Cloud Keys
AWS: AKIAIOSFODNN7EXAMPLE

# Network
IP: 192.168.1.1
IP: 10.0.0.1

# Financial
UPI: user@paytm
UPI: user@okhdfcbank

# Database
MongoDB: mongodb+srv://user:password@cluster.mongodb.net/database
PostgreSQL: postgres://user:pass@localhost:5432/db

# Secrets
API Key: "sk_fake_1234567890abcdefghijklmnopqrstuvwxyz"

# Classification
INTERNAL_ONLY
CONFIDENTIAL
DO_NOT_DISTRIBUTE
PROPERTY_OF_ACME
```

### Edge Cases (test-edge.txt)
```
# These might not be detected (false negatives)
Random numbers: 1234 5678

# These might be falsely detected (false positives)
My favorite numbers: 192.168.1.1
Conference date: 2024.01.15

# These should definitely work
Real email: noreply@github.com
Real card: 5432-2134-5678-9010
```

## 📞 Getting Help

If testing fails:
1. Check the [README.md](README.md) for feature list
2. Review [extension.ts](src/extension.ts) code comments
3. Check VS Code extension API docs: https://code.visualstudio.com/api

---

**Once all tests pass, you're ready to publish! 🚀**
