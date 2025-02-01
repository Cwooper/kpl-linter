// src/extension.ts
import * as vscode from "vscode";
import { BlitzFormatter } from "./formatters/blitzFormatter";
import {
  BlitzLanguageService,
  BlitzHoverProvider,
} from "./providers/blitzProvider";
import { BlitzParser } from "./parsers/blitz/parser";
import { WorkspaceManager } from "./workspace/workspaceManager";
import { KPLCompletionProvider } from "./providers/kplCompletionProvider";

export function activate(context: vscode.ExtensionContext) {
  // Initialize workspace manager
  const workspaceManager = WorkspaceManager.getInstance();

  // Register KPL completion provider
  const kplCompletionProvider = new KPLCompletionProvider();
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "kpl",
      kplCompletionProvider
    )
  );

  // Watch for KPL file changes
  const fileWatcher = workspaceManager.watchKPLFiles(async (uri) => {
    // TODO Handle file changes here
    // You can trigger parsing, validation, etc.
    console.log(`KPL file changed: ${uri.fsPath}`);
  });
  context.subscriptions.push(fileWatcher);

  // Initialize KPL file parsing
  workspaceManager.findKPLFiles().then((files) => {
    files.forEach(async (file) => {
      const content = await workspaceManager.getFileContent(file);
      // TODO initialize parsing of the files
      console.log(`Found KPL file: ${file.fsPath}`);
    });
  });

  // Existing Blitz-related registrations
  const parser = new BlitzParser();
  const blitzFormatter = new BlitzFormatter();
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "blitz-asm",
      blitzFormatter
    )
  );

  const hoverProvider = new BlitzHoverProvider(parser);
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("blitz-asm", hoverProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("kpl-linter.formatBlitzAssembly", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === "blitz-asm") {
        vscode.commands.executeCommand("editor.action.formatDocument");
      }
    })
  );

  const languageService = new BlitzLanguageService(parser);
  languageService.subscribeToDocumentChanges(context);
}

export function deactivate() {}
