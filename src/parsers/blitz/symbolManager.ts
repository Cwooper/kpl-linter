// src/parsers/blitz/symbolManager.ts
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

  addSymbol(symbol: Symbol): void {
    if (this.symbols.has(symbol.name)) {
      const existing = this.symbols.get(symbol.name)!;

      // Handle duplicate definitions
      if (existing.definition && symbol.definition) {
        // Error will be caught in validation
        return;
      }

      // Merge references
      existing.references = [...existing.references, ...symbol.references];

      // Update other fields if needed
      if (symbol.definition) existing.definition = symbol.definition;
      if (symbol.value) existing.value = symbol.value;

      this.symbols.set(symbol.name, existing);
    } else {
      this.symbols.set(symbol.name, symbol);
    }
  }

  addReference(name: string, location: SymbolLocation): void {
    const symbol = this.symbols.get(name);
    if (symbol) {
      symbol.references.push(location);
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

  dumpState(): string {
    // TODO remove
    let output = "Symbol Manager State:\n===================\n\n";

    for (const [name, symbol] of this.symbols.entries()) {
      output += `Symbol: ${name}\n`;
      output += `-----------------\n`;
      output += `Type: ${symbol.type}\n`;

      if (symbol.definition) {
        output += `Definition: line ${symbol.definition.line}, column ${symbol.definition.column}\n`;
      } else {
        output += `Definition: undefined\n`;
      }

      if (symbol.value !== undefined) {
        output += `Value: ${symbol.value}\n`;
      }

      output += `References (${symbol.references.length}):\n`;
      symbol.references.forEach((ref, idx) => {
        output += `  ${idx + 1}. line ${ref.line}, column ${ref.column}\n`;
      });

      output += "\n";
    }

    return output;
  }

  reset(): void {
    this.symbols.clear();
  }
}
