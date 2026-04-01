/**
 * SentinelGate: content.js
 * Final Hackathon-Ready Version (Updated with Mouse Click Interception)
 */

// 1. Defined Sensitive Patterns (Regex) - Must be at the top
const SENSITIVE_PATTERNS = {
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
    awsKey: /AKIA[0-9A-Z]{16}/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    proprietaryMarkers: /(INTERNAL_ONLY|CONFIDENTIAL|PROPERTY_OF_ACME|DO_NOT_DISTRIBUTE)/gi,
    dbConnection: /(mongodb\+srv|postgres|mysql):\/\/[^\s]+/gi,
    highEntropySecret: /\b(?=[A-Za-z0-9_\/+\-=]{32,128}\b)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z0-9_\/+\-=]{32,128}\b/g
};

// 2. The Redaction Engine
function scanAndRedact(text) {
    let matchesFound = [];
    let redactedText = text;

    for (let type in SENSITIVE_PATTERNS) {
        // Reset regex index for global flags
        SENSITIVE_PATTERNS[type].lastIndex = 0; 
        
        if (SENSITIVE_PATTERNS[type].test(text)) {
            matchesFound.push(type);
            redactedText = redactedText.replace(SENSITIVE_PATTERNS[type], `[REDACTED_${type.toUpperCase()}]`);
        }
    }
    return { isSafe: matchesFound.length === 0, redactedText, matchesFound };
}

// 3. Centralized Logging Function
function logViolation(analysis) {
    try {
        if (chrome.runtime && chrome.runtime.id) {
            chrome.storage.local.get(['stats', 'detailedLogs'], (result) => {
                if (chrome.runtime.lastError) return;

                let stats = result.stats || { total: 0, types: {} };
                let logs = result.detailedLogs || [];

                stats.total++;
                analysis.matchesFound.forEach(type => {
                    stats.types[type] = (stats.types[type] || 0) + 1;
                });

                const newLog = {
                    time: new Date().toLocaleString(),
                    type: analysis.matchesFound.join(', '),
                    platform: window.location.hostname.replace('www.', ''),
                    status: "Blocked & Redacted"
                };
                logs.push(newLog);

                chrome.storage.local.set({ stats: stats, detailedLogs: logs });
            });
        }
    } catch (e) {
        console.log("SentinelGate: Extension context invalidated. Please refresh the page.");
    }
}

function getEditableText(element) {
    if (!element) return '';

    if (typeof element.value === 'string') {
        return element.value;
    }

    if (element.isContentEditable) {
        return element.innerText || element.textContent || '';
    }

    return element.textContent || '';
}

function dispatchInputEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}

function setNativeInputValue(element, value) {
    const proto = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

    if (descriptor && typeof descriptor.set === 'function') {
        descriptor.set.call(element, value);
    } else {
        element.value = value;
    }

    dispatchInputEvents(element);
}

function setContentEditableValue(element, value) {
    element.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.deleteContents();
    range.insertNode(document.createTextNode(value));
    range.collapse(false);

    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }

    dispatchInputEvents(element);
}

function applyRedactedText(element, redactedText) {
    if (!element) return false;

    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        setNativeInputValue(element, redactedText);
        return true;
    }

    if (element.isContentEditable || element.contentEditable === 'true') {
        setContentEditableValue(element, redactedText);
        return true;
    }

    if ('innerText' in element) {
        element.innerText = redactedText;
        dispatchInputEvents(element);
        return true;
    }

    return false;
}

function triggerSubmission(inputElement, submitTarget) {
    if (submitTarget && submitTarget.isConnected && !submitTarget.disabled) {
        submitTarget.click();
        return true;
    }

    const form = inputElement && typeof inputElement.closest === 'function' ? inputElement.closest('form') : null;
    if (form) {
        if (typeof form.requestSubmit === 'function') {
            form.requestSubmit();
        } else {
            form.submit();
        }
        return true;
    }

    if (!inputElement) return false;

    inputElement.focus();
    ['keydown', 'keypress', 'keyup'].forEach(type => {
        inputElement.dispatchEvent(new KeyboardEvent(type, {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
            composed: true
        }));
    });
    return true;
}

// 4. The Modern UI Overlay Logic
function showModernWarning(analysis, targetElement, submitTarget) {
    // Remove existing overlay if present
    const existing = document.getElementById('sentinel-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'sentinel-overlay';
    overlay.className = 'sentinel-warning-overlay'; // Uses your styles.css
    
    // Inline styles as backup for hackathon stability
    overlay.setAttribute('style', `
        position: fixed; top: 20px; right: 20px; background: #1e293b; color: white; 
        padding: 20px; border-radius: 12px; border: 2px solid #ef4444; z-index: 100000; 
        width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-family: sans-serif;
    `);

    overlay.innerHTML = `
        <strong style="display:block; color: #ef4444; margin-bottom: 8px;">🚨 PRIVACY VIOLATION</strong>
        <p style="font-size: 13px; margin: 0 0 15px 0;">We detected: <b>${analysis.matchesFound.join(', ')}</b>. Exfiltration paused.</p>
        <button id="sendRedacted" style="background: #ef4444; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: bold;">Send Redacted Version</button>
        <button id="cancelSend" style="background: transparent; color: #94a3b8; border: none; margin-top: 10px; cursor: pointer; width: 100%; font-size: 12px;">Cancel and Edit</button>
    `;
    
    document.body.appendChild(overlay);

    // Handle Redaction Choice
    document.getElementById('sendRedacted').onclick = () => {
        const applied = applyRedactedText(targetElement, analysis.redactedText);
        if (applied) {
            // Delay a tick so framework state updates before submit is retriggered.
            setTimeout(() => {
                triggerSubmission(targetElement, submitTarget);
            }, 30);
        }
        overlay.remove();
    };

    document.getElementById('cancelSend').onclick = () => overlay.remove();
}

// 5. Centralized Submission Handler
let lastBlockedSignature = '';
let lastBlockedAt = 0;

function processSubmission(event, userInput, inputElement, submitTarget) {
    if (!userInput) return true;
    
    const analysis = scanAndRedact(userInput);
    const signature = `${userInput.length}:${userInput.slice(0, 24)}`;

    if (!analysis.isSafe) {
        // Stop the event dead in its tracks
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const now = Date.now();
        const isDuplicateBlock = signature === lastBlockedSignature && (now - lastBlockedAt) < 800;

        if (!isDuplicateBlock) {
            showModernWarning(analysis, inputElement, submitTarget);
            logViolation(analysis);
            lastBlockedSignature = signature;
            lastBlockedAt = now;
        }

        return false; // Submission blocked
    }
    return true; // Submission safe
}

// ==========================================
// 6. EVENT INTERCEPTORS (The Fix)
// ==========================================

let activeTextInput = null;

function getRole(element) {
    if (!element || typeof element.getAttribute !== 'function') return '';
    return (element.getAttribute('role') || '').toLowerCase();
}

function isInsideSentinelOverlay(element) {
    return !!(element && typeof element.closest === 'function' && element.closest('#sentinel-overlay'));
}

function isLikelySendButton(element) {
    if (!element || isInsideSentinelOverlay(element)) return false;

    const aria = (element.getAttribute('aria-label') || '').toLowerCase();
    const testId = (element.getAttribute('data-testid') || '').toLowerCase();
    const title = (element.getAttribute('title') || '').toLowerCase();
    const text = (element.innerText || element.textContent || '').toLowerCase();
    const className = (element.className || '').toString().toLowerCase();

    return aria.includes('send') ||
        testId.includes('send') ||
        title.includes('send') ||
        aria.includes('run') ||
        testId.includes('submit') ||
        className.includes('send') ||
        text.trim() === 'send' ||
        element.type === 'submit';
}

function isEditableElement(element) {
    if (!element || !element.tagName) return false;

    const tagName = element.tagName.toUpperCase();
    const role = getRole(element);
    const isTextLikeInput = tagName === 'INPUT' && /^(text|search|email|url|tel|password)$/.test((element.type || '').toLowerCase());

    return tagName === 'TEXTAREA' ||
        isTextLikeInput ||
        role === 'textbox' ||
        element.isContentEditable ||
        element.contentEditable === 'true';
}

function findInputForEvent(eventTarget) {
    const activeElement = document.activeElement;
    if (isEditableElement(activeElement)) return activeElement;
    if (activeTextInput && activeTextInput.isConnected && isEditableElement(activeTextInput)) return activeTextInput;

    let node = eventTarget;
    while (node && node !== document.body) {
        if (typeof node.querySelector === 'function') {
            const nestedEditable = node.querySelector('textarea, input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], input[type="password"], [contenteditable="true"], [role="textbox"]');
            if (nestedEditable) return nestedEditable;
        }
        node = node.parentElement;
    }

    return document.querySelector('textarea, input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], input[type="password"], [contenteditable="true"], [role="textbox"]');
}

// A. Track the active text input box dynamically
document.addEventListener('input', (e) => {
    if (isEditableElement(e.target)) {
        activeTextInput = e.target;
    }
}, true);

document.addEventListener('focusin', (e) => {
    if (isEditableElement(e.target)) {
        activeTextInput = e.target;
    }
}, true);

// B. Enter Key Interceptor
window.addEventListener('keydown', (event) => {
    if (isInsideSentinelOverlay(event.target)) return;

    const isTextArea = isEditableElement(event.target);
    
    if (isTextArea && event.key === 'Enter' && !event.shiftKey) {
        const userInput = getEditableText(event.target);
        processSubmission(event, userInput, event.target, null);
    }
}, true); // Use capture phase

// C. Mouse Click Interceptor (Catches Send Buttons)
['mousedown', 'click'].forEach(eventType => {
    window.addEventListener(eventType, (event) => {
        if (isInsideSentinelOverlay(event.target)) return;

        let target = event.target;
        let isSendAction = false;
        let sendButton = null;

        // Traverse up the DOM tree to see if the user clicked inside a button
        while (target && target !== document.body) {
            if (target.tagName === 'BUTTON' || getRole(target) === 'button') {
                // Identify if the button is likely a send action.
                if (isLikelySendButton(target)) {
                    isSendAction = true;
                    sendButton = target;
                    break;
                }
            }
            target = target.parentElement;
        }

        if (isSendAction) {
            // Find the best candidate input near the interaction point
            const inputElement = findInputForEvent(event.target);
            
            if (inputElement) {
                const userInput = getEditableText(inputElement);
                processSubmission(event, userInput, inputElement, sendButton);
            }
        }
    }, true); // Use capture phase to intercept before React handles it
});
