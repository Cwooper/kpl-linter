import { Token, TokenType, TokenUtils, KEYWORDS } from "./types/tokens";

export class TokenizerError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
    public position: number
  ) {
    super(`[${line}:${column}] Error: ${message}`);
    this.name = "TokenizerError";
  }
}

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private current = 0; // Current position in source
  private start = 0; // Start of current lexeme
  private line = 1; // Current line number
  private column = 1; // Current column number
  private errors: TokenizerError[] = [];

  // String table for deduplication
  private stringTable = new Map<string, string>();

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      try {
        this.start = this.current;
        this.scanToken();
      } catch (error) {
        if (error instanceof TokenizerError) {
          this.errors.push(error);
          // Skip to next token boundary for error recovery
          this.synchronize();
        } else {
          throw error;
        }
      }
    }

    this.addToken(TokenType.EOF);
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      // Single character tokens
      case "(":
        this.addToken(TokenType.L_PAREN);
        break;
      case ")":
        this.addToken(TokenType.R_PAREN);
        break;
      case "{":
        this.addToken(TokenType.L_BRACE);
        break;
      case "}":
        this.addToken(TokenType.R_BRACE);
        break;
      case "[":
        this.addToken(TokenType.L_BRACK);
        break;
      case "]":
        this.addToken(TokenType.R_BRACK);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.PERIOD);
        break;
      case ":":
        this.addToken(TokenType.COLON);
        break;
      case ";":
        this.addToken(TokenType.SEMI_COLON);
        break;

      // Two-character operators
      case "=":
        if (this.match("=")) this.addToken(TokenType.EQUAL_EQUAL);
        else this.addToken(TokenType.EQUAL);
        break;

      case "-":
        if (this.match("-")) {
          // Line comment
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
          // Store comment as a token
          const text = this.source.substring(this.start, this.current);
          this.addToken(TokenType.COMMENT, text);
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;

      case "/":
        if (this.match("*")) {
          this.multilineComment();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;

      // Whitespace handling
      case " ":
      case "\r":
      case "\t":
        break;

      case "\n":
        this.line++;
        this.column = 1;
        break;

      // String literals
      case '"':
        this.string();
        break;

      // Char literals
      case "'":
        this.charLiteral();
        break;

      // Numbers and identifiers
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else if (TokenUtils.isOperatorChar(c)) {
          this.operator();
        } else {
          throw this.error(`Unexpected character: ${c}`);
        }
        break;
    }
  }

  private operator(): void {
    while (TokenUtils.isOperatorChar(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    // Look up operator in TokenType mapping
    const type = TokenUtils.getOperatorType(text);

    if (!type) {
      throw this.error(`Invalid operator: ${text}`);
    }

    this.addToken(type);
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    const type = KEYWORDS[text] || TokenType.ID;

    this.addToken(type, text);
  }

  private number(): void {
    // Check for hex number
    if (
      this.start < this.source.length - 1 &&
      this.source[this.start] === "0" &&
      (this.source[this.start + 1] === "x" ||
        this.source[this.start + 1] === "X")
    ) {
      this.advance(); // Consume 'x'
      this.hexNumber();
      return;
    }

    // Parse regular decimal number
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for decimal point
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }

      // Check for exponential notation
      if (this.peek().toLowerCase() === "e") {
        const next = this.peekNext();
        if (this.isDigit(next) || next === "+" || next === "-") {
          this.advance();
          if (next === "+" || next === "-") this.advance();
          while (this.isDigit(this.peek())) this.advance();
        }
      }

      const value = parseFloat(this.source.substring(this.start, this.current));
      this.addToken(TokenType.DOUBLE_CONST, value);
    } else {
      const value = parseInt(this.source.substring(this.start, this.current));
      this.addToken(TokenType.INT_CONST, value);
    }
  }

  private hexNumber(): void {
    while (this.isHexDigit(this.peek())) {
      this.advance();
    }

    const hexStr = this.source.substring(this.start + 2, this.current);
    const value = parseInt(hexStr, 16);
    this.addToken(TokenType.INT_CONST, value);
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      if (this.peek() === "\\") {
        this.advance();
        this.escapeSequence();
      } else {
        this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw this.error("Unterminated string");
    }

    this.advance(); // Closing quote

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING_CONST, this.internString(value));
  }

  private charLiteral(): void {
    let value = "";

    if (this.peek() === "\\") {
      this.advance();
      value = this.escapeSequence();
    } else if (this.peek() === "'") {
      throw this.error("Empty character literal");
    } else {
      value = this.advance();
    }

    if (this.peek() !== "'") {
      throw this.error("Unterminated character literal");
    }

    this.advance(); // Closing quote
    this.addToken(TokenType.CHAR_CONST, value);
  }

  private multilineComment(): void {
    let nesting = 1;
    while (nesting > 0 && !this.isAtEnd()) {
      if (this.peek() === "/" && this.peekNext() === "*") {
        this.advance();
        this.advance();
        nesting++;
      } else if (this.peek() === "*" && this.peekNext() === "/") {
        this.advance();
        this.advance();
        nesting--;
      } else {
        if (this.peek() === "\n") {
          this.line++;
          this.column = 1;
        }
        this.advance();
      }
    }

    if (nesting > 0) {
      throw this.error("Unterminated multiline comment");
    }

    const text = this.source.substring(this.start, this.current);
    this.addToken(TokenType.COMMENT, text);
  }

  private escapeSequence(): string {
    const c = this.advance();
    switch (c) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      case "\\":
        return "\\";
      case "'":
        return "'";
      case '"':
        return '"';
      case "0":
        return "\0";
      default:
        throw this.error(`Invalid escape sequence '\\${c}'`);
    }
  }

  // Helper methods
  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    this.column++;
    return this.source[this.current++];
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current++;
    this.column++;
    return true;
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(
      TokenUtils.createToken(
        type,
        text,
        literal,
        this.line,
        this.column - text.length,
        this.start
      )
    );
  }

  private error(message: string): TokenizerError {
    return new TokenizerError(message, this.line, this.column, this.current);
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private isHexDigit(c: string): boolean {
    return (
      (c >= "0" && c <= "9") || (c >= "a" && c <= "f") || (c >= "A" && c <= "F")
    );
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  // String interning for string literals
  private internString(str: string): string {
    const existing = this.stringTable.get(str);
    if (existing) return existing;
    this.stringTable.set(str, str);
    return str;
  }

  private synchronize(): void {
    while (!this.isAtEnd()) {
      if (this.peek() === ";" || this.peek() === "\n") {
        this.advance();
        return;
      }
      this.advance();
    }
  }

  // Public methods for error handling
  getErrors(): TokenizerError[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}
