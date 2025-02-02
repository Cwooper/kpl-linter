// Token Types System for the KPL Compiler
// Adapted for TypeScript/VSCode environment

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
  column: number;
  position: number;
}

// Complete enum of all token types
export enum TokenType {
  // Special tokens
  EOF = "EOF",
  ID = "ID",
  INT_CONST = "INT_CONST",
  DOUBLE_CONST = "DOUBLE_CONST",
  CHAR_CONST = "CHAR_CONST",
  STRING_CONST = "STRING_CONST",
  OPERATOR = "OPERATOR",

  // Keywords
  ALLOC = "ALLOC",
  ANY_TYPE = "ANY_TYPE",
  ARRAY = "ARRAY",
  ARRAY_SIZE = "ARRAY_SIZE",
  AS_INTEGER = "AS_INTEGER",
  AS_PTR_TO = "AS_PTR_TO",
  BEHAVIOR = "BEHAVIOR",
  BOOL = "BOOL",
  BREAK = "BREAK",
  BY = "BY",
  CASE = "CASE",
  CATCH = "CATCH",
  CHAR = "CHAR",
  CLASS = "CLASS",
  CODE = "CODE",
  CONST = "CONST",
  CONTINUE = "CONTINUE",
  DEBUG = "DEBUG",
  DEFAULT = "DEFAULT",
  DO = "DO",
  DOUBLE = "DOUBLE",
  ELSE = "ELSE",
  ELSE_IF = "ELSE_IF",
  END_BEHAVIOR = "END_BEHAVIOR",
  END_CLASS = "END_CLASS",
  END_CODE = "END_CODE",
  END_FOR = "END_FOR",
  END_FUNCTION = "END_FUNCTION",
  END_HEADER = "END_HEADER",
  END_IF = "END_IF",
  END_INTERFACE = "END_INTERFACE",
  END_METHOD = "END_METHOD",
  END_RECORD = "END_RECORD",
  END_SWITCH = "END_SWITCH",
  END_TRY = "END_TRY",
  END_WHILE = "END_WHILE",
  ENUM = "ENUM",
  ERRORS = "ERRORS",
  EXTENDS = "EXTENDS",
  EXTERNAL = "EXTERNAL",
  FALSE = "FALSE",
  FIELDS = "FIELDS",
  FOR = "FOR",
  FREE = "FREE",
  FUNCTION = "FUNCTION",
  FUNCTIONS = "FUNCTIONS",
  HEADER = "HEADER",
  IF = "IF",
  IMPLEMENTS = "IMPLEMENTS",
  INFIX = "INFIX",
  INT = "INT",
  INTERFACE = "INTERFACE",
  IS_INSTANCE_OF = "IS_INSTANCE_OF",
  IS_KIND_OF = "IS_KIND_OF",
  MESSAGES = "MESSAGES",
  METHOD = "METHOD",
  METHODS = "METHODS",
  NEW = "NEW",
  NULL_KEYWORD = "NULL",
  OF = "OF",
  PREFIX = "PREFIX",
  PTR = "PTR",
  RECORD = "RECORD",
  RENAMING = "RENAMING",
  RETURN = "RETURN",
  RETURNS = "RETURNS",
  SELF = "SELF",
  SIZE_OF = "SIZE_OF",
  SUPER = "SUPER",
  SUPER_CLASS = "SUPER_CLASS",
  SWITCH = "SWITCH",
  THROW = "THROW",
  TO = "TO",
  TRUE = "TRUE",
  TRY = "TRY",
  TYPE = "TYPE",
  TYPE_OF_NULL = "TYPE_OF_NULL",
  UNTIL = "UNTIL",
  USES = "USES",
  VAR = "VAR",
  VOID = "VOID",
  WHILE = "WHILE",

  // Punctuation tokens
  L_PAREN = "L_PAREN", // (
  R_PAREN = "R_PAREN", // )
  L_BRACE = "L_BRACE", // {
  R_BRACE = "R_BRACE", // }
  L_BRACK = "L_BRACK", // [
  R_BRACK = "R_BRACK", // ]
  COLON = "COLON", // :
  SEMI_COLON = "SEMI_COLON", // ;
  COMMA = "COMMA", // ,
  PERIOD = "PERIOD", // .
  EQUAL = "EQUAL", // =

  // AST Node types (used in parser)
  ALLOC_EXPR = "ALLOC_EXPR",
  ARGUMENT = "ARGUMENT",
  ARRAY_ACCESS = "ARRAY_ACCESS",
  ARRAY_SIZE_EXPR = "ARRAY_SIZE_EXPR",
  ARRAY_TYPE = "ARRAY_TYPE",
  AS_INTEGER_EXPR = "AS_INTEGER_EXPR",
  AS_PTR_TO_EXPR = "AS_PTR_TO_EXPR",
  ASSIGN_STMT = "ASSIGN_STMT",
  BOOL_CONST = "BOOL_CONST",
  BOOL_TYPE = "BOOL_TYPE",
  BREAK_STMT = "BREAK_STMT",
  CALL_EXPR = "CALL_EXPR",
  CALL_STMT = "CALL_STMT",
  CHAR_TYPE = "CHAR_TYPE",
  CLASS_DEF = "CLASS_DEF",
  CLASS_FIELD = "CLASS_FIELD",
  CLOSURE_EXPR = "CLOSURE_EXPR",
  CONST_DECL = "CONST_DECL",
  CONSTRUCTOR = "CONSTRUCTOR",
  CONTINUE_STMT = "CONTINUE_STMT",
  COUNT_VALUE = "COUNT_VALUE",
  DO_STMT = "DO_STMT",
  DOUBLE_TYPE = "DOUBLE_TYPE",
  DYNAMIC_CHECK = "DYNAMIC_CHECK",
  ERROR_DECL = "ERROR_DECL",
  FIELD_ACCESS = "FIELD_ACCESS",
  FIELD_INIT = "FIELD_INIT",
  FOR_STMT = "FOR_STMT",
  FUNCTION_PROTO = "FUNCTION_PROTO",
  FUNCTION_TYPE = "FUNCTION_TYPE",
  GLOBAL = "GLOBAL",
  IF_STMT = "IF_STMT",
  INT_TYPE = "INT_TYPE",
  IS_INSTANCE_OF_EXPR = "IS_INSTANCE_OF_EXPR",
  IS_KIND_OF_EXPR = "IS_KIND_OF_EXPR",
  LOCAL = "LOCAL",
  METHOD_PROTO = "METHOD_PROTO",
  NAMED_TYPE = "NAMED_TYPE",
  NEW_EXPR = "NEW_EXPR",
  NULL_CONST = "NULL_CONST",
  PARAMETER = "PARAMETER",
  PTR_TYPE = "PTR_TYPE",
  RECORD_FIELD = "RECORD_FIELD",
  RECORD_TYPE = "RECORD_TYPE",
  RETURN_STMT = "RETURN_STMT",
  SELF_EXPR = "SELF_EXPR",
  SEND_EXPR = "SEND_EXPR",
  SEND_STMT = "SEND_STMT",
  SIZE_OF_EXPR = "SIZE_OF_EXPR",
  SUPER_EXPR = "SUPER_EXPR",
  SWITCH_STMT = "SWITCH_STMT",
  THROW_STMT = "THROW_STMT",
  TRY_STMT = "TRY_STMT",
  TYPE_ARG = "TYPE_ARG",
  TYPE_DEF = "TYPE_DEF",
  TYPE_OF_NULL_TYPE = "TYPE_OF_NULL_TYPE",
  TYPE_PARM = "TYPE_PARM",
  VARIABLE_EXPR = "VARIABLE_EXPR",
  VOID_TYPE = "VOID_TYPE",
  WHILE_STMT = "WHILE_STMT",
  FREE_STMT = "FREE_STMT",
  DEBUG_STMT = "DEBUG_STMT",

  // Operators
  BAR = "BAR", // |
  CARET = "CARET", // ^
  AMP = "AMP", // &
  BAR_BAR = "BAR_BAR", // ||
  AMP_AMP = "AMP_AMP", // &&
  EQUAL_EQUAL = "EQUAL_EQUAL", // ==
  NOT_EQUAL = "NOT_EQUAL", // !=
  LESS = "LESS", // <
  LESS_EQUAL = "LESS_EQUAL", // <=
  GREATER = "GREATER", // >
  GREATER_EQUAL = "GREATER_EQUAL", // >=
  LESS_LESS = "LESS_LESS", // <<
  GREATER_GREATER = "GREATER_GREATER", // >>
  GREATER_GREATER_GREATER = "GREATER_GREATER_GREATER", // >>>
  PLUS = "PLUS", // +
  MINUS = "MINUS", // -
  STAR = "STAR", // *
  SLASH = "SLASH", // /
  PERCENT = "PERCENT", // %

  // Unary operator symbols
  UNARY_BANG = "UNARY_BANG", // !
  UNARY_STAR = "UNARY_STAR", // *
  UNARY_AMP = "UNARY_AMP", // &
  UNARY_MINUS = "UNARY_MINUS", // -
}

// Map of operator symbols to their string representations
export const OperatorStrings = {
  [TokenType.UNARY_BANG]: "_prefix_!",
  [TokenType.UNARY_STAR]: "_prefix_*",
  [TokenType.UNARY_AMP]: "_prefix_&",
  [TokenType.UNARY_MINUS]: "_prefix_-",
  [TokenType.PLUS]: "+",
  [TokenType.MINUS]: "-",
  [TokenType.STAR]: "*",
  [TokenType.SLASH]: "/",
  [TokenType.PERCENT]: "%",
  [TokenType.BAR]: "|",
  [TokenType.CARET]: "^",
  [TokenType.AMP]: "&",
  [TokenType.BAR_BAR]: "||",
  [TokenType.AMP_AMP]: "&&",
  [TokenType.EQUAL_EQUAL]: "==",
  [TokenType.NOT_EQUAL]: "!=",
  [TokenType.LESS]: "<",
  [TokenType.LESS_EQUAL]: "<=",
  [TokenType.GREATER]: ">",
  [TokenType.GREATER_EQUAL]: ">=",
  [TokenType.LESS_LESS]: "<<",
  [TokenType.GREATER_GREATER]: ">>",
  [TokenType.GREATER_GREATER_GREATER]: ">>>",
} as const;

// Keywords mapping for lexer
export const KEYWORDS: Record<string, TokenType> = {
  alloc: TokenType.ALLOC,
  anyType: TokenType.ANY_TYPE,
  array: TokenType.ARRAY,
  arraySize: TokenType.ARRAY_SIZE,
  asInteger: TokenType.AS_INTEGER,
  asPtrTo: TokenType.AS_PTR_TO,
  behavior: TokenType.BEHAVIOR,
  bool: TokenType.BOOL,
  break: TokenType.BREAK,
  by: TokenType.BY,
  case: TokenType.CASE,
  catch: TokenType.CATCH,
  char: TokenType.CHAR,
  class: TokenType.CLASS,
  code: TokenType.CODE,
  const: TokenType.CONST,
  continue: TokenType.CONTINUE,
  debug: TokenType.DEBUG,
  default: TokenType.DEFAULT,
  do: TokenType.DO,
  double: TokenType.DOUBLE,
  else: TokenType.ELSE,
  elseIf: TokenType.ELSE_IF,
  endBehavior: TokenType.END_BEHAVIOR,
  endClass: TokenType.END_CLASS,
  endCode: TokenType.END_CODE,
  endFor: TokenType.END_FOR,
  endFunction: TokenType.END_FUNCTION,
  endHeader: TokenType.END_HEADER,
  endIf: TokenType.END_IF,
  endInterface: TokenType.END_INTERFACE,
  endMethod: TokenType.END_METHOD,
  endRecord: TokenType.END_RECORD,
  endSwitch: TokenType.END_SWITCH,
  endTry: TokenType.END_TRY,
  endWhile: TokenType.END_WHILE,
  enum: TokenType.ENUM,
  errors: TokenType.ERRORS,
  extends: TokenType.EXTENDS,
  external: TokenType.EXTERNAL,
  false: TokenType.FALSE,
  fields: TokenType.FIELDS,
  for: TokenType.FOR,
  free: TokenType.FREE,
  function: TokenType.FUNCTION,
  functions: TokenType.FUNCTIONS,
  header: TokenType.HEADER,
  if: TokenType.IF,
  implements: TokenType.IMPLEMENTS,
  infix: TokenType.INFIX,
  int: TokenType.INT,
  interface: TokenType.INTERFACE,
  isInstanceOf: TokenType.IS_INSTANCE_OF,
  isKindOf: TokenType.IS_KIND_OF,
  messages: TokenType.MESSAGES,
  method: TokenType.METHOD,
  methods: TokenType.METHODS,
  new: TokenType.NEW,
  null: TokenType.NULL_KEYWORD,
  of: TokenType.OF,
  prefix: TokenType.PREFIX,
  ptr: TokenType.PTR,
  record: TokenType.RECORD,
  renaming: TokenType.RENAMING,
  return: TokenType.RETURN,
  returns: TokenType.RETURNS,
  self: TokenType.SELF,
  sizeOf: TokenType.SIZE_OF,
  super: TokenType.SUPER,
  superclass: TokenType.SUPER_CLASS,
  switch: TokenType.SWITCH,
  throw: TokenType.THROW,
  to: TokenType.TO,
  true: TokenType.TRUE,
  try: TokenType.TRY,
  type: TokenType.TYPE,
  typeOfNull: TokenType.TYPE_OF_NULL,
  until: TokenType.UNTIL,
  uses: TokenType.USES,
  var: TokenType.VAR,
  void: TokenType.VOID,
  while: TokenType.WHILE,
};

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

// Common token sets for parser error recovery and prediction
export const StatementFirstSet = new Set<TokenType>([
  TokenType.IF,
  TokenType.WHILE,
  TokenType.DO,
  TokenType.BREAK,
  TokenType.CONTINUE,
  TokenType.RETURN,
  TokenType.FOR,
  TokenType.SWITCH,
  TokenType.TRY,
  TokenType.THROW,
  TokenType.FREE,
  TokenType.DEBUG,
  TokenType.ID,
  // Expression starters
  TokenType.TRUE,
  TokenType.FALSE,
  TokenType.NULL_KEYWORD,
  TokenType.SELF,
  TokenType.SUPER,
  TokenType.INT_CONST,
  TokenType.DOUBLE_CONST,
  TokenType.CHAR_CONST,
  TokenType.STRING_CONST,
  TokenType.FUNCTION,
  TokenType.NEW,
  TokenType.ALLOC,
  TokenType.SIZE_OF,
  TokenType.L_PAREN,
]);

export const DeclarationFirstSet = new Set<TokenType>([
  TokenType.CONST,
  TokenType.ERRORS,
  TokenType.VAR,
  TokenType.ENUM,
  TokenType.TYPE,
  TokenType.FUNCTIONS,
  TokenType.INTERFACE,
  TokenType.CLASS,
  TokenType.BEHAVIOR,
]);

export const TypeFirstSet = new Set<TokenType>([
  TokenType.CHAR,
  TokenType.INT,
  TokenType.DOUBLE,
  TokenType.BOOL,
  TokenType.VOID,
  TokenType.TYPE_OF_NULL,
  TokenType.ANY_TYPE,
  TokenType.PTR,
  TokenType.RECORD,
  TokenType.ARRAY,
  TokenType.FUNCTION,
  TokenType.ID,
]);
