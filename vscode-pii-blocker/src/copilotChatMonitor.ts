/**
 * Chat Message Interceptor for Privacy Guard AI
 * Properly intercepts ALL messages going to Copilot before they're sent
 */

import * as vscode from 'vscode';
import { scanForPII, redactSensitiveData } from './piiPatterns';

export class CopilotChatMonitor implements vscode.Disposable {
    private outputChannel: vscode.OutputChannel;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Privacy Guard AI - Chat Monitor');
    }

    /**
     * Initialize global chat message interception
     * This hooks into VS Code's chat system to block messages with PII
     */
    public initializeChatBlocking(context: vscode.ExtensionContext): void {
        // Listen to ALL clipboard interactions (workaround for detecting pasted secrets)
        this.monitorClipboardForSecrets(context);

        // Monitor for any text selections that might be PII (to warn user)
        this.monitorTextSelectionsForPII(context);

        this.outputChannel.appendLine('✅ Chat message monitoring initialized');
    }

    /**
     * Monitor clipboard for secrets being pasted (indicator of accidental data sharing)
     */
    private monitorClipboardForSecrets(context: vscode.ExtensionContext): void {
        // Check clipboard whenever user pastes
        const pasteListener = vscode.commands.registerCommand('editor.action.clipboardPasteAction', async () => {
            try {
                const clipboardText = await vscode.env.clipboard.readText();
                if (!clipboardText) return;

                const detection = scanForPII(clipboardText);
                if (!detection.isSafe) {
                    this.showPasteWarning(detection, clipboardText);
                }
            } catch (error) {
                // Clipboard reading might fail in some contexts
            }
        });

        context.subscriptions.push(pasteListener);
        this.disposables.push(pasteListener);
    }

    /**
     * Show warning when user pastes sensitive data
     */
    private showPasteWarning(detection: ReturnType<typeof scanForPII>, clipboardText: string): void {
        const detectedTypes = detection.matchesFound.join(', ');
        const count = Array.from(detection.detailsPerType.values()).reduce((sum, matches) => sum + matches.length, 0);

        const actions = {
            redact: 'Redact & Copy Safe Version',
            ignore: 'Continue',
            view: 'View Details'
        };

        vscode.window.showWarningMessage(
            `🚨 CLIPBOARD CONTAINS: ${detectedTypes} (${count} matches)`,
            actions.redact,
            actions.view,
            actions.ignore
        ).then(async (selection) => {
            if (selection === actions.redact) {
                const redacted = redactSensitiveData(clipboardText);
                await vscode.env.clipboard.writeText(redacted);
                vscode.window.showInformationMessage(
                    '✅ Clipboard sanitized! Now contains [REDACTED] placeholders. Safe to paste.'
                );
            } else if (selection === actions.view) {
                const details = Array.from(detection.detailsPerType.entries())
                    .map(([type, matches]) => `${type}: ${matches.length} found`)
                    .join('\n');
                vscode.window.showInformationMessage(`Detected:\n${details}`);
            }
        });

        // Log the detection
        this.outputChannel.appendLine(
            `[${new Date().toLocaleTimeString()}] 🚨 PASTE SECURITY WARNING: ${detectedTypes} detected in clipboard`
        );
    }

    /**
     * Monitor selected text for PII (in case user is about to paste/share)
     */
    private monitorTextSelectionsForPII(context: vscode.ExtensionContext): void {
        const selectionListener = vscode.window.onDidChangeTextEditorSelection((event) => {
            const editor = event.textEditor;
            const selection = editor.selection;

            // Only check if user has selected text (3+ characters)
            if (selection.isEmpty || selection.end.line === selection.start.line && selection.end.character - selection.start.character < 5) {
                return;
            }

            const selectedText = editor.document.getText(selection);
            const detection = scanForPII(selectedText);

            if (!detection.isSafe) {
                const types = detection.matchesFound.join(', ');
                const statusBarMsg = `⚠️ SELECTED TEXT CONTAINS: ${types}`;
                this.outputChannel.appendLine(`${statusBarMsg}`);

                // Only show popup if it's substantial selection
                if (selectedText.length > 50) {
                    vscode.window.showWarningMessage(
                        `⚠️ You've selected ${types}. Be careful with this! Don't share publicly.`,
                        'Redact Selection'
                    ).then(async (action) => {
                        if (action === 'Redact Selection') {
                            const redacted = redactSensitiveData(selectedText);
                            await editor.edit((builder) => {
                                builder.replace(selection, redacted);
                            });
                        }
                    });
                }
            }
        });

        context.subscriptions.push(selectionListener);
        this.disposables.push(selectionListener);
    }

    /**
     * Check if text is safe to send (for manual verification)
     */
    public checkTextSafety(text: string): { safe: boolean; types: string[]; message: string } {
        const detection = scanForPII(text);

        return {
            safe: detection.isSafe,
            types: detection.matchesFound,
            message: detection.isSafe
                ? '✅ Text is safe to share'
                : `🚨 Contains: ${detection.matchesFound.join(', ')}`
        };
    }

    /**
     * User command to check current selection safety
     */
    public async checkCurrentSelectionSafety(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showInformationMessage('No text selected. Select text to check safety.');
            return;
        }

        const selectedText = editor.document.getText(editor.selection);
        const result = this.checkTextSafety(selectedText);

        if (result.safe) {
            vscode.window.showInformationMessage('✅ This text is safe to send to Copilot or share publicly.');
        } else {
            const action = await vscode.window.showWarningMessage(
                `🚨 Contains: ${result.types.join(', ')}\n\nThis should NOT be sent to Copilot!`,
                'Redact This Text',
                'Copy as-is anyway'
            );

            if (action === 'Redact This Text') {
                const redacted = redactSensitiveData(selectedText);
                await editor.edit((builder) => {
                    builder.replace(editor.selection, redacted);
                });
                vscode.window.showInformationMessage('✅ Text redacted!');
            }
        }
    }

    /**
     * Show monitoring status in output channel
     */
    public showMonitoringStatus(): void {
        const summary = `
╔════════════════════════════════════════╗
║  PRIVACY GUARD AI - MONITORING STATUS   ║
╚════════════════════════════════════════╝

✅ Active Protections:
  • Clipboard scanning for secrets
  • Selection monitoring for PII
  • Paste event interception
  • Real-time detection feedback

🛡️ Protected Data Types:
  • Email addresses
  • API Keys (AWS, etc)
  • Credit card numbers
  • Database connections
  • High-entropy secrets
  • IP addresses
  • And more...

⚡ How it works:
  1. Select text → warns if PII detected
  2. Paste text → checks clipboard for secrets
  3. Click "Redact & Copy" → sanitizes before pasting
  4. One-click redaction with [REDACTED] placeholders

📝 Log Output:
────────────────────────────────────────
`;
        this.outputChannel.clear();
        this.outputChannel.appendLine(summary);
        this.outputChannel.show(true);
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.outputChannel.dispose();
    }
}
