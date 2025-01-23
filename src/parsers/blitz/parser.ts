// src/parsers/blitz/parser.ts
import { Token } from "./types/types";
import { SymbolManager } from "./symbolManager";
import { Directives, Instructions } from "./types/definitions";

export class BlitzParser {
  private symbolManager: SymbolManager;

  constructor() {
    this.symbolManager = new SymbolManager();
  }

  parseText(text: string): { tokens: Token[]; diagnostics: any[] } {
    // Reset the symbolManager
    this.symbolManager.reset();

    const lines = text.split("\n");
    let allTokens: Token[] = [];
    const diagnostics: any[] = [];

    // First pass: Tokenize and collect symbols
    lines.forEach((line, lineIndex) => {
      const lineTokens = this.tokenizeLine(line, lineIndex);

      // Add symbols to manager
      this.processLineSymbols(lineTokens, lineIndex);
      allTokens = allTokens.concat(lineTokens);
    });

    console.log(this.symbolManager.dumpState()); // TODO remove

    // Second pass: Validate
    diagnostics.push(...this.symbolManager.validateSymbols());
    diagnostics.push(...this.validateTokens(allTokens));

    return { tokens: allTokens, diagnostics };
  }

  tokenizeLine(line: string, lineNum: number): Token[] {
    const tokens: Token[] = [];
    let position = 0;

    // Skip initial whitespace
    while (position < line.length && /\s/.test(line[position])) {
      position++;
    }

    // Empty line
    if (position >= line.length) {
      return tokens;
    }

    // Handle comment-only lines
    if (line[position] === "!") {
      tokens.push({
        type: "comment",
        value: line.slice(position),
        line: lineNum,
        column: position,
        length: line.length - position,
      });
      return tokens;
    }

    // Process tokens until end of line or comment
    while (position < line.length) {
      // Skip whitespace
      while (position < line.length && /\s/.test(line[position])) {
        position++;
      }
      if (position >= line.length) break;

      // Check for comment
      if (line[position] === "!") {
        tokens.push({
          type: "comment",
          value: line.slice(position),
          line: lineNum,
          column: position,
          length: line.length - position,
        });
        break;
      }

      // Check for label (ends with :)
      const labelMatch = line.slice(position).match(/^([A-Za-z_]\w*):/);
      if (labelMatch) {
        tokens.push({
          type: "label",
          value: labelMatch[1],
          line: lineNum,
          column: position,
          length: labelMatch[0].length - 1, // Don't include : in length
        });
        position += labelMatch[0].length;
        continue;
      }

      // Check for directive (starts with .)
      const directiveMatch = line.slice(position).match(/^\.\w*/);
      if (directiveMatch && Directives[directiveMatch[0].toLowerCase()]) {
        tokens.push({
          type: "directive",
          value: directiveMatch[0],
          line: lineNum,
          column: position,
          length: directiveMatch[0].length,
        });
        position += directiveMatch[0].length;
        continue;
      }

      // Check for instruction
      const instrMatch = line.slice(position).match(/^[a-z]\w*/);
      if (instrMatch && Instructions[instrMatch[0].toLowerCase()]) {
        tokens.push({
          type: "instruction",
          value: instrMatch[0].toLowerCase(),
          line: lineNum,
          column: position,
          length: instrMatch[0].length,
        });
        position += instrMatch[0].length;
        continue;
      }

      // Check for register
      const regMatch = line
        .slice(position)
        .match(/^(r1[0-5]|r[0-9]|f1[0-5]|f[0-9]|pc|sr)\b/i);
      if (regMatch) {
        tokens.push({
          type: "register",
          value: regMatch[0].toLowerCase(),
          line: lineNum,
          column: position,
          length: regMatch[0].length,
        });
        position += regMatch[0].length;
        continue;
      }

      // Check for number (hex, decimal)
      const numMatch = line.slice(position).match(/^(0x[0-9A-Fa-f]+|\d+)\b/);
      if (numMatch) {
        tokens.push({
          type: "number",
          value: numMatch[0],
          line: lineNum,
          column: position,
          length: numMatch[0].length,
        });
        position += numMatch[0].length;
        continue;
      }

      // Check for string
      if (line[position] === '"') {
        let endQuote = position + 1;
        let escaped = false;
        while (endQuote < line.length) {
          if (line[endQuote] === "\\") {
            escaped = !escaped;
          } else if (line[endQuote] === '"' && !escaped) {
            break;
          } else {
            escaped = false;
          }
          endQuote++;
        }
        if (endQuote < line.length) {
          tokens.push({
            type: "string",
            value: line.slice(position, endQuote + 1),
            line: lineNum,
            column: position,
            length: endQuote - position + 1,
          });
          position = endQuote + 1;
          continue;
        }
      }

      // Check for operators
      const opMatch = line.slice(position).match(/^([-+*/&|^~<>]|<<|>>|>>>|=)/);
      if (opMatch) {
        tokens.push({
          type: "operator",
          value: opMatch[0],
          line: lineNum,
          column: position,
          length: opMatch[0].length,
        });
        position += opMatch[0].length;
        continue;
      }

      // Check for memory access [reg+offset] or [reg]
      const memMatch = line
        .slice(position)
        .match(/^\[(r[0-9]+|pc|sr)(\s*[-+]\s*(r[0-9]+|\d+))?\]/i);
      if (memMatch) {
        tokens.push({
          type: "memory",
          value: memMatch[0],
          line: lineNum,
          column: position,
          length: memMatch[0].length,
        });
        position += memMatch[0].length;
        continue;
      }

      // Identifier (for labels, constants)
      const idMatch = line.slice(position).match(/^[A-Za-z_]\w*/);
      if (idMatch) {
        tokens.push({
          type: "identifier",
          value: idMatch[0],
          line: lineNum,
          column: position,
          length: idMatch[0].length,
        });
        position += idMatch[0].length;
        continue;
      }

      // Skip unrecognized character
      position++;
    }

    return tokens;
  }

  private processLineSymbols(tokens: Token[], lineNum: number): void {
    // Look for labels, imports, exports, and constants
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === "label") {
        this.symbolManager.addSymbol({
          name: token.value,
          type: "label",
          definition: { line: lineNum, column: token.column },
          references: [],
        });
      } else if (token.type === "directive") {
        if (token.value === ".import" && i + 1 < tokens.length) {
          const symbolToken = tokens[i + 1];
          this.symbolManager.addSymbol({
            name: symbolToken.value,
            type: "import",
            references: [],
          });
        } else if (token.value === ".export" && i + 1 < tokens.length) {
          const symbolToken = tokens[i + 1];
          this.symbolManager.addSymbol({
            name: symbolToken.value,
            type: "export",
            references: [],
          });
        }
      } else if (token.type === "identifier") {
        // Add reference if this identifier matches a known symbol
        this.symbolManager.addReference(token.value, {
          line: lineNum,
          column: token.column,
        });
      }
    }
  }

  private validateTokens(tokens: Token[]): any[] {
    // Basic validation rules
    const diagnostics: any[] = [];

    // Add validation logic here
    // Examples:
    // - Instructions have valid operands
    // - Memory access is properly formatted
    // - Labels are in valid segments
    // - Directives have correct arguments

    return diagnostics;
  }

  getSymbol(name: string) {
    return this.symbolManager.getSymbol(name);
  }
}
