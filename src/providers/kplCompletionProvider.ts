// src/providers/kplCompletionProvider.ts
import * as vscode from 'vscode';
import { 
    BLOCK_STATEMENTS, 
    SPECIAL_STATEMENTS,
    PRIMITIVE_TYPES,
    SPECIAL_TYPES
} from '../constants/kplStatements';

export class KPLCompletionProvider implements vscode.CompletionItemProvider {
    private getCompletionContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): 'type' | 'block' | 'general' {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        // Check if we're in a type context
        if (linePrefix.trim().match(/^(var|function.*:|method.*:)\s*$/)) {
            return 'type';
        }
        
        // Check if we're in a known block context
        // Add more context checks as needed
        
        return 'general';
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const completionItems: vscode.CompletionItem[] = [];
        const completionContext = this.getCompletionContext(document, position);

        switch (completionContext) {
            case 'type':
                // Provide type completions with high priority
                this.addTypeCompletions(completionItems, true);
                break;
            
            case 'general':
            default:
                // Add all completions with appropriate priorities
                this.addBlockCompletions(completionItems);
                this.addTypeCompletions(completionItems, false);
                this.addSpecialStatementCompletions(completionItems);
                break;
        }

        return completionItems;
    }

    private addBlockCompletions(items: vscode.CompletionItem[]): void {
        for (const statement of BLOCK_STATEMENTS) {
            const startCompletion = new vscode.CompletionItem(
                statement.start,
                vscode.CompletionItemKind.Snippet
            );
            startCompletion.insertText = new vscode.SnippetString(statement.snippet);
            startCompletion.documentation = new vscode.MarkdownString(
                statement.end 
                    ? `Creates a ${statement.start} block with matching ${statement.end}`
                    : `Creates a ${statement.start} statement`
            );
            // Lower priority for block statements when typing short things like "i"
            startCompletion.sortText = `3-${statement.start}`;
            items.push(startCompletion);

            if (statement.end) {
                const endCompletion = new vscode.CompletionItem(
                    statement.end,
                    vscode.CompletionItemKind.Keyword
                );
                endCompletion.commitCharacters = ['\n'];
                endCompletion.sortText = `3-${statement.end}`;
                items.push(endCompletion);
            }
        }
    }

    private addTypeCompletions(items: vscode.CompletionItem[], highPriority: boolean): void {
        // Add primitive types
        for (const type of PRIMITIVE_TYPES) {
            const completion = new vscode.CompletionItem(
                type.name,
                vscode.CompletionItemKind.TypeParameter
            );
            completion.documentation = new vscode.MarkdownString(type.documentation);
            completion.insertText = new vscode.SnippetString(type.snippet);
            // Higher priority for types in type contexts
            completion.sortText = highPriority ? `1-${type.name}` : `2-${type.name}`;
            items.push(completion);
        }

        // Add special types with slightly lower priority
        for (const type of SPECIAL_TYPES) {
            const completion = new vscode.CompletionItem(
                type.name,
                vscode.CompletionItemKind.TypeParameter
            );
            completion.documentation = new vscode.MarkdownString(type.documentation);
            completion.insertText = new vscode.SnippetString(type.snippet);
            completion.sortText = highPriority ? `2-${type.name}` : `3-${type.name}`;
            items.push(completion);
        }
    }

    private addSpecialStatementCompletions(items: vscode.CompletionItem[]): void {
        for (const statement of SPECIAL_STATEMENTS) {
            const completion = new vscode.CompletionItem(
                statement.keyword,
                vscode.CompletionItemKind.Keyword
            );
            completion.insertText = new vscode.SnippetString(statement.snippet);
            completion.sortText = `3-${statement.keyword}`;
            items.push(completion);
        }
    }
}
