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
import { KPLManager } from "./parsers/kpl/manager";

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

  if (vscode.workspace.workspaceFolders?.length) {
    const manager = new KPLManager(
      vscode.workspace.workspaceFolders[0].uri.fsPath
    );

    // Add to disposables
    context.subscriptions.push(manager);

    // Watch for KPL file changes
    const fileWatcher = vscode.workspace.createFileSystemWatcher("**/*.{k,h}");
    fileWatcher.onDidChange(async (uri) => {
      await manager.processFile(uri);
    });
    fileWatcher.onDidCreate(async (uri) => {
      await manager.processFile(uri);
    });

    // Initial processing of files
    vscode.workspace.findFiles("**/*.{k,h}").then((files) => {
      files.forEach(async (file) => {
        await manager.processFile(file);
      });
    });
  }

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
