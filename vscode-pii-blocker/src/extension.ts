/**
 * PII Blocker VS Code Extension
 * Main extension file with real-time PII detection and Copilot Chat integration
 */

import * as vscode from 'vscode';
import { scanForPII, redactSensitiveData, getPIIRanges } from './piiPatterns';
import { CopilotChatMonitor } from './copilotChatMonitor';

let redactionDecorationType: vscode.TextEditorDecorationType;
let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;
let lastDetectionTime = 0;
let detectionStats = { total: 0, byType: {} as Record<string, number> };
let copilotMonitor: CopilotChatMonitor;

/**
 * Create redaction decoration type (black background)
 */
function createRedactionDecoration(): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: '#000000',
        color: '#000000',
        textDecoration: 'none',
        opacity: '1',
        border: '1px solid #666666',
        borderRadius: '2px',
        isWholeLine: false,
    });
}

/**
 * Log detection to output channel (like browser extension)
 */
function logDetection(filename: string, detection: ReturnType<typeof scanForPII>): void {
    if (!detection.isSafe) {
        // Update stats
        detectionStats.total++;
        for (const type of detection.matchesFound) {
            detectionStats.byType[type] = (detectionStats.byType[type] || 0) + 1;
        }

        // Log to console
        const timestamp = new Date().toLocaleString();
        const detectedTypes = detection.matchesFound.join(', ');
        console.log(`[PII BLOCKER] ${timestamp} | File: ${filename} | Types: ${detectedTypes} | Status: DETECTED & REDACTED`);
    }
}
function scanAndDecorateEditor(editor: vscode.TextEditor): void {
    if (!editor) return;

    const document = editor.document;
    const text = document.getText();
    
    const detection = scanForPII(text);
    const decorationRanges: vscode.Range[] = [];
    const diagnostics: vscode.Diagnostic[] = [];

    // Convert character ranges to VS Code ranges
    for (const range of getPIIRanges(text)) {
        const startPos = document.positionAt(range.range[0]);
        const endPos = document.positionAt(range.range[1]);
        const vsCodeRange = new vscode.Range(startPos, endPos);
        
        decorationRanges.push(vsCodeRange);

        // Create diagnostic for problems panel
        const diagnostic = new vscode.Diagnostic(
            vsCodeRange,
            `PII Detected: ${range.type}`,
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = 'pii-blocker-' + range.type;
        diagnostics.push(diagnostic);
    }

    // Apply decorations
    editor.setDecorations(redactionDecorationType, decorationRanges);
    
    // Set diagnostics
    diagnosticCollection.set(document.uri, diagnostics);

    // Log detection (like browser extension)
    logDetection(document.fileName, detection);

    // Update status bar
    if (!detection.isSafe) {
        const totalDetections = Array.from(detection.detailsPerType.values()).reduce((sum, matches) => sum + matches.length, 0);
        statusBarItem.text = `🔒 PII: ${totalDetections} detected`;
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }

    // Show warning notification (with throttling to avoid spam)
    if (!detection.isSafe) {
        const now = Date.now();
        if (now - lastDetectionTime > 2000) { // Only show every 2 seconds max
            lastDetectionTime = now;
            const matches = Array.from(detection.detailsPerType.entries())
                .map(([type, items]) => `${type} (${items.length})`)
                .join(', ');
            
            vscode.window.showWarningMessage(
                `🚨 PRIVACY VIOLATION: Detected ${matches} | Exfiltration Paused`,
                'Send Redacted',
                'Cancel'
            ).then(selection => {
                if (selection === 'Send Redacted') {
                    vscode.commands.executeCommand('piiBlocker.redactCurrentFile');
                } else if (selection === 'Cancel') {
                    vscode.commands.executeCommand('workbench.action.problems.focus');
                }
            });
        }
    }
}

/**
 * Register Copilot Chat Participant
 */
function registerCopilotParticipant(context: vscode.ExtensionContext): void {
    try {
        const chatParticipantHandler = vscode.chat.createChatParticipant(
            'secure-scan',
            async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
                const editor = vscode.window.activeTextEditor;
                
                if (!editor) {
                    stream.markdown('No active editor found. Please open a file first.');
                    return;
                }

                const document = editor.document;
                const text = document.getText();
                const detection = scanForPII(text);

                stream.markdown(`### 🔒 PII Scan Results for ${document.fileName}\n\n`);

                if (detection.isSafe) {
                    stream.markdown('✅ **No sensitive data detected!** This file is safe.\n');
                } else {
                    stream.markdown(`⚠️ **${detection.matchesFound.length} type(s) of sensitive data found:**\n\n`);

                    for (const [type, matches] of detection.detailsPerType) {
                        stream.markdown(`**${type}:** ${matches.length} occurrence(s)\n`);
                        
                        // Show preview of detected items (sanitized)
                        matches.slice(0, 3).forEach((match, idx) => {
                            const preview = match.text.substring(0, 5) + '****' + match.text.substring(match.text.length - 2);
                            stream.markdown(`  - Line ${document.positionAt(match.range[0]).line + 1}: ${preview}\n`);
                        });

                        if (matches.length > 3) {
                            stream.markdown(`  - ... and ${matches.length - 3} more\n`);
                        }
                    }

                    stream.markdown(`\n### Recommendations:\n`);
                    stream.markdown(`1. **Review** the highlighted areas in your editor (shown with black boxes)\n`);
                    stream.markdown(`2. **Remove or redact** any sensitive information before committing\n`);
                    stream.markdown(`3. Consider using environment variables for credentials\n`);
                }
            }
        );

        chatParticipantHandler.iconPath = new vscode.ThemeIcon('shield');

        context.subscriptions.push(chatParticipantHandler);
    } catch (error) {
        console.error('Failed to register Copilot participant:', error);
        vscode.window.showWarningMessage('Copilot Chat integration not available in this VS Code version.');
    }
}

/**
 * Main activation function
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('PII Blocker extension activated');

    // Create decoration type
    redactionDecorationType = createRedactionDecoration();
    
    // Create diagnostic collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection('pii-blocker');
    
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'piiBlocker.openSettings';
    
    context.subscriptions.push(redactionDecorationType);
    context.subscriptions.push(diagnosticCollection);
    context.subscriptions.push(statusBarItem);

    // Register Copilot Chat participant
    registerCopilotParticipant(context);

    // Initialize Copilot Chat monitor to block secrets before sending
    copilotMonitor = new CopilotChatMonitor();
    copilotMonitor.initializeChatBlocking(context);
    context.subscriptions.push(copilotMonitor);

    // Scan active editor on activation
    if (vscode.window.activeTextEditor) {
        scanAndDecorateEditor(vscode.window.activeTextEditor);
    }

    // Listen for text changes
    const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            scanAndDecorateEditor(editor);
        }
    });
    context.subscriptions.push(changeListener);

    // Listen for active editor changes
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            scanAndDecorateEditor(editor);
        }
    });
    context.subscriptions.push(editorChangeListener);

    // Register command to redact current file
    const redactCommand = vscode.commands.registerCommand(
        'piiBlocker.redactCurrentFile',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found.');
                return;
            }

            const document = editor.document;
            const text = document.getText();
            const detection = scanForPII(text);

            if (detection.isSafe) {
                vscode.window.showInformationMessage('✅ No PII detected in this file.');
                return;
            }

            const confirm = await vscode.window.showWarningMessage(
                `🚨 Found ${detection.matchesFound.length} type(s) of sensitive data. Redact and sanitize?`,
                '✔ Send Redacted Version',
                '✖ Cancel and Edit'
            );

            if (confirm === '✔ Send Redacted Version') {
                const redactedText = redactSensitiveData(text);
                const full = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );
                
                await editor.edit((editBuilder) => {
                    editBuilder.replace(full, redactedText);
                });

                vscode.window.showInformationMessage(
                    '✅ Text sanitized. You can now safely share this file.',
                    'OK'
                );
            }
        }
    );
    context.subscriptions.push(redactCommand);

    // Register command to show detection statistics
    const statsCommand = vscode.commands.registerCommand(
        'piiBlocker.showStats',
        () => {
            const statsMessage = `
📊 PII BLOCKER STATISTICS
────────────────────────
Total Detections: ${detectionStats.total}
${Object.entries(detectionStats.byType)
    .map(([type, count]) => `  • ${type}: ${count}`)
    .join('\n')}
────────────────────────
Files are being monitored for sensitive data.
`;
            vscode.window.showInformationMessage(statsMessage);
        }
    );
    context.subscriptions.push(statsCommand);

    // Register command to redact Copilot Chat message
    const redactCopilotCommand = vscode.commands.registerCommand(
        'piiBlocker.redactCopilotMessage',
        async () => {
            if (!copilotMonitor) {
                vscode.window.showErrorMessage('Chat monitor not initialized.');
                return;
            }
            await copilotMonitor.checkCurrentSelectionSafety();
        }
    );
    context.subscriptions.push(redactCopilotCommand);

    // Register command to check current selection safety
    const checkSelectionCommand = vscode.commands.registerCommand(
        'piiBlocker.checkSelection',
        async () => {
            if (!copilotMonitor) {
                vscode.window.showErrorMessage('Chat monitor not initialized.');
                return;
            }
            await copilotMonitor.checkCurrentSelectionSafety();
        }
    );
    context.subscriptions.push(checkSelectionCommand);

    // Register command to show chat monitoring status
    const monitoringStatusCommand = vscode.commands.registerCommand(
        'piiBlocker.showMonitoringStatus',
        () => {
            if (!copilotMonitor) {
                vscode.window.showErrorMessage('Chat monitor not initialized.');
                return;
            }
            copilotMonitor.showMonitoringStatus();
        }
    );
    context.subscriptions.push(monitoringStatusCommand);

    // Register command to open settings
    const settingsCommand = vscode.commands.registerCommand(
        'piiBlocker.openSettings',
        () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'piiBlocker');
        }
    );
    context.subscriptions.push(settingsCommand);
}

/**
 * Deactivation function
 */
export function deactivate(): void {
    if (copilotMonitor) {
        copilotMonitor.dispose();
    }
    console.log('PII Blocker extension deactivated');
}
