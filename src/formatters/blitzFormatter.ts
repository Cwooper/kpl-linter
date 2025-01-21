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
    const originalLines = text.split(/\r?\n/);

    // First pass: collect all the formatted lines and their mappings
    let currentLine = 0;
    const formattedLines: string[] = [];
    const lineMap: Map<number, number> = new Map(); // Maps original line to formatted line number

    for (let i = 0; i < originalLines.length; i++) {
      const line = originalLines[i];
      const formattedResult = this.rules.formatLine(line);
      const resultArray = Array.isArray(formattedResult)
        ? formattedResult
        : [formattedResult];

      lineMap.set(i, currentLine);
      for (const formattedLine of resultArray) {
        formattedLines.push(formattedLine);
        currentLine++;
      }
    }

    // Second pass: create edits by comparing original to formatted
    if (formattedLines.join("\n") !== originalLines.join("\n")) {
      // Create a single edit for the entire document
      const fullRange = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(originalLines.length, 0)
      );
      edits.push(vscode.TextEdit.replace(fullRange, formattedLines.join("\n")));
    }

    return edits;
  }
}
