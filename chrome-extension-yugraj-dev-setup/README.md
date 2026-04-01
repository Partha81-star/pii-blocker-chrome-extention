# PrivacyGuard AI Protector

## chrome-extension

Demo Video Link: [https://youtu.be/-jVMXwOHgB0](https://youtu.be/-jVMXwOHgB0)

PrivacyGuard (chrome extension) project for Ciphathon '26.

**PrivacyGuard AI Protector** is a Chrome extension built to prevent accidental leakage of Personally Identifiable Information (PII), sensitive credentials, and proprietary corporate data to public Large Language Models (LLMs).

By acting as a zero-trust gateway, it monitors chat inputs and pauses data exfiltration when sensitive information is detected, allowing redaction before content leaves the browser.

## Features

- **Real-time interception:** Scans text locally before it is sent to the LLM.
- **Smart redaction engine:** Detects and redacts sensitive information with tags such as `[REDACTED_EMAIL]`.
- **Actionable warning overlay:** Shows an in-page prompt to send a sanitized version or cancel and edit.
- **Local analytics dashboard:** Tracks security rank, total blocked leaks, and threat categories.
- **Detailed security logs:** Records timestamp, leak type, and platform for blocked threats.

## Supported Platforms

The extension actively monitors input on:

- ChatGPT (`chatgpt.com`)
- Claude (`claude.ai`)
- Google Gemini (`gemini.google.com`)
- Google AI Studio (`aistudio.google.com`)

## What It Detects

The engine uses regex patterns to identify:

- Credit card numbers
- AWS API keys (`AKIA...`)
- Email addresses
- IPv4 addresses
- Proprietary markers (for example, `INTERNAL_ONLY`, `CONFIDENTIAL`)
- Database connection strings (MongoDB, Postgres, MySQL)
- High-entropy secrets (32-128 character tokens)

---

## How to Set Up the Project

Because this is a custom extension, load it manually using Chrome Developer Mode.

### Step 1: Prepare the Files

1. Create a new folder on your computer (for example, `PrivacyGuard_Extension`).
2. Save all project files in that folder:
   - `manifest.json`
   - `content.js`
   - `popup.html`
   - `popup.js`
   - `logs.html`
   - `logs.js`
   - `style.css`

### Step 2: Install in Google Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the `PrivacyGuard_Extension` folder.
6. Confirm the extension appears in the active extension list.

### Step 3: Test It Out

1. Pin the extension to the browser toolbar.
2. Open a supported platform such as [ChatGPT](https://chatgpt.com) or [Google Gemini](https://gemini.google.com).
3. Type a fake email (for example, `test@example.com`) or a fake AWS key and press Enter.
4. Verify the SentinelGate warning overlay appears and pauses submission.

## File Structure

- `manifest.json`: Core configuration and permissions.
- `content.js`: Page-injected logic for scanning, interception, redaction, and logging.
- `style.css`: Overlay styling.
- `popup.html` and `popup.js`: Extension popup UI and logic.
- `logs.html` and `logs.js`: Detailed activity log UI and logic.

## Team Neural Mavericks

- Aaditya Hingmire
- Parth Bhad
- Yugraj Mangate
- Manasvi Yeole
