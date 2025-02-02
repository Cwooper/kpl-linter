// kpl tokenizer
import { Token, TokenType, TokenUtils } from "./types/tokens";

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

export class Tokenizer {
  private source: string;
  private tokens: Token[] = [];
  private start = 0; // Start of the current lexeme
  private current = 0; // Current position in source
  private line = 1; // Current line number
  private column = 1; // Current column number
  private startColumn = 0; // Column where current token starts
  private errors: TokenizerError[] = [];

  constructor(source: string) {
    this.source = source;
  }

  // Main entry point
  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      try {
        this.skipWhitespace(); // skip whitespace before setting start
        if (this.isAtEnd()) break; // stop at EOF

        this.start = this.current;
        this.startColumn = this.column; // Save starting column
        this.scanToken();
      } catch (error) {
        if (error instanceof TokenizerError) {
          this.errors.push(error);
          this.sync(); // Skip to next valid token boundary
        } else {
          throw error;
        }
      }
    }

    this.tokens.push(
      TokenUtils.createToken(
        TokenType.EOF,
        "",
        null,
        this.line,
        this.column,
        this.current
      )
    );

    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      // Single-character tokens
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case "[":
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case "]":
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case ":":
        this.addToken(TokenType.COLON);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "%":
        this.addToken(TokenType.PERCENT);
        break;
      case "^":
        this.addToken(TokenType.XOR);
        break;

      // Two-character tokens
      case "=":
        if (this.match("=")) this.addToken(TokenType.EQUAL_EQUAL);
        else this.addToken(TokenType.EQUAL);
        break;

      case "!":
        if (this.match("=")) this.addToken(TokenType.BANG_EQUAL);
        else this.addToken(TokenType.BANG);
        break;

      case "<":
        if (this.match("=")) this.addToken(TokenType.LESS_EQUAL);
        else if (this.match("<")) this.addToken(TokenType.SHIFT_LEFT);
        else this.addToken(TokenType.LESS);
        break;

      case ">":
        if (this.match("=")) this.addToken(TokenType.GREATER_EQUAL);
        else if (this.match(">")) {
          if (this.match(">")) this.addToken(TokenType.SHIFT_RIGHT_UNSIGNED);
          else this.addToken(TokenType.SHIFT_RIGHT);
        } else this.addToken(TokenType.GREATER);
        break;

      case "&":
        if (this.match("&")) this.addToken(TokenType.LOGICAL_AND);
        else this.addToken(TokenType.AND);
        break;

      case "|":
        if (this.match("|")) this.addToken(TokenType.LOGICAL_OR);
        else this.addToken(TokenType.OR);
        break;

      case "-":
        if (this.match("-")) {
          const start = this.current - 2; // Account for the "--"
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            // consume in-line comment
            this.advance();
          }
          const text = this.source.substring(start, this.current);
          this.addToken(TokenType.COMMENT, text);
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;

      case "/":
        if (this.match("*")) {
          // Multiline comment - now create a token instead of skipping
          const start = this.current - 2; // Account for the "/*"
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
            } else if (this.peek() === "\n") {
              this.handleNewline();
              this.advance();
            } else {
              this.advance();
            }
          }

          if (nesting > 0) {
            throw this.error("Unterminated multiline comment");
          }

          const text = this.source.substring(start, this.current);
          this.addToken(TokenType.COMMENT, text);
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;

      case "'":
        this.charLiteral();
        break;
      case '"':
        this.stringLiteral();
        break;

      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace
        break;

      case "\n":
        this.handleNewline();
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier(); // this must be a token
        } else {
          throw this.error(`Unexpected character: ${c}`);
        }
        break;
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    const type = TokenUtils.getKeywordType(text) || TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private number(): void {
    // Check for hexadecimal
    if (
      this.current < this.source.length - 1 && // Ensure there are at least two characters left
      this.source[this.start] === "0" &&
      (this.source[this.start + 1] === "x" ||
        this.source[this.start + 1] === "X")
    ) {
      this.advance(); // Consume '0'
      this.advance(); // Consume 'x' or 'X'
      this.hexNumber(); // Parse the hexadecimal number
      return;
    }

    // Decimal number
    while (this.isDigit(this.peek())) this.advance();

    // Look for decimal point
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance(); // Consume the "."

      while (this.isDigit(this.peek())) this.advance();

      // Look for exponent
      if (this.peek().toLowerCase() === "e") {
        const next = this.peekNext();
        if (this.isDigit(next) || next === "+" || next === "-") {
          this.advance(); // Consume 'e'
          if (next === "+" || next === "-") this.advance();
          while (this.isDigit(this.peek())) this.advance();
        }
      }

      const value = parseFloat(this.source.substring(this.start, this.current));
      this.addToken(TokenType.DOUBLE_LITERAL, value);
    } else {
      const value = parseInt(this.source.substring(this.start, this.current));
      this.addToken(TokenType.INTEGER_LITERAL, value);
    }
  }

  private hexNumber(): void {
    // Parse hexadecimal digits
    while (this.isHexDigit(this.peek())) this.advance();

    // Extract the hexadecimal string (excluding '0x' or '0X')
    const hexStr = this.source.substring(this.start + 2, this.current);

    // Convert the hexadecimal string to a number
    const value = parseInt(hexStr, 16);

    // Add the hexadecimal token
    this.addToken(TokenType.HEX_LITERAL, value);
  }

  private isHexDigit(c: string): boolean {
    return (
      (c >= "0" && c <= "9") || (c >= "a" && c <= "f") || (c >= "A" && c <= "F")
    );
  }

  private charLiteral(): void {
    let value: string;

    if (this.peek() === "\\") {
      value = this.processEscapeSequence();
    } else if (this.peek() === "'") {
      throw this.error("Empty character literal");
    } else {
      value = this.advance();
    }

    if (this.peek() !== "'") {
      throw this.error("Unterminated character literal");
    }

    this.advance(); // Consume closing quote
    this.addToken(TokenType.CHAR_LITERAL, value);
  }

  private stringLiteral(): void {
    let string = "";

    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.handleNewline();
      }

      if (this.peek() === "\\") {
        string += this.processEscapeSequence();
      } else {
        string += this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw this.error("Unterminated string");
    }

    this.advance(); // Consume closing quote
    this.addToken(TokenType.STRING_LITERAL, string);
  }

  // Helper method to check if we've reached the end of input
  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  // Advances current pointer and returns the character
  private advance(): string {
    const char = this.source[this.current];
    this.current++;
    this.column++;
    return char;
  }

  // Looks at current character without consuming it
  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }

  // Looks at next character without consuming it
  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  // Matches current character with expected, advances if match
  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current++;
    this.column++;
    return true;
  }

  // Checks if a character is a digit
  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  // Checks if a character is a letter or underscore
  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  // Checks if a character is alphanumeric or underscore
  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  // Handles newline characters and updates line/column counts
  private handleNewline(): void {
    this.line++;
    this.column = 0;
  }

  // Adds a token to the token list
  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(
      TokenUtils.createToken(
        type,
        text,
        literal,
        this.line,
        this.startColumn,
        this.start
      )
    );
  }

  // Reports an error at the current position
  private error(message: string): TokenizerError {
    const error = new TokenizerError(
      message,
      this.line,
      this.startColumn,
      this.current
    );
    this.errors.push(error);
    return error;
  }

  // Skips whitespace and comments
  private skipWhitespace(): void {
    while (true) {
      const char = this.peek();
      switch (char) {
        case " ":
        case "\r":
        case "\t":
          this.advance();
          break;
        case "\n":
          this.handleNewline();
          this.advance();
          break;
        default:
          return;
      }
    }
  }

  // Processes escape sequences in strings and characters
  private processEscapeSequence(): string {
    this.advance(); // Consume the backslash
    const char = this.advance();
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
      default:
        throw this.error(`Invalid escape sequence '\\${char}'`);
    }
  }

  // Syncs the tokenizer state after an error
  private sync(): void {
    while (!this.isAtEnd()) {
      // Skip to the next token boundary
      if (this.peek() === ";" || this.peek() === "\n") {
        this.advance();
        return;
      }
      this.advance();
    }
  }

  // Gets all accumulated errors
  getErrors(): TokenizerError[] {
    return this.errors;
  }

  // Checks if any errors occurred during tokenization
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  // Resets the tokenizer state
  reset(): void {
    this.start = 0;
    this.current = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
  }
}
