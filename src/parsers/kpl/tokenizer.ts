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
  private errors: TokenizerError[] = [];

  constructor(source: string) {
    this.source = source;
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
  private isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  // Checks if a character is alphanumeric or underscore
  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  // Checks if a character is whitespace
  private isWhitespace(char: string): boolean {
    return char === " " || char === "\t" || char === "\r";
  }

  // Handles newline characters and updates line/column counts
  private handleNewline(): void {
    this.line++;
    this.column = 1;
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
        this.column - text.length,
        this.start
      )
    );
  }

  // Reports an error at the current position
  private error(message: string): TokenizerError {
    const error = new TokenizerError(
      message,
      this.line,
      this.column,
      this.current
    );
    this.errors.push(error);
    return error;
  }

  // Consumes characters until finding the delimiter
  private consumeUntil(delimiter: string, errorMessage: string): string {
    const start = this.current;
    while (!this.isAtEnd() && this.peek() !== delimiter) {
      if (this.peek() === "\n") {
        this.handleNewline();
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw this.error(errorMessage);
    }

    return this.source.substring(start, this.current);
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
        case "-":
          if (this.peekNext() === "-") {
            // Single line comment
            while (this.peek() !== "\n" && !this.isAtEnd()) {
              this.advance();
            }
          } else {
            return;
          }
          break;
        case "/":
          if (this.peekNext() === "*") {
            this.handleMultilineComment();
          } else {
            return;
          }
          break;
        default:
          return;
      }
    }
  }

  // Handles multiline comments
  private handleMultilineComment(): void {
    // Consume the /*
    this.advance();
    this.advance();

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
