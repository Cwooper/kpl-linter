import { Token } from "./types/tokens";
import { Program } from "./types/ast";
import {
  Uri,
  Diagnostic,
  DiagnosticSeverity,
  workspace,
  Range,
  languages,
  DiagnosticCollection,
} from "vscode";
import { Tokenizer, TokenizerError } from "./tokenizer";
import { KPLParser, ParseError } from "./parser";

interface FileCache {
  content: string;
  version: number;
  tokens?: Token[];
  ast?: Program;
  diagnostics?: Diagnostic[];
}

export class KPLManager {
  private workspaceRoot: string;
  private fileCache: Map<string, FileCache>;
  private diagnosticCollection: DiagnosticCollection;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.fileCache = new Map();
    this.diagnosticCollection = languages.createDiagnosticCollection("kpl");
  }

  async processFile(uri: Uri): Promise<void> {
    const content = await workspace.fs.readFile(uri);
    const textContent = new TextDecoder().decode(content);

    // Initialize or update cache
    const cacheEntry: FileCache = {
      content: textContent,
      version: Date.now(),
    };

    try {
      // Start tokenization
      const tokenizer = new Tokenizer(textContent);
      const tokens = tokenizer.tokenize();
      cacheEntry.tokens = tokens;

      // If tokenization succeeded, attempt parsing
      if (!tokenizer.hasErrors()) {
        try {
          // Pass the tokens directly to parser instead of re-tokenizing
          const parser = new KPLParser(tokens);
          const ast = parser.parse();
          cacheEntry.ast = ast;

          // Clear any existing diagnostics if parsing succeeded
          this.diagnosticCollection.set(uri, []);
        } catch (error) {
          if (error instanceof ParseError) {
            this.reportParseError(uri, error);
          } else {
            console.error(
              `Unexpected error parsing file ${uri.fsPath}:`,
              error
            );
          }
        }
      } else {
        // Report tokenizer errors
        this.reportTokenizerErrors(uri, tokenizer.getErrors());
      }
    } catch (error) {
      console.error(`Error processing file ${uri.fsPath}:`, error);
    } finally {
      // Always update the cache, even if there were errors
      this.fileCache.set(uri.fsPath, cacheEntry);
    }
  }

  // Get the AST for a file if it exists
  getAST(uri: Uri): Program | undefined {
    return this.fileCache.get(uri.fsPath)?.ast;
  }

  // Report tokenizer errors as VS Code diagnostics
  private reportTokenizerErrors(uri: Uri, errors: TokenizerError[]): void {
    const diagnostics: Diagnostic[] = errors.map((error) => ({
      range: new Range(
        error.line - 1, // VSCode lines are 0-based
        error.column - 1, // Keep column as-is
        error.line - 1, // Same end line
        error.column // End one character after start
      ),
      message: error.message,
      severity: DiagnosticSeverity.Error,
      source: "KPL Tokenizer",
    }));

    this.updateDiagnostics(uri, diagnostics);
  }

  // Report parser errors as VS Code diagnostics
  private reportParseError(uri: Uri, error: ParseError): void {
    const diagnostic: Diagnostic = {
      range: new Range(
        error.token.line - 1, // VSCode lines are 0-based
        error.token.column - 1, // Keep column as-is
        error.token.line - 1, // Same end line
        error.token.column + error.token.lexeme.length - 1 // End after token
      ),
      message: error.message,
      severity: DiagnosticSeverity.Error,
      source: "KPL Parser",
    };

    this.updateDiagnostics(uri, [diagnostic]);
  }

  // Update diagnostics in VS Code
  private updateDiagnostics(uri: Uri, diagnostics: Diagnostic[]): void {
    // Update cache
    const fileData = this.fileCache.get(uri.fsPath);
    if (fileData) {
      fileData.diagnostics = diagnostics;
    }

    // Update VS Code diagnostics
    this.diagnosticCollection.set(uri, diagnostics);
  }

  // Dispose of resources
  dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
