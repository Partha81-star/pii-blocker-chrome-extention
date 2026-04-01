# Privacy Guard AI - Simple Guide

## What Is Privacy Guard AI? (In Simple Words)

Privacy Guard AI is a tool that **stops you from accidentally sharing your secrets with AI chatbots like Copilot**.

Think of it like a **security guard for your computer code**. When you're about to paste something dangerous (passwords, API keys, credit cards), it says "STOP! This contains your secret!" and gives you a chance to hide it.

---

## Why Do You Need It?

### The Problem
Imagine you're asking Copilot to help you fix code:
```
You: "Help me connect to my database"
[You paste code with: password = "mySecretPassword123"]
→ Copilot now has your real password
→ It's saved in GitHub's servers
→ You can't delete it ❌
```

**Once it's uploaded, it's gone forever.**

### The Solution
With Privacy Guard AI:
```
You try to paste code with password
↓
Extension warns: "🚨 This has your secret!"
↓
You click "Hide It"
↓
Password becomes: [HIDDEN_SECRET]
↓
You paste the safe version ✅
→ Copilot helps without seeing real password
```

---

## What Secrets Does It Protect?

Privacy Guard AI watches for these things:

| Secret | Example | Protected? |
|--------|---------|-----------|
| **Email** | user@company.com | ✅ Yes |
| **Password** | myPassword123 | ✅ Yes |
| **API Key** | AKIA1234567890 | ✅ Yes |
| **Database Login** | user:pass@localhost | ✅ Yes |
| **Credit Card** | 4532-1111-2222-3333 | ✅ Yes |
| **Phone Number** | 555-123-4567 | ✅ Yes |

---

## How To Use It (3 Simple Ways)

### Way 1: Get Warned When Pasting ⭐ Easiest

**Situation:** You copy code with secrets

**What happens:**
1. Extension notices you copied something dangerous
2. Shows a warning: `"🚨 Your clipboard has a secret!"`
3. You click `"Hide It"`
4. The secret gets replaced with `[HIDDEN]`
5. You paste the safe version ✅

**That's it. No extra steps.**

### Way 2: Check Before Copying

**Step 1:** Select code that might have secrets
```javascript
const apiKey = "sk_fake_abc123def456"
```

**Step 2:** Open Command Palette (Ctrl+Shift+P)  
Type: `Check Selection`

**Step 3:** Extension tells you what's unsafe
- ✅ "This is safe to share" OR
- 🚨 "This has: apiKey"

**Step 4:** Click "Hide" if needed
- The secret becomes: `[HIDDEN_APIKEY]`

### Way 3: Clear Your Entire File Before Sending

**Step 1:** Open your code file

**Step 2:** Press Ctrl+Shift+P, type: `Redact File`

**Step 3:** Extension replaces ALL secrets
- API keys → `[HIDDEN_APIKEY]`
- Passwords → `[HIDDEN_PASSWORD]`
- Emails → `[HIDDEN_EMAIL]`

**Step 4:** Review and share safely ✅

---

## Installation (Just 1 Minute)

### Step 1: Open Extensions
- In VS Code, click the **Extensions icon** on the left sidebar
- (Or press Ctrl+Shift+X)

### Step 2: Search
- Type: `Privacy Guard AI`

### Step 3: Install
- Click **Install**
- Restart VS Code

**That's it! You're protected now.**

---

## Real-Life Examples

### Example 1: Asking Copilot How to Use AWS

**Before Privacy Guard AI:**
```
Your code:
  AWS_KEY = "AKIAIOSFODNN7EXAMPLE"
  AWS_SECRET = "wJalrXUtnFEMI/K7MDENG..."

You ask Copilot: "How do I fix this connection?"
[You paste your code with real AWS keys]
→ PROBLEM: Your AWS account is now at risk ❌
```

**After Privacy Guard AI:**
```
Your code:
  AWS_KEY = "AKIAIOSFODNN7EXAMPLE"
  AWS_SECRET = "wJalrXUtnFEMI/K7MDENG..."

Extension warns: "🚨 Contains: AWS key, Secret"

You click: "Hide These"

Your code becomes:
  AWS_KEY = "[HIDDEN_AWSKEY]"
  AWS_SECRET = "[HIDDEN_SECRET]"

You paste this safe version to Copilot
→ Copilot helps with your code
→ Your real keys stay safe ✅
```

---

### Example 2: Sharing Database Code

**Without Protection:**
```
Your code has:
  postgres://admin:password123@localhost:5432/mydb

You paste into Copilot
→ Your database password is exposed ❌
```

**With Protection:**
```
Your code has:
  postgres://admin:password123@localhost:5432/mydb

Extension warns: "Database password detected!"

You click: "Hide Password"

Becomes:
  postgres://admin:[HIDDEN_PASSWORD]@localhost:5432/mydb

Safe to share with Copilot ✅
```

---

### Example 3: Before You Commit to GitHub

**Situation:** You're about to save code to GitHub but have real secrets in it

**Step 1:** Press Ctrl+Shift+P → `Redact File`

**Step 2:** All secrets get hidden automatically

**Step 3:** Review the file - looks good?

**Step 4:** Save to GitHub safely ✅

---

## Quick Commands (Copy & Paste These)

Open **Command Palette** with Ctrl+Shift+P, then type:

| Command | What It Does |
|---------|----------|
| `Check Selection` | Check if selected code is safe |
| `Redact File` | Hide all secrets in current file |
| `Show Status` | See what you're protected against |

---

## Common Questions

### Q: Will it slow down my computer?
**A:** No. It's super fast - less than 1 millisecond per check.

### Q: What if I don't want to hide something?
**A:** You always have a choice. Click "Don't Hide" and paste the real version. (But be careful!)

### Q: Does it save my secrets anywhere?
**A:** No. Everything is hidden only on your computer. Nothing is saved or uploaded.

### Q: What if it warns about something that's not a secret?
**A:** Sometimes it's extra safe and warns about things that look like secrets but aren't. You can ignore the warning if you know it's safe.

### Q: Can I still use Copilot normally?
**A:** Yes! Everything works the same. The extension just protects you when you paste.

### Q: Does it block things automatically?
**A:** No. It warns you and lets you decide. You're always in control.

---

## The Main Rules (Remember These)

### ✅ DO
1. Keep the extension **turned on always**
2. Check before pasting code into Copilot
3. Use the "Hide It" button when warned
4. Use environment variables for secrets (not in code)
5. Feel confident sharing code with AI

### ❌ DON'T
1. Ignore the warnings (they're there to help)
2. Hardcode passwords in your files (use .env files instead)
3. Turn off the extension just because it warns you
4. Paste large code blocks with secrets without checking
5. Trust that manual checking is always enough

---

## What Gets Protected (Full List)

Privacy Guard AI watches for:

- 📧 **Email addresses** - user@example.com
- 🔑 **API Keys** - sk_fake_..., AKIA...
- 🔐 **Passwords** - anyPassword123
- 💾 **Database connections** - postgres://user:pass@host
- 💳 **Credit cards** - 4532-1111-2222-3333
- 📱 **Phone numbers** - 555-123-4567  
- 🪪 **ID numbers** - Aadhar, SSN
- 📍 **IP addresses** - 192.168.1.1
- 🏢 **Confidential markers** - INTERNAL, SECRET

---

## Workflow (How You'll Use It Daily)

### Morning: Writing Code
```
1. Code with secrets (database password in code)
2. Extension shows black boxes = secrets detected ✅
3. Fix: Add password to .env file instead
```

### Afternoon: Getting Help from Copilot
```
1. Select code to ask Copilot about
2. Press Ctrl+Shift+P → Check Selection
3. Extension: "Contains: apiKey"
4. Click Hide → Becomes [HIDDEN_APIKEY]
5. Paste to Copilot safely ✅
```

### Evening: Before Committing
```
1. Open file with code
2. Ctrl+Shift+P → Redact File
3. Check everything is hidden properly
4. Commit to GitHub without real secrets ✅
```

---

## When to Use Each Feature

### Use "Check Selection" When:
- About to copy code for Copilot
- Want to verify something is safe
- Sharing code with team members
- **Anytime you're unsure, check!**

### Use "Redact File" When:
- Before committing to GitHub
- Before emailing code to someone
- Making code examples for documentation
- Sharing in Slack or email

### Let Clipboard Warning Work When:
- You paste something into chat
- You paste into any text field
- Just let it do its job automatically ✅

---

## You're Protected When:

✅ Extension is installed (activated automatically)  
✅ You're editing code in VS Code  
✅ You're about to copy or paste  
✅ You're using any text field  

**It's always there, silently protecting you.**

---

## Bottom Line

**Privacy Guard AI = Your Security Guard**

- It **watches** for your secrets
- It **warns** you before they leak
- It **hides** them automatically
- You **control** what gets shared

**Result:** You can use Copilot safely. Your secrets stay your secrets. 🔒

---

## Need Help?

**Something not working?** Check these:
1. Is the extension installed? (Extensions → Search "Privacy Guard AI")
2. Is it enabled? (It should say "Disable" not "Enable")
3. Try restarting VS Code
4. Check settings (Ctrl+, search "Privacy Guard AI")

**Still stuck?**
- Open the Output panel (View → Output)
- Select "Privacy Guard AI - Chat Monitor"
- You'll see exactly what's happening

---

**Status:** ✅ Ready to Use  
**Current Version:** 1.1.0  
**Your Secrets:** Safe & Secure 🔒
