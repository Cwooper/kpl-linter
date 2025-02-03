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

// Implementation of inScanSet from C++
export function inScanSet(current: Token): boolean {
  if (!current) return false;

  switch (current.type) {
    // First section of token of misc. tokens...
    case TokenType.RETURNS:
    case TokenType.HEADER:
    case TokenType.END_HEADER:
    case TokenType.CODE:
    case TokenType.END_CODE:
    case TokenType.INTERFACE:
    case TokenType.EXTENDS:
    case TokenType.MESSAGES:
    case TokenType.END_INTERFACE:
    case TokenType.CLASS:
    case TokenType.IMPLEMENTS:
    case TokenType.SUPER_CLASS:
    case TokenType.RENAMING:
    case TokenType.FIELDS:
    case TokenType.METHODS:
    case TokenType.END_CLASS:
    case TokenType.BEHAVIOR:
    case TokenType.END_BEHAVIOR:
    case TokenType.USES:
    case TokenType.TO:
    case TokenType.CONST:
    case TokenType.ERRORS:
    case TokenType.VAR:
    case TokenType.TYPE:
    case TokenType.ENUM:
    case TokenType.FUNCTIONS:
    case TokenType.INFIX:
    case TokenType.PREFIX:
    case TokenType.METHOD:
    case TokenType.COLON:
    // These are from FIRST(TYPE)...
    case TokenType.INT:
    case TokenType.BOOL:
    case TokenType.CHAR:
    case TokenType.DOUBLE:
    case TokenType.TYPE_OF_NULL:
    case TokenType.ANY_TYPE:
    case TokenType.VOID:
    case TokenType.RECORD:
    case TokenType.PTR:
    case TokenType.ARRAY:
    // These are from FOLLOW(STMT)...
    case TokenType.ELSE_IF:
    case TokenType.ELSE:
    case TokenType.END_IF:
    case TokenType.END_WHILE:
    case TokenType.END_FOR:
    case TokenType.CASE:
    case TokenType.DEFAULT:
    case TokenType.END_SWITCH:
    case TokenType.CATCH:
    case TokenType.END_TRY:
    case TokenType.END_FUNCTION:
    case TokenType.END_METHOD:
    case TokenType.SEMI_COLON:
    case TokenType.R_PAREN:
    case TokenType.UNTIL:
    // These are from FIRST(STMT)...
    case TokenType.IF:
    case TokenType.WHILE:
    case TokenType.DO:
    case TokenType.BREAK:
    case TokenType.CONTINUE:
    case TokenType.RETURN:
    case TokenType.FOR:
    case TokenType.SWITCH:
    case TokenType.TRY:
    case TokenType.THROW:
    // These are from FIRST(EXPR)...
    case TokenType.TRUE:
    case TokenType.FALSE:
    case TokenType.NULL_KEYWORD:
    case TokenType.SELF:
    case TokenType.SUPER:
    case TokenType.INT_CONST:
    case TokenType.DOUBLE_CONST:
    case TokenType.CHAR_CONST:
    case TokenType.STRING_CONST:
    case TokenType.FUNCTION:
    case TokenType.ID:
    case TokenType.NEW:
    case TokenType.ALLOC:
    case TokenType.FREE:
    case TokenType.DEBUG:
    case TokenType.SIZE_OF:
    case TokenType.L_PAREN:
    case TokenType.OPERATOR:
      return true;
    default:
      return false;
  }
}

// Implementation of inFirstStmt from C++
export function inFirstStmt(current: Token): boolean {
  if (!current) return false;

  switch (current.type) {
    case TokenType.IF:
    case TokenType.WHILE:
    case TokenType.DO:
    case TokenType.BREAK:
    case TokenType.CONTINUE:
    case TokenType.RETURN:
    case TokenType.FOR:
    case TokenType.SWITCH:
    case TokenType.TRY:
    case TokenType.THROW:
    // These are from FIRST(EXPR)...
    case TokenType.TRUE:
    case TokenType.FALSE:
    case TokenType.NULL_KEYWORD:
    case TokenType.SELF:
    case TokenType.SUPER:
    case TokenType.INT_CONST:
    case TokenType.DOUBLE_CONST:
    case TokenType.CHAR_CONST:
    case TokenType.STRING_CONST:
    case TokenType.FUNCTION:
    case TokenType.ID:
    case TokenType.NEW:
    case TokenType.ALLOC:
    case TokenType.FREE:
    case TokenType.DEBUG:
    case TokenType.SIZE_OF:
    case TokenType.L_PAREN:
    case TokenType.OPERATOR:
      return true;
    default:
      return false;
  }
}

// Implementation of inFollowStmt from C++
export function inFollowStmt(current: Token): boolean {
  if (!current) return false;

  switch (current.type) {
    case TokenType.ELSE_IF:
    case TokenType.ELSE:
    case TokenType.END_IF:
    case TokenType.END_WHILE:
    case TokenType.END_FOR:
    case TokenType.CASE:
    case TokenType.DEFAULT:
    case TokenType.END_SWITCH:
    case TokenType.CATCH:
    case TokenType.END_TRY:
    case TokenType.END_FUNCTION:
    case TokenType.END_METHOD:
    case TokenType.SEMI_COLON:
    case TokenType.R_PAREN:
    case TokenType.UNTIL:
    // These are from FIRST(STMT)...
    case TokenType.IF:
    case TokenType.WHILE:
    case TokenType.DO:
    case TokenType.BREAK:
    case TokenType.CONTINUE:
    case TokenType.RETURN:
    case TokenType.FOR:
    case TokenType.SWITCH:
    case TokenType.TRY:
    case TokenType.THROW:
    // These are from FIRST(EXPR)...
    case TokenType.TRUE:
    case TokenType.FALSE:
    case TokenType.NULL_KEYWORD:
    case TokenType.SELF:
    case TokenType.SUPER:
    case TokenType.INT_CONST:
    case TokenType.DOUBLE_CONST:
    case TokenType.CHAR_CONST:
    case TokenType.STRING_CONST:
    case TokenType.FUNCTION:
    case TokenType.ID:
    case TokenType.NEW:
    case TokenType.ALLOC:
    case TokenType.FREE:
    case TokenType.DEBUG:
    case TokenType.SIZE_OF:
    case TokenType.L_PAREN:
    case TokenType.OPERATOR:
      return true;
    default:
      return false;
  }
}

// Implementation of inFirstExpr from C++
export function inFirstExpr(tok: Token): boolean {
  switch (tok.type) {
    case TokenType.TRUE:
    case TokenType.FALSE:
    case TokenType.NULL_KEYWORD:
    case TokenType.SELF:
    case TokenType.SUPER:
    case TokenType.INT_CONST:
    case TokenType.DOUBLE_CONST:
    case TokenType.CHAR_CONST:
    case TokenType.STRING_CONST:
    case TokenType.FUNCTION:
    case TokenType.ID:
    case TokenType.NEW:
    case TokenType.ALLOC:
    case TokenType.FREE:
    case TokenType.DEBUG:
    case TokenType.SIZE_OF:
    case TokenType.L_PAREN:
    case TokenType.OPERATOR:
      return true;
    default:
      return false;
  }
}

// Implementation of inFollowExpr from C++
export function inFollowExpr(current: Token): boolean {
  if (!current) return false;

  switch (current.type) {
    case TokenType.COMMA:
    case TokenType.EQUAL:
    case TokenType.COLON:
    case TokenType.PERIOD:
    case TokenType.R_BRACE:
    case TokenType.R_BRACK:
    case TokenType.TO:
    case TokenType.BY:
    case TokenType.AS_PTR_TO:
    case TokenType.AS_INTEGER:
    case TokenType.ARRAY_SIZE:
    case TokenType.IS_INSTANCE_OF:
    case TokenType.IS_KIND_OF:
    case TokenType.OF:
    case TokenType.CONST:
    case TokenType.ERRORS:
    case TokenType.VAR:
    case TokenType.ENUM:
    case TokenType.TYPE:
    case TokenType.FUNCTIONS:
    case TokenType.INTERFACE:
    case TokenType.CLASS:
    case TokenType.END_HEADER:
    case TokenType.END_CODE:
    case TokenType.BEHAVIOR:
    // These are from FOLLOW(STMT)...
    case TokenType.ELSE_IF:
    case TokenType.ELSE:
    case TokenType.END_IF:
    case TokenType.END_WHILE:
    case TokenType.END_FOR:
    case TokenType.CASE:
    case TokenType.DEFAULT:
    case TokenType.END_SWITCH:
    case TokenType.CATCH:
    case TokenType.END_TRY:
    case TokenType.END_FUNCTION:
    case TokenType.END_METHOD:
    case TokenType.SEMI_COLON:
    case TokenType.R_PAREN:
    case TokenType.UNTIL:
    // These are from FIRST(STMT)...
    case TokenType.IF:
    case TokenType.WHILE:
    case TokenType.DO:
    case TokenType.BREAK:
    case TokenType.CONTINUE:
    case TokenType.RETURN:
    case TokenType.FOR:
    case TokenType.SWITCH:
    case TokenType.TRY:
    case TokenType.THROW:
    // These are from FIRST(EXPR)...
    case TokenType.TRUE:
    case TokenType.FALSE:
    case TokenType.NULL_KEYWORD:
    case TokenType.SELF:
    case TokenType.SUPER:
    case TokenType.INT_CONST:
    case TokenType.DOUBLE_CONST:
    case TokenType.CHAR_CONST:
    case TokenType.STRING_CONST:
    case TokenType.FUNCTION:
    case TokenType.ID:
    case TokenType.NEW:
    case TokenType.ALLOC:
    case TokenType.FREE:
    case TokenType.DEBUG:
    case TokenType.SIZE_OF:
    case TokenType.L_PAREN:
    case TokenType.OPERATOR:
      return true;
    default:
      return false;
  }
}

// Implementation of inFirstType from C++
export function inFirstType(tok: Token): boolean {
  switch (tok.type) {
    case TokenType.CHAR:
    case TokenType.INT:
    case TokenType.DOUBLE:
    case TokenType.BOOL:
    case TokenType.VOID:
    case TokenType.TYPE_OF_NULL:
    case TokenType.ANY_TYPE:
    case TokenType.ID:
    case TokenType.PTR:
    case TokenType.RECORD:
    case TokenType.ARRAY:
    case TokenType.FUNCTION:
      return true;
    default:
      return false;
  }
}

// Implementation of inFollowType from C++
export function inFollowType(current: Token): boolean {
  if (!current) return false;

  switch (current.type) {
    case TokenType.END_RECORD:
    // These are from FOLLOW(EXPR)...
    case TokenType.COMMA:
    case TokenType.EQUAL:
    case TokenType.COLON:
    case TokenType.PERIOD:
    case TokenType.R_BRACE:
    case TokenType.R_BRACK:
    case TokenType.TO:
    case TokenType.BY:
    case TokenType.AS_PTR_TO:
    case TokenType.AS_INTEGER:
    case TokenType.ARRAY_SIZE:
    case TokenType.IS_INSTANCE_OF:
    case TokenType.IS_KIND_OF:
    case TokenType.OF:
    case TokenType.CONST:
    case TokenType.ERRORS:
    case TokenType.VAR:
    case TokenType.ENUM:
    case TokenType.TYPE:
    case TokenType.FUNCTIONS:
    case TokenType.INTERFACE:
    case TokenType.CLASS:
    case TokenType.END_HEADER:
    case TokenType.END_CODE:
    case TokenType.BEHAVIOR:
    // These are from FOLLOW(STMT)...
    case TokenType.ELSE_IF:
    case TokenType.ELSE:
    case TokenType.END_IF:
    case TokenType.END_WHILE:
    case TokenType.END_FOR:
    case TokenType.CASE:
    case TokenType.DEFAULT:
    case TokenType.END_SWITCH:
    case TokenType.CATCH:
    case TokenType.END_TRY:
    case TokenType.END_FUNCTION:
    case TokenType.END_METHOD:
    case TokenType.SEMI_COLON:
    case TokenType.R_PAREN:
    case TokenType.UNTIL:
    // These are from FIRST(STMT)...
    case TokenType.IF:
    case TokenType.WHILE:
    case TokenType.DO:
    case TokenType.BREAK:
    case TokenType.CONTINUE:
    case TokenType.RETURN:
    case TokenType.FOR:
    case TokenType.SWITCH:
    case TokenType.TRY:
    case TokenType.THROW:
    // These are from FIRST(EXPR)...
    case TokenType.TRUE:
    case TokenType.FALSE:
    case TokenType.NULL_KEYWORD:
    case TokenType.SELF:
    case TokenType.SUPER:
    case TokenType.INT_CONST:
    case TokenType.DOUBLE_CONST:
    case TokenType.CHAR_CONST:
    case TokenType.STRING_CONST:
    case TokenType.FUNCTION:
    case TokenType.ID:
    case TokenType.NEW:
    case TokenType.ALLOC:
    case TokenType.FREE:
    case TokenType.DEBUG:
    case TokenType.SIZE_OF:
    case TokenType.L_PAREN:
    case TokenType.OPERATOR:
      return true;
    default:
      return false;
  }
}

// Implementation of inHeaderSet from C++
export function inHeaderSet(current: Token): boolean {
  if (!current) return false;

  switch (current.type) {
    case TokenType.CONST:
    case TokenType.ERRORS:
    case TokenType.VAR:
    case TokenType.ENUM:
    case TokenType.TYPE:
    case TokenType.FUNCTIONS:
    case TokenType.INTERFACE:
    case TokenType.CLASS:
    case TokenType.END_HEADER:
    case TokenType.EOF:
      return true;
    default:
      return false;
  }
}

// Implementation of inCodeSet from C++
export function inCodeSet(current: Token): boolean {
  if (!current) return false;

  switch (current.type) {
    case TokenType.CONST:
    case TokenType.ERRORS:
    case TokenType.VAR:
    case TokenType.ENUM:
    case TokenType.TYPE:
    case TokenType.FUNCTION:
    case TokenType.INTERFACE:
    case TokenType.CLASS:
    case TokenType.BEHAVIOR:
    case TokenType.END_CODE:
    case TokenType.EOF:
      return true;
    default:
      return false;
  }
}
