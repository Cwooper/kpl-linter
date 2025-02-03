import { Token, KEYWORDS, TokenType, OPERATORS } from "./types/tokens";

// Helper functions for token manipulation
export class TokenUtils {
  /**
   * Creates a new token with the given properties
   */
  static createToken(
    type: TokenType,
    lexeme: string,
    literal: any = null,
    line: number = 1,
    column: number = 1,
    position: number = 0
  ): Token {
    return {
      type,
      lexeme,
      literal,
      line,
      column,
      position,
    };
  }

  /**
   * Checks if a given word is a keyword
   */
  static isKeyword(word: string): boolean {
    return word in KEYWORDS;
  }

  /**
   * Gets the token type for a keyword
   */
  static getKeywordType(word: string): TokenType | undefined {
    return KEYWORDS[word];
  }

  /**
   * Gets the token type for a given operator string
   */
  static getOperatorType(text: string): TokenType | undefined {
    return OPERATORS.get(text);
  }

  /**
   * Checks if a character could be part of an operator
   */
  static isOperatorChar(ch: string): boolean {
    return /^[+\-*\\\/!@#$%^&~`|?<>=]$/.test(ch);
  }

  /**
   * Creates a string representation of a token for debugging
   */
  static tokenToString(token: Token): string {
    return `Token(type=${token.type}, lexeme="${token.lexeme}", literal=${token.literal}, line=${token.line}, col=${token.column})`;
  }
}
