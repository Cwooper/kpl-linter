// src/parsers/blitz/parser.ts
import { Token, TokenContext } from "./types/types";
import { SymbolManager } from "./symbolManager";
import { Directives, Instructions } from "./types/definitions";

export class BlitzParser {
  private symbolManager: SymbolManager;
  private tokenContext: TokenContext = {};
  private CONTROL_FLOW_INSTRUCTIONS = new Set([
    "jmp",
    "call",
    "be",
    "bne",
    "bl",
    "ble",
    "bg",
    "bge",
    "bvs",
    "bvc",
    "bns",
    "bnc",
    "bss",
    "bsc",
    "bis",
    "bic",
    "bps",
    "bpc",
  ]);

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

    // Second pass: Validate
    diagnostics.push(...this.symbolManager.validateSymbols());
    diagnostics.push(...this.validateTokens(allTokens));

    return { tokens: allTokens, diagnostics };
  }

  tokenizeLine(line: string, lineNum: number): Token[] {
    const tokens: Token[] = [];
    let position = 0;
    this.tokenContext = {}; // Reset context for each line

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

    // Check for constant definition first
    const constantMatch = line
      .slice(position)
      .match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)/);
    if (constantMatch) {
      const constantName = constantMatch[1];
      const constantValue = constantMatch[2].trim(); // Just store the raw value string
      const valueStart = line.indexOf(constantMatch[2]);
      const valueTokens = this.tokenizeExpression(
        constantMatch[2],
        lineNum,
        valueStart
      );

      // Add constant token
      tokens.push({
        type: "constant",
        value: constantName,
        line: lineNum,
        column: position,
        length: constantName.length,
      });

      // Add equals token
      const equalPos = line.indexOf("=", position);
      tokens.push({
        type: "operator",
        value: "=",
        line: lineNum,
        column: equalPos,
        length: 1,
      });

      // Add value tokens
      tokens.push(...valueTokens);

      // Add the constant to symbol manager with its string value
      this.symbolManager.addSymbol({
        name: constantName,
        type: "constant",
        definition: { line: lineNum, column: position },
        references: [],
        value: constantValue,
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

      // Check for label definition (ends with :)
      const labelMatch = line.slice(position).match(/^([A-Za-z_]\w*):/);
      if (labelMatch) {
        tokens.push({
          type: "label",
          value: labelMatch[1],
          line: lineNum,
          column: position,
          length: labelMatch[0].length - 1,
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

      // Check for memory access [reg+offset] or [reg] BEFORE registers
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
        this.tokenContext.expectingLabel = false;
        continue;
      }

      // Check for register BEFORE instruction (since instructions are lowercase)
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
        this.tokenContext.expectingLabel = false;
        continue;
      }

      // Check for string literals
      const stringMatch = line
        .slice(position)
        .match(/^(['"])(?:\\.|[^\x01])*?\1/);
      if (stringMatch) {
        tokens.push({
          type: "string",
          value: stringMatch[0],
          line: lineNum,
          column: position,
          length: stringMatch[0].length,
        });
        position += stringMatch[0].length;
        this.tokenContext.expectingLabel = false;
        continue;
      }

      // Check for instruction
      const instrMatch = line.slice(position).match(/^[a-z]\w*/);
      if (instrMatch && Instructions[instrMatch[0].toLowerCase()]) {
        const instr = instrMatch[0].toLowerCase();
        this.tokenContext.currentInstruction = instr;
        this.tokenContext.expectingLabel =
          this.CONTROL_FLOW_INSTRUCTIONS.has(instr);

        tokens.push({
          type: "instruction",
          value: instr,
          line: lineNum,
          column: position,
          length: instrMatch[0].length,
        });
        position += instrMatch[0].length;
        continue;
      }

      // Check for number (hex, decimal) BEFORE identifier
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
        this.tokenContext.expectingLabel = false;
        continue;
      }

      // Finally check for identifier or label reference
      const idMatch = line.slice(position).match(/^[A-Za-z_]\w*/);
      if (idMatch) {
        const value = idMatch[0];
        const type = this.tokenContext.expectingLabel ? "label" : "identifier";

        tokens.push({
          type: type,
          value: value,
          line: lineNum,
          column: position,
          length: idMatch[0].length,
        });

        // Always add a reference for both identifiers and labels
        this.symbolManager.addReference(value, {
          line: lineNum,
          column: position,
        });

        position += idMatch[0].length;
        this.tokenContext.expectingLabel = false;
        continue;
      }

      // Handle operators
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

      // Skip unrecognized character
      position++;
    }

    return tokens;
  }

  private tokenizeExpression(
    expr: string,
    lineNum: number,
    startColumn: number
  ): Token[] {
    const tokens: Token[] = [];
    let position = 0;

    while (position < expr.length) {
      // Skip whitespace
      while (position < expr.length && /\s/.test(expr[position])) {
        position++;
      }
      if (position >= expr.length) break;

      // Match hex numbers
      const hexMatch = expr.slice(position).match(/^0x[0-9A-Fa-f]+/);
      if (hexMatch) {
        tokens.push({
          type: "number",
          value: hexMatch[0],
          line: lineNum,
          column: startColumn + position,
          length: hexMatch[0].length,
        });
        position += hexMatch[0].length;
        continue;
      }

      // Match decimal numbers
      const decMatch = expr.slice(position).match(/^\d+/);
      if (decMatch) {
        tokens.push({
          type: "number",
          value: decMatch[0],
          line: lineNum,
          column: startColumn + position,
          length: decMatch[0].length,
        });
        position += decMatch[0].length;
        continue;
      }

      // Match operators
      const opMatch = expr.slice(position).match(/^[-+*/<>|&^~]+/);
      if (opMatch) {
        tokens.push({
          type: "operator",
          value: opMatch[0],
          line: lineNum,
          column: startColumn + position,
          length: opMatch[0].length,
        });
        position += opMatch[0].length;
        continue;
      }

      // Skip unrecognized character
      position++;
    }

    return tokens;
  }

  private processLineSymbols(tokens: Token[], lineNum: number): void {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === "label") {
        if (tokens[i - 1]?.type === "instruction") {
          // This is a label reference
          this.symbolManager.addReference(token.value, {
            line: lineNum,
            column: token.column,
          });
        } else {
          // This is a label definition
          this.symbolManager.addSymbol({
            name: token.value,
            type: "label",
            definition: { line: lineNum, column: token.column },
            references: [],
          });
        }
      } else if (token.type === "constant") {
        this.symbolManager.addSymbol({
          name: token.value,
          type: "constant",
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
    const diagnostics: any[] = [];

    // Check each token
    tokens.forEach((token) => {
      // For label references, check if they have a definition
      if (token.type === "label" || token.type === "identifier") {
        const symbol = this.symbolManager.getSymbol(token.value);
        if (!symbol) {
          // Unknown symbol
          diagnostics.push({
            severity: "error",
            message: `Undefined symbol: '${token.value}'`,
            line: token.line,
            column: token.column,
            length: token.length,
          });
        } else if (
          symbol.type === "label" &&
          !symbol.definition &&
          token.type === "label"
        ) {
          // Label reference without definition
          diagnostics.push({
            severity: "error",
            message: `Reference to undefined label: '${token.value}'`,
            line: token.line,
            column: token.column,
            length: token.length,
          });
        }
      }
    });

    return diagnostics;
  }

  getSymbol(name: string) {
    return this.symbolManager.getSymbol(name);
  }
}
