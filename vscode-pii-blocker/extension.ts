/**
 * PII Blocker VS Code Extension
 * Main extension file with real-time PII detection and Copilot Chat integration
 */

import * as vscode from 'vscode';
import { scanForPII, redactSensitiveData, getPIIRanges } from './piiPatterns';

let redactionDecorationType: vscode.TextEditorDecorationType;
let diagnosticCollection: vscode.DiagnosticCollection;

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
        hoverMessage: new vscode.MarkdownString('**[REDACTED]** Sensitive PII detected'),
        isWholeLine: false,
    });
}

/**
 * Scan editor content and apply decorations
 */
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

    // Log if unsafe content found
    if (!detection.isSafe) {
        const matches = Array.from(detection.detailsPerType.entries())
            .map(([type, items]) => `${type} (${items.length})`)
            .join(', ');
        
        vscode.window.showWarningMessage(
            `⚠️ PII Detected: ${matches}. Content is being redacted in the editor.`
        );
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
                    stream.markdown(`1. **Review** the highlighted areas in your editor (shown with black boxes)\\n`);
                    stream.markdown(`2. **Remove or redact** any sensitive information before committing\\n`);
                    stream.markdown(`3. Consider using environment variables for credentials\\n`);
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
    
    context.subscriptions.push(redactionDecorationType);
    context.subscriptions.push(diagnosticCollection);

    // Register Copilot Chat participant
    registerCopilotParticipant(context);

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
                `Found ${detection.matchesFound.length} type(s) of PII. Replace with redacted version?`,
                'Yes, Redact',
                'Cancel'
            );

            if (confirm === 'Yes, Redact') {
                const redactedText = redactSensitiveData(text);
                const full = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );
                
                await editor.edit((editBuilder) => {
                    editBuilder.replace(full, redactedText);
                });

                vscode.window.showInformationMessage('✅ File redacted successfully.');
            }
        }
    );
    context.subscriptions.push(redactCommand);

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
    console.log('PII Blocker extension deactivated');
}
