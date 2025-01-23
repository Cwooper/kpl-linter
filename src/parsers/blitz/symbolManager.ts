// src/parsers/blitz/symbolManager.ts
import { BlitzDiagnostic } from "./types/types";

export interface SymbolLocation {
  line: number;
  column: number;
}

export interface Symbol {
  name: string;
  type: "label" | "import" | "export" | "constant";
  definition?: SymbolLocation;
  references: SymbolLocation[];
  value?: number | string;
}

export class SymbolManager {
  private symbols = new Map<string, Symbol>();
  private pendingReferences = new Map<string, SymbolLocation[]>();

  addSymbol(symbol: Symbol): void {
    if (this.symbols.has(symbol.name)) {
      const existing = this.symbols.get(symbol.name)!;

      // Handle duplicate definitions
      if (existing.definition && symbol.definition) {
        return;
      }

      // Merge references
      existing.references = [...existing.references, ...symbol.references];

      // Update other fields if needed
      if (symbol.definition) existing.definition = symbol.definition;
      if (symbol.value) existing.value = symbol.value;

      this.symbols.set(symbol.name, existing);
    } else {
      // Add any pending references to the new symbol
      const pending = this.pendingReferences.get(symbol.name);
      if (pending) {
        symbol.references = [...symbol.references, ...pending];
        this.pendingReferences.delete(symbol.name);
      }

      this.symbols.set(symbol.name, symbol);
    }
  }

  addReference(name: string, location: SymbolLocation): void {
    const symbol = this.symbols.get(name);
    if (symbol) {
      symbol.references.push(location);
    } else {
      // Store reference for future symbol definition
      let pending = this.pendingReferences.get(name);
      if (!pending) {
        pending = [];
        this.pendingReferences.set(name, pending);
      }
      pending.push(location);
    }
  }

  getSymbol(name: string): Symbol | undefined {
    return this.symbols.get(name);
  }

  getAllSymbols(): Symbol[] {
    return Array.from(this.symbols.values());
  }

  validateSymbols(): any[] {
    const diagnostics: any[] = [];

    for (const symbol of this.symbols.values()) {
      // Check for undefined symbols being used
      if (
        symbol.type !== "import" &&
        !symbol.definition &&
        symbol.references.length > 0
      ) {
        diagnostics.push({
          severity: "error",
          message: `Symbol '${symbol.name}' is used but never defined`,
          line: symbol.references[0].line,
          column: symbol.references[0].column,
          length: symbol.name.length,
        });
      }

      // Check for duplicate definitions
      if (
        symbol.type === "label" &&
        this.symbols.get(symbol.name)?.definition
      ) {
        // Look through all symbols to find the other definition
        const otherSymbols = Array.from(this.symbols.values()).filter(
          (s) =>
            s.name === symbol.name &&
            s.definition &&
            (s.definition.line !== symbol.definition!.line ||
              s.definition.column !== symbol.definition!.column)
        );

        if (otherSymbols.length > 0) {
          const firstDef = otherSymbols[0].definition!;
          diagnostics.push({
            severity: "error",
            message: `Label '${symbol.name}' is already defined at line ${
              firstDef.line + 1
            }, column ${firstDef.column + 1}`,
            line: symbol.definition!.line,
            column: symbol.definition!.column,
            length: symbol.name.length,
          });
        }
      }

      // Check for imported symbols also being defined
      if (symbol.type === "import" && symbol.definition) {
        diagnostics.push({
          severity: "error",
          message: `Imported symbol '${symbol.name}' cannot be defined locally`,
          line: symbol.definition.line,
          column: symbol.definition.column,
          length: symbol.name.length,
        });
      }

      // Check for exported symbols that aren't defined
      if (symbol.type === "export" && !symbol.definition) {
        // Find the export directive location from references
        const exportRef = symbol.references[0];
        if (exportRef) {
          diagnostics.push({
            severity: "error",
            message: `Exported symbol '${symbol.name}' is not defined`,
            line: exportRef.line,
            column: exportRef.column,
            length: symbol.name.length,
          });
        }
      }
    }

    return diagnostics;
  }

  validatePendingReferences(): BlitzDiagnostic[] {
    const diagnostics: BlitzDiagnostic[] = [];

    for (const [name, locations] of this.pendingReferences.entries()) {
      if (!this.symbols.has(name)) {
        // Only report first occurrence of undefined symbol
        diagnostics.push({
          severity: "error",
          message: `Symbol '${name}' is used but never defined`,
          line: locations[0].line,
          column: locations[0].column,
          length: name.length,
        });
      }
    }

    return diagnostics;
  }

  reset(): void {
    this.symbols.clear();
    this.pendingReferences.clear();
  }
}
