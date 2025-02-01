// src/workspace/workspaceManager.ts
import * as vscode from "vscode";

export class WorkspaceManager {
  private static instance: WorkspaceManager;
  private constructor() {}

  static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }

  /**
   * Find all KPL files in the workspace
   * @returns Promise<vscode.Uri[]> Array of file URIs
   */
  async findKPLFiles(): Promise<vscode.Uri[]> {
    const files: vscode.Uri[] = [];

    // Get all workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return files;
    }

    // Search for .k and .h files in all workspace folders
    for (const folder of workspaceFolders) {
      const kplFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, "**/*.{k,h}"),
        "**/node_modules/**"
      );
      files.push(...kplFiles);
    }

    return files;
  }

  /**
   * Watch for KPL file changes in the workspace
   * @param callback Function to call when files change
   * @returns vscode.Disposable
   */
  watchKPLFiles(callback: (uri: vscode.Uri) => void): vscode.Disposable {
    const watcher = vscode.workspace.createFileSystemWatcher(
      "**/*.{k,h}",
      false, // Don't ignore creates
      false, // Don't ignore changes
      false // Don't ignore deletes
    );

    watcher.onDidCreate(callback);
    watcher.onDidChange(callback);
    watcher.onDidDelete(callback);

    return watcher;
  }

  /**
   * Get the content of a KPL file
   * @param uri URI of the file to read
   * @returns Promise<string> Content of the file
   */
  async getFileContent(uri: vscode.Uri): Promise<string> {
    const document = await vscode.workspace.openTextDocument(uri);
    return document.getText();
  }
}
