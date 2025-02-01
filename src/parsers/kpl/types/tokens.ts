// Base token interface
export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
  column: number;
  position: number;
}

// Token types enum
export enum TokenType {
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
  NULL = "NULL",
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
  SUPERCLASS = "SUPERCLASS",
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

  // Literals
  INTEGER = "INTEGER", // e.g., 42, 0x1234ABCD
  DOUBLE = "DOUBLE", // e.g., 3.1415, 6.022e23
  CHAR_LITERAL = "CHAR", // e.g., 'a', '\n'
  STRING_LITERAL = "STRING", // e.g., "hello", "\t\n"
  IDENTIFIER = "IDENTIFIER", // e.g., x, myName, MAX_SIZE

  // Operators - binary
  PLUS = "PLUS", // +
  MINUS = "MINUS", // -
  STAR = "STAR", // *
  SLASH = "SLASH", // /
  PERCENT = "PERCENT", // %
  EQUAL = "EQUAL", // =
  EQUAL_EQUAL = "EQUAL_EQUAL", // ==
  BANG_EQUAL = "BANG_EQUAL", // !=
  LESS = "LESS", // <
  LESS_EQUAL = "LESS_EQUAL", // <=
  GREATER = "GREATER", // >
  GREATER_EQUAL = "GREATER_EQUAL", // >=
  AND = "AND", // &
  OR = "OR", // |
  XOR = "XOR", // ^
  LOGICAL_AND = "LOGICAL_AND", // &&
  LOGICAL_OR = "LOGICAL_OR", // ||
  SHIFT_LEFT = "SHIFT_LEFT", // <<
  SHIFT_RIGHT = "SHIFT_RIGHT", // >>
  SHIFT_RIGHT_UNSIGNED = "SHIFT_RIGHT_UNSIGNED", // >>>

  // Operators - unary
  BANG = "BANG", // !
  AMPERSAND = "AMPERSAND", // & (address-of)
  STAR_PTR = "STAR_PTR", // * (dereference)

  // Punctuation
  LEFT_PAREN = "LEFT_PAREN", // (
  RIGHT_PAREN = "RIGHT_PAREN", // )
  LEFT_BRACE = "LEFT_BRACE", // {
  RIGHT_BRACE = "RIGHT_BRACE", // }
  LEFT_BRACKET = "LEFT_BRACKET", // [
  RIGHT_BRACKET = "RIGHT_BRACKET", // ]
  COMMA = "COMMA", // ,
  DOT = "DOT", // .
  COLON = "COLON", // :
  SEMICOLON = "SEMICOLON", // ;

  // Special tokens
  COMMENT = "COMMENT", // For both -- and /* */ comments
  EOF = "EOF", // End of file marker
  ERROR = "ERROR", // For lexical errors
}

// Keywords map for quick lookup
export const KEYWORDS: { [key: string]: TokenType } = {
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
  null: TokenType.NULL,
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
  superclass: TokenType.SUPERCLASS,
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

// Helper class for token creation
export class TokenUtils {
  static createToken(
    type: TokenType,
    lexeme: string,
    literal: any,
    line: number,
    column: number,
    position: number
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

  static isKeyword(word: string): boolean {
    return word in KEYWORDS;
  }

  static getKeywordType(word: string): TokenType | null {
    return KEYWORDS[word] || null;
  }
}
