import * as vscode from "vscode";
import { FormattingRules } from "../utils/formattingRules";

export class BlitzFormatter implements vscode.DocumentFormattingEditProvider {
  private rules: FormattingRules;

  constructor() {
    this.rules = new FormattingRules();
  }

  public provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions
  ): vscode.TextEdit[] {
    const edits: vscode.TextEdit[] = [];
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const formattedLine = this.rules.formatLine(currentLine);

      // Only create an edit if the line changed
      if (formattedLine !== currentLine) {
        const range = new vscode.Range(
          new vscode.Position(i, 0),
          new vscode.Position(i, currentLine.length)
        );
        edits.push(vscode.TextEdit.replace(range, formattedLine));
      }
    }

    return edits;
  }
}
