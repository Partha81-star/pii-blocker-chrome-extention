# PII Blocker Extension - Deployment Guide

This guide explains how to publish your PII Blocker extension to the VS Code Marketplace.

## ✅ Completed Steps (Already Done)

- ✅ TypeScript compiled successfully
- ✅ Code checked for errors  
- ✅ package.json cleaned up and fixed
- ✅ README.md comprehensive documentation created
- ✅ .vscodeignore configured properly
- ✅ dist/ folder generated with compiled files

## 📋 What You Need to Do

### Step 1: Prepare Your GitHub Repository

1. **Create a GitHub repository**
   - Go to https://github.com/new
   - Name it: `pii-blocker`
   - Add description: "VS Code extension that detects and redacts PII"
   - Make it public (required for marketplace)
   - Click "Create repository"

2. **Update package.json with your GitHub URL**
   ```bash
   # Replace yourusername with your actual GitHub username
   ```
   In [package.json](package.json), update line 9:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/YOUR_USERNAME/pii-blocker"
   }
   ```

3. **Push code to GitHub**
   ```bash
   cd c:\Users\parth\Desktop\LLM\ -Extention\vscode-pii-blocker
   git init
   git add .
   git commit -m "Initial commit: PII Blocker extension v1.0.0"
   git remote add origin https://github.com/YOUR_USERNAME/pii-blocker.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create Publisher Account on VS Code Marketplace

1. **Go to Visual Studio Marketplace**
   - Visit: https://marketplace.visualstudio.com/

2. **Click "Publish extensions"**
   - Sign in with your Microsoft account (create one if needed)
   - Click your profile → "Create publisher"

3. **Fill in Publisher Details**
   - **Publisher ID:** `parthdev` (matches your package.json)
   - **Display Name:** ParthDev (or your actual name)
   - **Website:** (optional) your website or GitHub profile
   - Click "Create"

### Step 3: Generate Personal Access Token (PAT)

1. **Go to Azure DevOps**
   - Visit: https://dev.azure.com/_usersettings/tokens

2. **Create New Token**
   - Click "New Token"
   - **Name:** `vscode-marketplace`
   - **Organization:** All accessible organizations
   - **Scopes:** Check only ✅ "Marketplace: Manage"
   - **Expiration:** 90 days (or custom)
   - Click "Create"

3. **Copy the Token**
   - ⚠️ Copy it immediately - you won't see it again!
   - Save it somewhere safe temporarily

### Step 4: Install VSCE (Extension Packaging Tool)

Open PowerShell/Command Prompt and run:

```bash
npm install -g vsce
```

Verify installation:
```bash
vsce --version
```

### Step 5: Login to VS Code Marketplace

```bash
cd c:\Users\parth\Desktop\LLM\ -Extention\vscode-pii-blocker
vsce login parthdev
```

When prompted:
```
A Personal Access Token (PAT) is required to publish extensions.
You can retrieve it at: https://dev.azure.com/_usersettings/tokens
Personal Access Token for publisher 'parthdev': [PASTE YOUR TOKEN HERE]
```

When successfully logged in, you'll see:
```
The credential has been stored securely.
```

### Step 6: Create VSIX Package (Optional, for testing)

```bash
cd c:\Users\parth\Desktop\LLM\ -Extention\vscode-pii-blocker
vsce package
```

This creates: `pii-blocker-1.0.0.vsix`

You can test locally:
```bash
code --install-extension pii-blocker-1.0.0.vsix
```

### Step 7: Publish to Marketplace

```bash
cd c:\Users\parth\Desktop\LLM\ -Extention\vscode-pii-blocker
vsce publish
```

Expected output:
```
Publishing parthdev.pii-blocker v1.0.0...
✓ Packaged: pii-blocker-1.0.0.vsix
✓ Published: https://marketplace.visualstudio.com/items?itemName=parthdev.pii-blocker
```

## 🎉 Your Extension is Live!

After publishing:

1. **View your extension**
   - Visit: https://marketplace.visualstudio.com/items?itemName=parthdev.pii-blocker

2. **Install from VS Code**
   - Press Ctrl+Shift+X to open Extensions
   - Search "PII Blocker"
   - Click Install

3. **Share the link**
   - Share: https://marketplace.visualstudio.com/items?itemName=parthdev.pii-blocker

## 🔄 Updating Your Extension

### For Minor Updates (1.0.0 → 1.0.1):

```bash
cd c:\Users\parth\Desktop\LLM\ -Extention\vscode-pii-blocker

# Update version in package.json OR use vsce patch
vsce publish patch  # Auto-increments: 1.0.0 → 1.0.1

# OR manually update version and use:
vsce publish
```

### For Feature Updates (1.0.0 → 1.1.0):

```bash
vsce publish minor  # Auto-increments: 1.0.0 → 1.1.0
```

### For Major Updates (1.0.0 → 2.0.0):

```bash
vsce publish major  # Auto-increments: 1.0.0 → 2.0.0
```

## 🧪 Testing Before Publishing

### Method 1: Manual Testing via F5 (Recommended)

1. Open VS Code
2. Open the extension folder: `c:\Users\parth\Desktop\LLM -Extention\vscode-pii-blocker`
3. Press F5 to launch extension in debug mode
4. Test all features:
   - Create a file with sample PII (email, credit card, etc.)
   - Verify redaction appears
   - Try `@secure-scan` in Copilot Chat
   - Test settings configuration
   - Test redaction command

### Method 2: Install VSIX Locally

```bash
# First build the package
vsce package

# Install it (in your main VS Code, not debug instance)
code --install-extension pii-blocker-1.0.0.vsix

# Test all features
# To uninstall: code --uninstall-extension parthdev.pii-blocker
```

## ⚠️ Important Checklist Before Publishing

- [ ] Code compiles without errors: `npm run compile`
- [ ] GitHub repository created and code pushed
- [ ] Publisher account created on marketplace
- [ ] Personal Access Token generated
- [ ] VSCE installed globally: `npm install -g vsce`
- [ ] Tested extension locally in debug mode (F5)
- [ ] Tested extension by installing VSIX file
- [ ] README.md is complete and visible
- [ ] package.json has correct:
  - [ ] `publisher` field (must match your publisher ID)
  - [ ] `version` (semantic versioning)
  - [ ] `repository` URL (your GitHub repo)
  - [ ] `displayName` (visible in marketplace)
  - [ ] `description` (visible in marketplace)
- [ ] All sensitive data removed from code/files
- [ ] LICENSE file present
- [ ] Created at least one GitHub release (recommended)

## 🆘 Troubleshooting

### "vsce: command not found"
```bash
npm install -g vsce
# Add to PATH if necessary, or use full path:
# C:\Users\parth\AppData\Roaming\npm\vsce
```

### "Authentication failed"
```bash
# Login again
vsce logout parthdev
vsce login parthdev
# Paste fresh token when prompted
```

### "Publisher not found"
```bash
# Make sure publisher ID in package.json matches your created publisher
# Check: https://marketplace.visualstudio.com/manage/publishers
```

### "Version conflict - 1.0.0 already published"
```bash
# Use vsce to auto-increment:
vsce publish minor  # Changes to 1.1.0
# Or manually update package.json version to 1.0.1
```

### "VSIX file too large"
- Maximum size is 512MB
- Ensure node_modules/ is in .vscodeignore
- Run `npm install --production` to reduce size

## 📚 Additional Resources

- [VS Code Extension Publishing Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VSCE Documentation](https://github.com/microsoft/vscode-vsce)
- [VS Code API Reference](https://code.visualstudio.com/api)
- [Extension Marketplace Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## 🎯 Next Steps

1. Complete Step 1-3 (GitHub & Marketplace setup)
2. Test your extension (Step 6)
3. Publish (Step 7)
4. Share your extension!

Good luck! 🚀
