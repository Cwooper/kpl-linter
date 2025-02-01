// kpl manager
// Manages interactions with vscode (hover, validate, diagnostics, etc.)
//
// holds the: workspaceRoot
//            parser
//            symbolTable
//            validator
//            fileCache (opt)

import { Token } from "./types/tokens";
import { Program } from "./types/ast";
import {
  Uri,
  Diagnostic,
  DiagnosticSeverity,
  workspace,
  Range,
  languages,
} from "vscode";
import { Tokenizer, TokenizerError } from "./tokenizer";

export class KPLManager {
  private workspaceRoot: string;
  private fileCache: Map<
    string,
    {
      content: string;
      version: number;
      tokens?: Token[];
      ast?: Program;
      diagnostics?: Diagnostic[];
    }
  >;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.fileCache = new Map();
  }

  // Process a single file
  async processFile(uri: Uri): Promise<void> {
    const content = await workspace.fs.readFile(uri);
    const textContent = new TextDecoder().decode(content);

    // Cache the content
    this.fileCache.set(uri.fsPath, {
      content: textContent,
      version: Date.now(),
    });

    // Start tokenization
    try {
      const tokenizer = new Tokenizer(textContent);
      const tokens = tokenizer.tokenize();

      console.log(uri.fsPath)
      console.log(tokens)

      // Update cache with tokens
      const fileData = this.fileCache.get(uri.fsPath);
      if (fileData) {
        fileData.tokens = tokens;
      }

      // Report any tokenizer errors as diagnostics
      if (tokenizer.hasErrors()) {
        this.reportTokenizerErrors(uri, tokenizer.getErrors());
      }
    } catch (error) {
      console.error(`Error processing file ${uri.fsPath}:`, error);
    }
  }

  // Report tokenizer errors as VS Code diagnostics
  private reportTokenizerErrors(uri: Uri, errors: TokenizerError[]): void {
    const diagnostics: Diagnostic[] = errors.map((error) => ({
      range: new Range(
        error.line - 1,
        error.column - 1,
        error.line - 1,
        error.column
      ),
      message: error.message,
      severity: DiagnosticSeverity.Error,
    }));

    const fileData = this.fileCache.get(uri.fsPath);
    if (fileData) {
      fileData.diagnostics = diagnostics;
    }

    // Use the correct VS Code API for publishing diagnostics
    const collection = languages.createDiagnosticCollection("kpl");
    collection.set(uri, diagnostics);
  }
}

