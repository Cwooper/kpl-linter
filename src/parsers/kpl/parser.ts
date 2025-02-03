import { Token, TokenType } from "./types/tokens";
import {
  inScanSet,
  inFirstStmt,
  inFollowStmt,
  inFirstExpr,
  inFollowExpr,
  inFirstType,
  inFollowType,
  inHeaderSet,
  inCodeSet,
} from "./token-utils";
import * as AST from "./types/ast";

export class ParseError extends Error {
  constructor(message: string, public token: Token) {
    super(`[${token.line}:${token.column}] Error: ${message}`);
    this.name = "ParseError";
  }
}

export class KPLParser {
 // TODO
}
