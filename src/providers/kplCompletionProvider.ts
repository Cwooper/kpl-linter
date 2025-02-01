// src/providers/kplCompletionProvider.ts
import * as vscode from "vscode";
import {
  BLOCK_STATEMENTS,
  SPECIAL_STATEMENTS,
} from "../constants/kplStatements";

export class KPLCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const completionItems: vscode.CompletionItem[] = [];

    // Add block statement completions
    for (const statement of BLOCK_STATEMENTS) {
      // Start of block completion
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
      completionItems.push(startCompletion);

      // End of block completion (only if there is an end marker)
      if (statement.end) {
        const endCompletion = new vscode.CompletionItem(
          statement.end,
          vscode.CompletionItemKind.Keyword
        );
        endCompletion.commitCharacters = ["\n"];
        completionItems.push(endCompletion);
      }
    }

    // Add special statement completions
    for (const statement of SPECIAL_STATEMENTS) {
      const completionItem = new vscode.CompletionItem(
        statement.keyword,
        vscode.CompletionItemKind.Keyword
      );
      completionItem.insertText = new vscode.SnippetString(statement.snippet);
      completionItems.push(completionItem);
    }

    return completionItems;
  }
}
