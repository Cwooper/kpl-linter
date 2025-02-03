import { Token, TokenType } from "./types/tokens";
import * as AST from "./types/ast";

export class ParseError extends Error {
  constructor(message: string, public token: Token) {
    super(`[${token.line}:${token.column}] Error: ${message}`);
    this.name = "ParseError";
  }
}

export class ProgramLogicError extends Error {
  constructor(message: string) {
    super(`Program Logic Error: ${message}`);
    this.name = "ProgramLogicError";
  }
}

export class KPLParser {
  private tokens: Token[] = [];
  private current: Token | null = null;
  private token2: Token | null = null;
  private token3: Token | null = null;
  private currentIndex: number = 0;
  private stringTable = new Map<string, string>();
  private hashVal: number = 0;

  constructor(tokens: Token[]) {
    // Filter out comments during initialization
    this.tokens = tokens.filter((token) => token.type !== TokenType.COMMENT);
    this.advance(); // Load first three tokens
  }

  // Advance the token window forward
  private advance(): void {
    if (this.currentIndex < this.tokens.length) {
      this.current = this.tokens[this.currentIndex++];
      this.token2 =
        this.currentIndex < this.tokens.length
          ? this.tokens[this.currentIndex]
          : null;
      this.token3 =
        this.currentIndex + 1 < this.tokens.length
          ? this.tokens[this.currentIndex + 1]
          : null;
    } else {
      this.current = this.token2;
      this.token2 = this.token3;
      this.token3 = null;
    }
  }

  // Helper to create position information
  private getPosition(token: Token): AST.Position {
    return {
      line: token.line,
      column: token.column,
      position: token.position,
      file: "", // Will be set by the manager
    };
  }

  // Error reporting function matching C++ implementation
  private syntaxError(msg: string): void {
    throw new ParseError(msg, this.current!);
  }

  private programLogicError(msg: string): void {
    throw new ProgramLogicError(msg);
  }

  // Implementation of nextTokenIsID from C++
  private nextTokenIsID(msg: string): boolean {
    if (this.current?.type === TokenType.ID) {
      return true;
    } else {
      this.syntaxError(msg);
      if (this.token2?.type === TokenType.ID) {
        this.advance();
        this.checkTokenSkipping(1);
        return true;
      } else if (this.token3?.type === TokenType.ID) {
        this.advance();
        this.advance();
        this.checkTokenSkipping(2);
        return true;
      } else {
        this.checkTokenSkipping(0);
        return false;
      }
    }
  }

  // Implementation of mustHaveID from C++
  private mustHaveID(msg: string): string {
    if (this.nextTokenIsID(msg)) {
      const id = this.current!.lexeme;
      this.advance();
      return id;
    }
    return "<missingIdSyntaxError>";
  }

  // Implementation of mustHave from C++
  private mustHave(tokenType: TokenType, msg: string): void {
    if (this.current?.type === tokenType) {
      this.advance();
    } else {
      this.syntaxError(msg);
      if (this.token2?.type === tokenType) {
        this.advance();
        this.advance();
        this.checkTokenSkipping(1);
      } else if (this.token3?.type === tokenType) {
        this.advance();
        this.advance();
        this.advance();
        this.checkTokenSkipping(2);
      } else {
        this.checkTokenSkipping(0);
      }
    }
  }

  // Implementation of checkTokenSkipping from C++
  private checkTokenSkipping(count: number): void {
    if (count > 0) {
      console.warn(`*** Skipped ${count} token${count === 1 ? "" : "s"} ***`);
    }
  }

  // Implementation of mustHaveOrScanUntilInScanSet from C++
  private mustHaveOrScanUntilInScanSet(
    tokenType: TokenType,
    msg: string
  ): boolean {
    let count: number;
    let retValue = false;

    console.warn("**********  OBSOLETE ROUTINE  **********");
    if (this.current?.type === tokenType) {
      this.advance();
      return true;
    } else {
      this.syntaxError(msg);
      count = 0;
      while (true) {
        if (this.current?.type === TokenType.EOF) {
          break;
        } else if (this.current?.type === tokenType) {
          this.advance();
          count++;
          retValue = true;
          break;
        } else if (this.inScanSet()) {
          if (this.current?.type === tokenType) {
            this.advance();
            count++;
          }
          break;
        }
        this.advance();
        count++;
      }
      this.checkTokenSkipping(count);
      return retValue;
    }
  }

  // Implementation of scanToFollowType from C++
  private scanToFollowType(): void {
    let count = 0;
    while (this.current?.type !== TokenType.EOF && !this.inFollowType()) {
      this.advance();
      count++;
    }
    this.checkTokenSkipping(count);
  }

  // Implementation of inScanSet from C++
  private inScanSet(): boolean {
    if (!this.current) return false;

    switch (this.current.type) {
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
  private inFirstStmt(): boolean {
    if (!this.current) return false;

    switch (this.current.type) {
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
  private inFollowStmt(): boolean {
    if (!this.current) return false;

    switch (this.current.type) {
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
  private inFirstExpr(tok: Token): boolean {
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
  private inFollowExpr(): boolean {
    if (!this.current) return false;

    switch (this.current.type) {
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
  private inFirstType(tok: Token): boolean {
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
  private inFollowType(): boolean {
    if (!this.current) return false;

    switch (this.current.type) {
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
  private inHeaderSet(): boolean {
    if (!this.current) return false;

    switch (this.current.type) {
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
  private inCodeSet(): boolean {
    if (!this.current) return false;

    switch (this.current.type) {
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

  // Implementation of appendStmtLists from C++
  private appendStmtLists(
    stmtList1: AST.Statement | null,
    stmtList2: AST.Statement | null
  ): AST.Statement | null {
    if (stmtList1 === null) return stmtList2;
    if (stmtList2 === null) return stmtList1;

    // Find the last statement in stmtList1
    let p: AST.Statement = stmtList1;
    while (p.next) {
      p = p.next;
    }
    p.next = stmtList2;
    return stmtList1;
  }
}
