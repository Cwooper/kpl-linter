import {
  Token,
  TokenType,
  TokenUtils,
  KEYWORDS,
  OperatorStrings,
} from "./types/tokens";
import { Uri } from "vscode";

export class TokenizerError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
    public position: number,
    public uri: Uri
  ) {
    super(`[${line}:${column}] Error: ${message}`);
    this.name = "TokenizerError";
  }
}

export class Tokenizer {
  private source: string;
  private start = 0; // Start of current lexeme
  private current = 0; // Current position in source
  private line = 1; // Current line
  private column = 1; // Current column
  private startColumn = 1; // Column where current lexeme starts
  private errors: TokenizerError[] = [];

  // 5-token lookahead buffer, matching C++ implementation
  private currentToken: Token | null = null;
  private token2: Token | null = null;
  private token3: Token | null = null;
  private token4: Token | null = null;
  private token5: Token | null = null;

  private uri: Uri; // Source file URI for error reporting

  constructor(source: string, uri: Uri) {
    this.source = source;
    this.uri = uri;
  }

  // Main entry point for tokenization
  tokenize(): Token[] {
    const tokens: Token[] = [];
    // TODO: This is always returning EOF. nextChar() vs scanToken() misuse?
    try {
      // Initialize the lookahead buffer
      this.token5 = this.scanToken();
      this.token4 = this.token5;
      this.nextChar(); // Fills token3
      this.nextChar(); // Fills token2
      this.nextChar(); // Fills currentToken
      this.nextChar(); // Shifts everything

      // Main tokenization loop
      while (!this.isAtEnd()) {
        try {
          this.skipWhitespace();
          if (this.isAtEnd()) break;

          this.start = this.current;
          this.startColumn = this.column;
          this.nextChar();
        } catch (error) {
          if (error instanceof TokenizerError) {
            this.errors.push(error);
            this.sync(); // Skip to next valid token boundary
          } else {
            throw error;
          }
        }
      }

      // Add EOF token
      tokens.push(
        TokenUtils.createToken(
          TokenType.EOF,
          "",
          null,
          this.line,
          this.column,
          this.current
        )
      );

      return tokens;
    } catch (error) {
      // Handle any unexpected errors
      console.error("Unexpected tokenization error:", error);
      throw error;
    }
  }

  // Core scanning function - produces next token
  private scanToken(): Token {
    this.skipWhitespace();

    this.start = this.current;
    this.startColumn = this.column;

    if (this.isAtEnd()) {
      return this.createToken(TokenType.EOF);
    }

    const c = this.nextChar();

    // Handle identifiers and keywords
    if (this.isAlpha(c)) {
      return this.identifier();
    }

    // Handle numbers
    if (this.isDigit(c)) {
      return this.number();
    }

    switch (c) {
      // Single-character tokens
      case "(":
        return this.createToken(TokenType.L_PAREN);
      case ")":
        return this.createToken(TokenType.R_PAREN);
      case "{":
        return this.createToken(TokenType.L_BRACE);
      case "}":
        return this.createToken(TokenType.R_BRACE);
      case "[":
        return this.createToken(TokenType.L_BRACK);
      case "]":
        return this.createToken(TokenType.R_BRACK);
      case ",":
        return this.createToken(TokenType.COMMA);
      case ".":
        return this.createToken(TokenType.PERIOD);
      case ":":
        return this.createToken(TokenType.COLON);
      case ";":
        return this.createToken(TokenType.SEMI_COLON);

      // Potential two-character tokens
      case "=":
        if (this.match("=")) {
          return this.createToken(TokenType.EQUAL_EQUAL);
        }
        return this.createToken(TokenType.EQUAL);

      case "!":
        if (this.match("=")) {
          return this.createToken(TokenType.NOT_EQUAL);
        }
        return this.operator("!");

      case "<":
        if (this.match("=")) {
          return this.createToken(TokenType.LESS_EQUAL);
        } else if (this.match("<")) {
          return this.createToken(TokenType.LESS_LESS);
        }
        return this.createToken(TokenType.LESS);

      case ">":
        if (this.match("=")) {
          return this.createToken(TokenType.GREATER_EQUAL);
        } else if (this.match(">")) {
          if (this.match(">")) {
            return this.createToken(TokenType.GREATER_GREATER_GREATER);
          }
          return this.createToken(TokenType.GREATER_GREATER);
        }
        return this.createToken(TokenType.GREATER);

      // String literals
      case '"':
        return this.string();

      // Character literals
      case "'":
        return this.charLiteral();

      // Handle operators
      case "-":
        if (this.match("-")) {
          this.comment();
          return this.scanToken();
        }
        return this.operator(c);

      case "/":
        if (this.match("*")) {
          this.multilineComment();
          return this.scanToken();
        }
        return this.operator(c);

      case "+":
      case "*":
      case "%":
      case "|":
      case "&":
      case "^":
        return this.operator(c);

      default:
        if (TokenUtils.isOperatorChar(c)) {
          return this.operator(c);
        }

        throw this.error(`Unexpected character: ${c}`);
    }
  }

  // Helper methods for character and token handling

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private nextChar(): string {
    const char = this.source[this.current];
    this.current++;
    this.column++;
    return char;
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

  // Identifiers and keywords
  private identifier(): Token {
    while (this.isAlphaNumeric(this.peek())) this.nextChar();

    const text = this.source.substring(this.start, this.current);
    const type = TokenUtils.getKeywordType(text) || TokenType.ID;

    return this.createToken(type, text);
  }

  // Number literals handling
  private number(): Token {
    // Check for hexadecimal
    if (
      this.start < this.source.length - 1 &&
      this.source[this.start] === "0" &&
      (this.source[this.start + 1] === "x" ||
        this.source[this.start + 1] === "X")
    ) {
      this.nextChar(); // Consume 'x'
      return this.hexNumber();
    }

    // Regular decimal number
    while (this.isDigit(this.peek())) this.nextChar();

    // Look for decimal point
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.nextChar(); // Consume the "."

      while (this.isDigit(this.peek())) this.nextChar();

      // Handle scientific notation
      if (this.peek().toLowerCase() === "e") {
        const next = this.peekNext();
        if (this.isDigit(next) || next === "+" || next === "-") {
          this.nextChar(); // Consume 'e'
          if (next === "+" || next === "-") this.nextChar();
          while (this.isDigit(this.peek())) this.nextChar();
        }
      }

      const literal = parseFloat(
        this.source.substring(this.start, this.current)
      );
      return this.createToken(TokenType.DOUBLE_CONST, undefined, literal);
    }

    const literal = parseInt(this.source.substring(this.start, this.current));
    return this.createToken(TokenType.INT_CONST, undefined, literal);
  }

  // Hexadecimal number handling
  private hexNumber(): Token {
    while (this.isHexDigit(this.peek())) this.nextChar();

    const hexStr = this.source.substring(this.start + 2, this.current);
    const value = parseInt(hexStr, 16);

    return this.createToken(TokenType.INT_CONST, undefined, value);
  }

  // String literal handling
  private string(): Token {
    let string = "";

    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
        this.column = 1;
      } else if (this.peek() === "\\") {
        string += this.processEscapeSequence();
      } else {
        string += this.nextChar();
      }
    }

    if (this.isAtEnd()) {
      throw this.error("Unterminated string");
    }

    this.nextChar(); // Closing quote
    return this.createToken(TokenType.STRING_CONST, undefined, string);
  }

  // Character literal handling
  private charLiteral(): Token {
    let value: string;

    if (this.peek() === "\\") {
      value = this.processEscapeSequence();
    } else if (this.peek() === "'") {
      throw this.error("Empty character literal");
    } else {
      value = this.nextChar();
    }

    if (this.peek() !== "'") {
      throw this.error("Unterminated character literal");
    }

    this.nextChar(); // Closing quote
    return this.createToken(
      TokenType.CHAR_CONST,
      undefined,
      value.charCodeAt(0)
    );
  }

  // Operator token handling
  private operator(firstChar: string): Token {
    let lexeme = firstChar;

    while (!this.isAtEnd() && TokenUtils.isOperatorChar(this.peek())) {
      lexeme += this.nextChar();
    }

    // Find matching operator token type
    for (const [type, str] of Object.entries(OperatorStrings)) {
      if (str === lexeme) {
        return this.createToken(TokenType[type as keyof typeof TokenType]);
      }
    }

    // If no exact match, create generic operator token
    return this.createToken(TokenType.OPERATOR, lexeme);
  }

  // Comment handling
  private comment(): void {
    while (this.peek() !== "\n" && !this.isAtEnd()) {
      this.nextChar();
    }
  }

  private multilineComment(): void {
    let nesting = 1;

    while (nesting > 0 && !this.isAtEnd()) {
      if (this.peek() === "/" && this.peekNext() === "*") {
        this.nextChar();
        this.nextChar();
        nesting++;
      } else if (this.peek() === "*" && this.peekNext() === "/") {
        this.nextChar();
        this.nextChar();
        nesting--;
      } else if (this.peek() === "\n") {
        this.line++;
        this.column = 1;
        this.nextChar();
      } else {
        this.nextChar();
      }
    }

    if (nesting > 0) {
      throw this.error("Unterminated multiline comment");
    }
  }

  // Character classification helpers
  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isHexDigit(c: string): boolean {
    return this.isDigit(c) || (c >= "a" && c <= "f") || (c >= "A" && c <= "F");
  }

  // Escape sequence processing, matching C++ implementation
  private processEscapeSequence(): string {
    this.nextChar(); // Consume the backslash
    const char = this.nextChar();

    switch (char) {
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
      case "x": {
        // Handle hex escape sequence
        const digit1 = this.nextChar();
        const hex1 = this.hexCharToInt(digit1);
        if (hex1 < 0) {
          throw this.error("Invalid hex digit after \\x");
        }

        const digit2 = this.nextChar();
        const hex2 = this.hexCharToInt(digit2);
        if (hex2 < 0) {
          throw this.error("Must have two hex digits after \\x");
        }

        // Combine hex digits into character
        return String.fromCharCode((hex1 << 4) + hex2);
      }
      default:
        throw this.error(`Invalid escape sequence '\\${char}'`);
    }
  }

  // Convert hex character to integer value
  private hexCharToInt(c: string): number {
    if (c >= "0" && c <= "9") return c.charCodeAt(0) - "0".charCodeAt(0);
    if (c >= "a" && c <= "f") return c.charCodeAt(0) - "a".charCodeAt(0) + 10;
    if (c >= "A" && c <= "F") return c.charCodeAt(0) - "A".charCodeAt(0) + 10;
    return -1;
  }

  // Whitespace handling
  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const c = this.peek();
      switch (c) {
        case " ":
        case "\r":
        case "\t":
          this.nextChar();
          break;
        case "\n":
          this.line++;
          this.column = 1;
          this.nextChar();
          break;
        default:
          return;
      }
    }
  }

  // Token creation helper
  private createToken(
    type: TokenType,
    lexeme?: string,
    literal: any = null
  ): Token {
    return TokenUtils.createToken(
      type,
      lexeme ?? this.source.substring(this.start, this.current),
      literal,
      this.line,
      this.startColumn,
      this.start
    );
  }

  // Error handling
  private error(message: string): TokenizerError {
    const error = new TokenizerError(
      message,
      this.line,
      this.startColumn,
      this.start,
      this.uri
    );
    this.errors.push(error);
    return error;
  }

  // Error recovery
  private sync(): void {
    while (!this.isAtEnd()) {
      if (this.peek() === ";" || this.peek() === "\n") {
        this.nextChar();
        return;
      }
      this.nextChar();
    }
  }

  // Access methods
  getErrors(): TokenizerError[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  // Debug helper
  private dumpToken(token: Token): void {
    console.log(
      `Token(type=${token.type}, lexeme="${token.lexeme}", ` +
        `literal=${token.literal}, line=${token.line}, ` +
        `col=${token.column}, pos=${token.position})`
    );
  }

  // Gets current state of the lookahead buffer
  getCurrentTokens(): [
    Token | null,
    Token | null,
    Token | null,
    Token | null,
    Token | null
  ] {
    return [
      this.currentToken,
      this.token2,
      this.token3,
      this.token4,
      this.token5,
    ];
  }
}
