// src/extension.ts
import * as vscode from "vscode";
import { BlitzParser } from "../parsers/blitz/parser";
import { BlitzDiagnostic, Token } from "../parsers/blitz/types/types";
import { Instructions, Registers } from "../parsers/blitz/types/definitions";

export class BlitzLanguageService {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private documentVersions = new Map<string, number>();
  private parser: BlitzParser;

  constructor(parser: BlitzParser) {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("blitz-asm");
    this.parser = parser;
  }

  private async validateDocument(document: vscode.TextDocument) {
    if (document.languageId !== "blitz-asm") return;

    // Check if we need to validate
    const version = document.version;
    const uri = document.uri.toString();

    if (this.documentVersions.get(uri) === version) {
      return; // Already validated this version
    }

    // Parse and validate
    const results = this.parser.parseText(document.getText());

    // Convert to VSCode diagnostics
    const diagnostics = results.diagnostics.map((d: BlitzDiagnostic) => {
      const range = new vscode.Range(
        d.line,
        d.column,
        d.line,
        d.column + d.length
      );

      return new vscode.Diagnostic(
        range,
        d.message,
        this.convertSeverity(d.severity)
      );
    });

    // Update diagnostics
    this.diagnosticCollection.set(document.uri, diagnostics);
    this.documentVersions.set(uri, version);
  }

  private convertSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
      case "error":
        return vscode.DiagnosticSeverity.Error;
      case "warning":
        return vscode.DiagnosticSeverity.Warning;
      case "info":
        return vscode.DiagnosticSeverity.Information;
      default:
        return vscode.DiagnosticSeverity.Error;
    }
  }

  // Add document listeners
  subscribeToDocumentChanges(context: vscode.ExtensionContext): void {
    // When document changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.validateDocument(event.document);
      })
    );

    // When document opens
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((document) => {
        this.validateDocument(document);
      })
    );

    // Initial validation of all open text documents
    vscode.workspace.textDocuments.forEach((document) => {
      this.validateDocument(document);
    });
  }
}

export class BlitzHoverProvider implements vscode.HoverProvider {
  private parser: BlitzParser;

  constructor(parser: BlitzParser) {
    this.parser = parser;
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    // Get the current line's tokens
    const line = document.lineAt(position.line).text;
    const tokens = this.parser.tokenizeLine(line, position.line);

    // Find which token we're hovering over
    const token = this.findTokenAtPosition(tokens, position.character);
    if (!token) return null;

    return this.getHoverForToken(token);
  }

  private findTokenAtPosition(tokens: Token[], column: number): Token | null {
    return (
      tokens.find(
        (token) =>
          column >= token.column && column < token.column + token.length
      ) || null
    );
  }

  private getHoverForToken(token: Token): vscode.Hover | null {
    switch (token.type) {
      case "instruction":
        return this.getInstructionHover(token);
      case "register":
        return this.getRegisterHover(token);
      case "label":
      case "identifier":
        return this.getSymbolHover(token);
      case "directive":
        return this.getDirectiveHover(token);
      case "memory":
        return this.getMemoryAccessHover(token);
      case "number":
        return this.getNumberHover(token);
      default:
        return null;
    }
  }

  private getInstructionHover(token: Token): vscode.Hover {
    const instruction = Instructions[token.value.toLowerCase()];
    if (!instruction) return new vscode.Hover("Unknown instruction");

    const content = new vscode.MarkdownString();
    content.appendCodeblock(token.value, "blitz-asm");
    content.appendMarkdown("\n\n" + instruction.description + "\n\n");

    content.appendMarkdown("**Formats:**\n");
    instruction.formats.forEach((format) => {
      content.appendMarkdown(`- \`${format.example}\`\n`);
      if (format.description) {
        content.appendMarkdown(`  ${format.description}\n`);
      }
    });

    if (instruction.category) {
      content.appendMarkdown(`\n**Category:** ${instruction.category}\n`);
    }

    return new vscode.Hover(content);
  }

  private getRegisterHover(token: Token): vscode.Hover {
    const register = Registers[token.value.toLowerCase()];
    if (!register) return new vscode.Hover("Unknown register");

    const content = new vscode.MarkdownString();
    content.appendCodeblock(token.value, "blitz-asm");
    content.appendMarkdown("\n\n" + register.description);

    if (register.isReserved) {
      content.appendMarkdown("\n\n*This is a reserved register*");
    }

    return new vscode.Hover(content);
  }

  private getSymbolHover(token: Token): vscode.Hover {
    const symbol = this.parser.getSymbol(token.value);
    if (!symbol) return new vscode.Hover(`Symbol: ${token.value}`);

    const content = new vscode.MarkdownString();
    content.appendCodeblock(token.value, "blitz-asm");

    if (symbol.type === "label") {
      content.appendMarkdown("\n\n**Label**\n");
      if (symbol.definition) {
        content.appendMarkdown(`Defined at line ${symbol.definition.line + 1}`);
      }
      content.appendMarkdown(`\nUsed ${symbol.references.length} time(s)`);
    } else if (symbol.type === "import") {
      content.appendMarkdown("\n\n**Imported Symbol**\n");
      content.appendMarkdown("Defined in another file");
    } else if (symbol.type === "export") {
      content.appendMarkdown("\n\n**Exported Symbol**\n");
      if (symbol.definition) {
        content.appendMarkdown(`Defined at line ${symbol.definition.line + 1}`);
      }
    }

    return new vscode.Hover(content);
  }

  private getDirectiveHover(token: Token): vscode.Hover {
    const directiveInfo: { [key: string]: string } = {
      ".text": "Begins the text (code) segment",
      ".data": "Begins the data segment",
      ".bss": "Begins the uninitialized data segment",
      ".word": "Defines a 32-bit word value",
      ".align": "Aligns to next word boundary",
      ".ascii": "Defines an ASCII string",
      ".export": "Exports a symbol for use by other files",
      ".import": "Imports a symbol from another file",
      ".skip": "Skips specified number of bytes",
    };

    const content = new vscode.MarkdownString();
    content.appendCodeblock(token.value, "blitz-asm");
    content.appendMarkdown(
      "\n\n" + (directiveInfo[token.value] || "Assembler directive")
    );

    return new vscode.Hover(content);
  }

  private getMemoryAccessHover(token: Token): vscode.Hover {
    const content = new vscode.MarkdownString();
    content.appendCodeblock(token.value, "blitz-asm");
    content.appendMarkdown("\n\nMemory access");

    // Add specific details about the memory access pattern
    if (token.value.includes("++")) {
      content.appendMarkdown("\n\nPost-increment memory access");
    } else if (token.value.includes("--")) {
      content.appendMarkdown("\n\nPre-decrement memory access");
    } else if (token.value.includes("+")) {
      content.appendMarkdown("\n\nOffset-based memory access");
    }

    return new vscode.Hover(content);
  }

  private getNumberHover(token: Token): vscode.Hover {
    const content = new vscode.MarkdownString();
    content.appendCodeblock(token.value, "blitz-asm");

    // If it's a hex number, show decimal equivalent
    if (token.value.startsWith("0x")) {
      const decimal = parseInt(token.value, 16);
      content.appendMarkdown(`\n\nDecimal: ${decimal}`);
    }
    // If it's a decimal, show hex equivalent
    else {
      const hex = "0x" + parseInt(token.value).toString(16).toUpperCase();
      content.appendMarkdown(`\n\nHex: ${hex}`);
    }

    return new vscode.Hover(content);
  }
}
