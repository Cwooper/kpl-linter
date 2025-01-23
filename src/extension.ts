import * as vscode from 'vscode';
import { BlitzFormatter } from './formatters/blitzFormatter';

export function activate(context: vscode.ExtensionContext) {
    // Register the Blitz Assembly formatter
    const blitzFormatter = new BlitzFormatter();
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'blitz-asm',
            blitzFormatter
        )
    );

    // Command for manual formatting
    context.subscriptions.push(
        vscode.commands.registerCommand('kpl-linter.formatBlitzAssembly', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'blitz-asm') {
                vscode.commands.executeCommand('editor.action.formatDocument');
            }
        })
    );
}

export function deactivate() {}