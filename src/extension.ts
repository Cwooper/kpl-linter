import * as vscode from "vscode";
import { BlitzFormatter } from "./formatters/blitzFormatter";
import {
  BlitzLanguageService,
  BlitzHoverProvider,
} from "./providers/blitzProvider";
import { BlitzParser } from "./parsers/blitz/parser";

export function activate(context: vscode.ExtensionContext) {
  // Create shared parser instance
  const parser = new BlitzParser();

  // Register the Blitz Assembly formatter
  const blitzFormatter = new BlitzFormatter();
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "blitz-asm",
      blitzFormatter
    )
  );

  // Register hover provider
  const hoverProvider = new BlitzHoverProvider(parser);
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("blitz-asm", hoverProvider)
  );

  // Command for manual formatting
  context.subscriptions.push(
    vscode.commands.registerCommand("kpl-linter.formatBlitzAssembly", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === "blitz-asm") {
        vscode.commands.executeCommand("editor.action.formatDocument");
      }
    })
  );

  // Create and register language service with shared parser
  const languageService = new BlitzLanguageService(parser);
  languageService.subscribeToDocumentChanges(context);
}

export function deactivate() {}
