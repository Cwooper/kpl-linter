// kpl parser
// parses all necessary files
// initializes the tokenizer
// intializes and updates the symbol table
import { Token, TokenType } from "./types/tokens";
import { Tokenizer, TokenizerError } from "./tokenizer";
import * as AST from "./types/ast";

export class ParseError extends Error {
  constructor(message: string, public token: Token) {
    super(
      `[${token.line}:${token.column}] Error at '${token.lexeme}': ${message}`
    );
    this.name = "ParseError";
  }
}

// This will always ignore/skip over comments
export class KPLParser {
  private current: Token | null = null;
  private previous: Token | null = null;
  private tokens: Token[] = [];
  private currentIndex: number = 0;

  constructor(tokens: Token[]) {
    // Filter out comments during initialization
    this.tokens = tokens.filter((token) => token.type !== TokenType.COMMENT);
    this.advance(); // Load first token
  }

  parse(): AST.Program {
    try {
      return this.parseProgram();
    } catch (error) {
      if (error instanceof ParseError) {
        // Handle parse error
        console.error(error.message);
        // TODO handle half-broken AST
        throw error;
      }
      throw error;
    }
  }

  // Initial parsing methods
  private parseProgram(): AST.Program {
    // Check if it's a header or code file based on first tokens
    const declarations = [];

    while (!this.isAtEnd()) {
      if (this.match(TokenType.HEADER)) {
        declarations.push(this.parseHeaderFile());
      } else if (this.match(TokenType.CODE)) {
        declarations.push(this.parseCodeFile());
      } else {
        throw this.error(
          this.current!,
          "Expected 'header' or 'code' declaration"
        );
      }
    }

    return {
      type: "Program",
      files: declarations,
      position: this.getPosition(this.previous!),
    };
  }

  private parseHeaderFile(): AST.HeaderFile {
    // We've already consumed the 'header' token in parseProgram()

    // Parse the header name
    const idToken = this.consume(TokenType.IDENTIFIER, "Expected header name");
    const startPosition = this.getPosition(idToken);

    const declarations: AST.Declaration[] = [];
    let uses: AST.Uses | undefined;

    if (this.match(TokenType.USES)) {
      uses = this.parseUses();
    }

    // Parse declarations until we hit endHeader
    while (!this.isAtEnd() && !this.check(TokenType.END_HEADER)) {
      // Parse other declarations based on the token type
      if (this.match(TokenType.CONST)) {
        declarations.push(...this.parseConstants());
      } else if (this.match(TokenType.ERRORS)) {
        declarations.push(this.parseErrors());
      } else if (this.match(TokenType.VAR)) {
        declarations.push(...this.parseVarDecls());
      } else if (this.match(TokenType.ENUM)) {
        declarations.push(this.parseEnum());
      } else if (this.match(TokenType.TYPE)) {
        declarations.push(...this.parseTypeDefs());
      } else if (this.match(TokenType.FUNCTIONS)) {
        declarations.push(...this.parseFunctionProtos());
      } else if (this.match(TokenType.INTERFACE)) {
        declarations.push(this.parseInterface());
      } else if (this.match(TokenType.CLASS)) {
        declarations.push(this.parseClass());
      } else {
        throw this.error(
          this.current!,
          "Expected declaration (const, errors, var, enum, type, functions, interface, or class)"
        );
      }
    }

    // Consume the endHeader token
    this.consume(TokenType.END_HEADER, "Expected 'endHeader'");

    return {
      type: "HeaderFile",
      id: idToken.lexeme,
      uses,
      declarations,
      position: startPosition,
    };
  }

  private parseCodeFile(): AST.CodeFile {
    // We've already consumed the 'code' token in parseProgram()

    // Parse the code file name
    const idToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected code file name"
    );
    const startPosition = this.getPosition(idToken);

    const declarations: AST.Declaration[] = [];

    // Parse declarations until we hit endCode
    while (!this.isAtEnd() && !this.check(TokenType.END_CODE)) {
      if (this.match(TokenType.CONST)) {
        declarations.push(...this.parseConstants());
      } else if (this.match(TokenType.ERRORS)) {
        declarations.push(this.parseErrors());
      } else if (this.match(TokenType.VAR)) {
        declarations.push(...this.parseVarDecls());
      } else if (this.match(TokenType.ENUM)) {
        declarations.push(this.parseEnum());
      } else if (this.match(TokenType.TYPE)) {
        declarations.push(...this.parseTypeDefs());
      } else if (this.match(TokenType.FUNCTION)) {
        declarations.push(this.parseFunction());
      } else if (this.match(TokenType.INTERFACE)) {
        declarations.push(this.parseInterface());
      } else if (this.match(TokenType.CLASS)) {
        declarations.push(this.parseClass());
      } else if (this.match(TokenType.BEHAVIOR)) {
        declarations.push(this.parseBehavior());
      } else {
        throw this.error(
          this.current!,
          "Expected declaration (const, errors, var, enum, type, function, interface, class, or behavior)"
        );
      }
    }

    // Consume the endCode token
    this.consume(TokenType.END_CODE, "Expected 'endCode'");

    return {
      type: "CodeFile",
      id: idToken.lexeme,
      declarations,
      position: startPosition,
    };
  }

  private parseInterface(): AST.InterfaceDecl {
    // We've already consumed the 'interface' token
    const idToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected interface name"
    );
    const startPosition = this.getPosition(idToken);

    // Parse optional type parameters
    let typeParameters: AST.TypeParameter[] | undefined;
    if (this.match(TokenType.LEFT_BRACKET)) {
      typeParameters = this.parseTypeParms();
    }

    // Parse optional extends clause
    let extendsTypes: AST.NamedType[] | undefined;
    if (this.match(TokenType.EXTENDS)) {
      extendsTypes = this.parseTypeList();
    }

    // Parse optional message declarations
    let messages: AST.MethodProto[] | undefined;
    if (this.match(TokenType.MESSAGES)) {
      messages = [];
      while (!this.check(TokenType.END_INTERFACE)) {
        messages.push(this.parseMethProto());
      }
    }

    this.consume(TokenType.END_INTERFACE, "Expected 'endInterface'");

    return {
      type: "InterfaceDecl",
      name: idToken.lexeme,
      typeParameters,
      extends: extendsTypes,
      messages,
      position: startPosition,
    };
  }

  private parseClass(): AST.ClassDecl {
    // We've already consumed the 'class' token
    const idToken = this.consume(TokenType.IDENTIFIER, "Expected class name");
    const startPosition = this.getPosition(idToken);

    // Parse optional type parameters
    let typeParameters: AST.TypeParameter[] | undefined;
    if (this.match(TokenType.LEFT_BRACKET)) {
      typeParameters = this.parseTypeParms();
    }

    // Parse optional implements clause
    let implementsTypes: AST.NamedType[] | undefined;
    if (this.match(TokenType.IMPLEMENTS)) {
      implementsTypes = this.parseTypeList();
    }

    // Parse optional superclass
    let superclass: AST.NamedType | undefined;
    if (this.match(TokenType.SUPERCLASS)) {
      superclass = this.parseNamedType();
    }

    // Parse optional fields
    let fields: AST.VarDecl[] | undefined;
    if (this.match(TokenType.FIELDS)) {
      fields = [];
      while (
        !this.check(TokenType.METHODS) &&
        !this.check(TokenType.END_CLASS)
      ) {
        fields.push(...this.parseVarDecls());
      }
    }

    // Parse optional methods
    let methods: AST.MethodProto[] | undefined;
    if (this.match(TokenType.METHODS)) {
      methods = [];
      while (!this.check(TokenType.END_CLASS)) {
        methods.push(this.parseMethProto());
      }
    }

    this.consume(TokenType.END_CLASS, "Expected 'endClass'");

    return {
      type: "ClassDecl",
      name: idToken.lexeme,
      typeParameters,
      implements: implementsTypes,
      superclass,
      fields,
      methods,
      position: startPosition,
    };
  }

  private parseBehavior(): AST.BehaviorDecl {
    // We've already consumed the 'behavior' token
    const idToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected behavior name"
    );
    const startPosition = this.getPosition(idToken);

    const methods: AST.MethodDecl[] = [];

    // Parse methods until endBehavior
    while (!this.check(TokenType.END_BEHAVIOR)) {
      if (this.match(TokenType.METHOD)) {
        methods.push(this.parseMethod());
      } else {
        throw this.error(this.current!, "Expected method declaration");
      }
    }

    this.consume(TokenType.END_BEHAVIOR, "Expected 'endBehavior'");

    return {
      type: "BehaviorDecl",
      name: idToken.lexeme,
      methods,
      position: startPosition,
    };
  }

  private parseUses(): AST.Uses {
    // We've already consumed the 'uses' token
    const startPosition = this.getPosition(this.previous!);
    const packages: AST.Package[] = [];

    // Parse first package (required)
    packages.push(this.parseOtherPackage());

    // Parse additional packages separated by commas
    while (this.match(TokenType.COMMA)) {
      packages.push(this.parseOtherPackage());
    }

    return {
      type: "Uses",
      packages: packages,
      position: startPosition,
    };
  }

  private parseOtherPackage(): AST.Package {
    const startPosition = this.getPosition(this.current!);
    let name: string | { value: string; type: "STRING" };

    // Package name can be either an identifier or a string literal
    if (this.match(TokenType.STRING_LITERAL)) {
      name = { value: this.previous!.lexeme, type: "STRING" };
    } else if (this.match(TokenType.IDENTIFIER)) {
      name = this.previous!.lexeme;
    } else {
      throw this.error(
        this.current!,
        "Expected package name or string literal"
      );
    }

    // Parse optional renaming clause
    let renaming: AST.Rename[] | undefined;
    if (this.match(TokenType.RENAMING)) {
      renaming = [];
      do {
        renaming.push(this.parseRename());
      } while (this.match(TokenType.COMMA));
    }

    return {
      type: "Package",
      name,
      renaming,
      position: startPosition,
    };
  }

  private parseRename(): AST.Rename {
    const startPosition = this.getPosition(this.current!);

    // Parse original name
    const fromToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected original name"
    );

    // Parse 'to' keyword
    this.consume(TokenType.TO, "Expected 'to'");

    // Parse new name
    const toToken = this.consume(TokenType.IDENTIFIER, "Expected new name");

    return {
      type: "Rename",
      from: fromToken.lexeme,
      to: toToken.lexeme,
      position: startPosition,
    };
  }

  private parseTypeParms(): AST.TypeParameter[] {
    const parameters: AST.TypeParameter[] = [];

    // Parse type parameters until right bracket
    while (!this.check(TokenType.RIGHT_BRACKET)) {
      if (parameters.length > 0) {
        this.consume(TokenType.COMMA, "Expected ',' between type parameters");
      }

      const idToken = this.consume(
        TokenType.IDENTIFIER,
        "Expected type parameter name"
      );
      this.consume(TokenType.COLON, "Expected ':' after type parameter name");
      const constraint = this.parseType();

      parameters.push({
        type: "TypeParameter",
        name: idToken.lexeme,
        constraint,
        position: this.getPosition(idToken),
      });
    }

    this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after type parameters");
    return parameters;
  }

  private parseConstants(): AST.ConstantDecl[] {
    // We've already consumed the 'const' token
    const declarations: AST.ConstantDecl[] = [];

    // Parse one or more constant declarations
    while (this.peekNext().type === TokenType.EQUAL) {
      declarations.push(this.parseConstant());
    }

    return declarations;
  }

  private parseConstant(): AST.ConstantDecl {
    const startPosition = this.getPosition(this.current!);

    // Parse constant declarations
    const idToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected constant name"
    );
    this.consume(TokenType.EQUAL, "Expected '=' after constant name");
    const value = this.parseExpr();

    return {
      type: "ConstantDecl",
      name: idToken.lexeme,
      value,
      position: startPosition,
    };
  }

  private parseVarDecl(): AST.VarDecl {
    // Parse ID list
    const names = this.parseIDList();

    // Parse type annotation
    this.consume(TokenType.COLON, "Expected ':' after variable name(s)");
    const varType = this.parseType();

    // Parse optional initializer
    let initializer: AST.Expression | undefined;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.parseExpr();
    }

    return {
      type: "VarDecl",
      names,
      varType,
      initializer,
      position: this.getPosition(this.previous!),
    };
  }

  private parseVarDecls(): AST.VarDecl[] {
    // We've already consumed the 'var' token
    const declarations: AST.VarDecl[] = [];

    // Parse one or more variable declarations
    do {
      declarations.push(this.parseVarDecl());
    } while (this.peekNext().type === TokenType.COLON);

    return declarations;
  }

  private parseErrors(): AST.ErrorDecl {
    // We've already consumed the 'errors' token
    const startPosition = this.getPosition(this.previous!);

    // Must have at least one error declaration
    const errorDecls: AST.ErrorDecl[] = [];

    do {
      const idToken = this.consume(TokenType.IDENTIFIER, "Expected error name");
      const parameters = this.parseParmList();

      errorDecls.push({
        type: "ErrorDecl",
        name: idToken.lexeme,
        parameters,
        position: this.getPosition(idToken),
      });
    } while (!this.isNewSection());

    // Return the first error declaration (the AST seems to expect just one)
    return errorDecls[0];
  }

  private parseTypeDefs(): AST.TypeDecl[] {
    // We've already consumed the 'type' token
    const startPosition = this.getPosition(this.previous!);
    const declarations: AST.TypeDecl[] = [];

    do {
      const idToken = this.consume(TokenType.IDENTIFIER, "Expected type name");
      this.consume(TokenType.EQUAL, "Expected '=' after type name");
      const typeValue = this.parseType();

      declarations.push({
        type: "TypeDecl",
        name: idToken.lexeme,
        value: typeValue,
        position: this.getPosition(idToken),
      });
    } while (!this.isNewSection());

    return declarations;
  }

  private parseEnum(): AST.EnumDecl {
    // We've already consumed the 'enum' token
    const startPosition = this.getPosition(this.previous!);

    // Parse required enum name
    const idToken = this.consume(TokenType.IDENTIFIER, "Expected enum name");

    // Parse optional base value
    let baseValue: AST.Expression | undefined;
    if (this.match(TokenType.EQUAL)) {
      baseValue = this.parseExpr();
    }

    // Parse enum members
    let members: string[] = [];
    if (this.match(TokenType.COMMA)) {
      members = this.parseIDList();
    }

    return {
      type: "EnumDecl",
      name: idToken.lexeme,
      baseValue,
      members,
      position: startPosition,
    };
  }

  private parseIDList(): string[] {
    // Parse comma-separated list of identifiers
    const identifiers: string[] = [];

    do {
      const idToken = this.consume(TokenType.IDENTIFIER, "Expected identifier");
      identifiers.push(idToken.lexeme);
    } while (this.match(TokenType.COMMA));

    return identifiers;
  }

  private parseArgList(): AST.Expression[] {
    this.consume(TokenType.LEFT_PAREN, "Expected '(' for argument list");

    const args: AST.Expression[] = [];

    // Handle empty argument list
    if (this.match(TokenType.RIGHT_PAREN)) {
      return args;
    }

    // Parse comma-separated expressions
    do {
      args.push(this.parseExpr());
    } while (this.match(TokenType.COMMA));

    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after arguments");
    return args;
  }

  private parseParmList(): AST.Parameter[] {
    this.consume(TokenType.LEFT_PAREN, "Expected '(' for parameter list");

    const parameters: AST.Parameter[] = [];

    // Handle empty parameter list
    if (this.match(TokenType.RIGHT_PAREN)) {
      return parameters;
    }

    // Parse comma-separated declarations
    do {
      const names = this.parseIDList();
      this.consume(TokenType.COLON, "Expected ':' after parameter names");
      const paramType = this.parseType();

      // Convert VarDecl to Parameter(s)
      for (const name of names) {
        parameters.push({
          type: "Parameter",
          name: name,
          paramType,
          position: this.getPosition(this.previous!),
        });
      }
    } while (this.match(TokenType.COMMA));

    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after parameters");
    return parameters;
  }

  private parseFunProto(): AST.FunctionProto {
    const startPosition = this.getPosition(this.current!);

    // Parse function name
    const idToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected function name"
    );

    // Parse parameter list
    const parameters = this.parseParmList();

    // Parse optional return type
    let returnType: AST.Type | undefined;
    if (this.match(TokenType.RETURNS)) {
      returnType = this.parseType();
    }

    return {
      type: "FunctionProto",
      name: idToken.lexeme,
      parameters,
      returnType,
      isExternal: false, // Will be set to true by caller if needed
      position: startPosition,
    };
  }

  private parseFunctionProtos(): AST.FunctionProto[] {
    // We've already consumed the 'functions' token
    const protos: AST.FunctionProto[] = [];

    // Check for initial required function proto
    const isExternal = this.match(TokenType.EXTERNAL);

    // Parse the function prototype
    const proto = this.parseFunProto();
    proto.isExternal = isExternal;

    protos.push(proto);

    // Parse one or more function prototypes
    while (!this.isNewSection()) {
      // Check for external modifier
      const isExternal = this.match(TokenType.EXTERNAL);

      // Parse the function prototype
      const proto = this.parseFunProto();
      proto.isExternal = isExternal;

      protos.push(proto);
    }

    return protos;
  }

  private parseFunction(): AST.FunctionDecl {
    // We've already consumed the 'function' token
    const startPosition = this.getPosition(this.previous!);

    // Parse function name
    const idToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected function name"
    );

    // Parse parameter list
    const parameters = this.parseParmList();

    // Parse optional return type
    let returnType: AST.Type | undefined;
    if (this.match(TokenType.RETURNS)) {
      returnType = this.parseType();
    }

    // Parse optional variable declarations
    let variables: AST.VarDecl[] | undefined;
    if (this.match(TokenType.VAR)) {
      variables = this.parseVarDecls();
    }

    // Parse statement list
    const body = this.parseStmtList();

    this.consume(TokenType.END_FUNCTION, "Expected 'endFunction'");

    return {
      type: "FunctionDecl",
      name: idToken.lexeme,
      parameters,
      returnType,
      variables,
      body,
      position: startPosition,
    };
  }

  private parseNamelessFunction(): AST.NamelessFunctionDecl {
    // We've already consumed the 'function' token
    const startPosition = this.getPosition(this.previous!);

    // Parse parameter list
    const parameters = this.parseParmList();

    // Parse optional return type
    let returnType: AST.Type | undefined;
    if (this.match(TokenType.RETURNS)) {
      returnType = this.parseType();
    }

    // Parse optional variable declarations
    let variables: AST.VarDecl[] | undefined;
    if (this.match(TokenType.VAR)) {
      variables = this.parseVarDecls();
    }

    // Parse statement list
    const body = this.parseStmtList();

    this.consume(TokenType.END_FUNCTION, "Expected 'endFunction'");

    return {
      type: "NamelessFunctionDecl",
      parameters,
      returnType,
      variables,
      body,
      position: startPosition,
    };
  }

  private parseMethProto(): AST.MethodProto {
    const startPosition = this.getPosition(this.current!);

    // Check for different method types
    if (this.match(TokenType.INFIX)) {
      // Parse infix operator method
      const operator = this.parseOperator("Expected operator for infix method");

      // Parse single parameter
      this.consume(TokenType.LEFT_PAREN, "Expected '('");
      const paramName = this.consume(
        TokenType.IDENTIFIER,
        "Expected parameter name"
      );
      this.consume(TokenType.COLON, "Expected ':'");
      const paramType = this.parseType();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')'");

      // Parse return type
      this.consume(TokenType.RETURNS, "Expected 'returns'");
      const returnType = this.parseType();

      return {
        type: "MethodProto",
        kind: {
          kind: "Infix",
          operator,
          parameter: {
            type: "Parameter",
            name: paramName.lexeme,
            paramType,
            position: this.getPosition(paramName),
          },
          returnType,
        },
        position: startPosition,
      };
    } else if (this.match(TokenType.PREFIX)) {
      // Parse prefix operator method
      const operator = this.parseOperator("Expected operator for infix method");

      // Parse empty parameter list
      this.consume(TokenType.LEFT_PAREN, "Expected '('");
      this.consume(TokenType.RIGHT_PAREN, "Expected ')'");

      // Parse return type
      this.consume(TokenType.RETURNS, "Expected 'returns'");
      const returnType = this.parseType();

      return {
        type: "MethodProto",
        kind: {
          kind: "Prefix",
          operator,
          returnType,
        },
        position: startPosition,
      };
    } else {
      // Check if it's a keyword method (multiple segments)
      const segments: { name: string; parameter: AST.Parameter }[] = [];
      let isKeywordMethod = false;

      while (this.match(TokenType.IDENTIFIER)) {
        const nameToken = this.previous!;

        if (this.match(TokenType.COLON)) {
          isKeywordMethod = true;
          // Parse parameter for this segment
          this.consume(TokenType.LEFT_PAREN, "Expected '('");
          const paramName = this.consume(
            TokenType.IDENTIFIER,
            "Expected parameter name"
          );
          this.consume(TokenType.COLON, "Expected ':'");
          const paramType = this.parseType();
          this.consume(TokenType.RIGHT_PAREN, "Expected ')'");

          segments.push({
            name: nameToken.lexeme,
            parameter: {
              type: "Parameter",
              name: paramName.lexeme,
              paramType,
              position: this.getPosition(paramName),
            },
          });
        } else if (!isKeywordMethod) {
          // Regular method
          const name = nameToken.lexeme;
          const parameters = this.parseParmList();
          let returnType: AST.Type | undefined;

          if (this.match(TokenType.RETURNS)) {
            returnType = this.parseType();
          }

          return {
            type: "MethodProto",
            kind: {
              kind: "Normal",
              name,
              parameters,
              returnType,
            },
            position: startPosition,
          };
        } else {
          throw this.error(
            this.current!,
            "Expected ':' after keyword method segment"
          );
        }
      }

      if (isKeywordMethod) {
        let returnType: AST.Type | undefined;
        if (this.match(TokenType.RETURNS)) {
          returnType = this.parseType();
        }

        return {
          type: "MethodProto",
          kind: {
            kind: "Keyword",
            segments,
            returnType,
          },
          position: startPosition,
        };
      }

      throw this.error(this.current!, "Expected method prototype");
    }
  }

  private parseMethod(): AST.MethodDecl {
    // We've already consumed the 'method' token
    const startPosition = this.getPosition(this.previous!);

    // Parse method prototype
    const prototype = this.parseMethProto();

    // Parse optional variable declarations
    let variables: AST.VarDecl[] | undefined;
    if (this.match(TokenType.VAR)) {
      variables = this.parseVarDecls();
    }

    // Parse method body
    const body = this.parseStmtList();

    this.consume(TokenType.END_METHOD, "Expected 'endMethod'");

    return {
      type: "MethodDecl",
      prototype,
      variables,
      body,
      position: startPosition,
    };
  }

  private parseStmtList(): AST.Statement[] {
    const statements: AST.Statement[] = [];

    while (
      !this.isAtEnd() &&
      !this.check(TokenType.END_FUNCTION) &&
      !this.check(TokenType.END_METHOD) &&
      !this.check(TokenType.END_IF) &&
      !this.check(TokenType.ELSE) &&
      !this.check(TokenType.ELSE_IF) &&
      !this.check(TokenType.END_WHILE) &&
      !this.check(TokenType.UNTIL) &&
      !this.check(TokenType.END_FOR) &&
      !this.check(TokenType.END_SWITCH) &&
      !this.check(TokenType.CASE) &&
      !this.check(TokenType.DEFAULT) &&
      !this.check(TokenType.END_TRY) &&
      !this.check(TokenType.CATCH)
    ) {
      statements.push(this.parseStatement());
    }

    return statements;
  }

  private parseStatement(): AST.Statement {
    const startPosition = this.getPosition(this.current!);

    // Handle each statement type according to the grammar
    if (this.match(TokenType.IF)) {
      return this.parseIfStatement(startPosition);
    } else if (this.match(TokenType.WHILE)) {
      return this.parseWhileStatement(startPosition);
    } else if (this.match(TokenType.DO)) {
      return this.parseDoUntilStatement(startPosition);
    } else if (this.match(TokenType.FOR)) {
      return this.parseForStatement(startPosition);
    } else if (this.match(TokenType.SWITCH)) {
      return this.parseSwitchStatement(startPosition);
    } else if (this.match(TokenType.TRY)) {
      return this.parseTryStatement(startPosition);
    } else if (this.match(TokenType.THROW)) {
      return this.parseThrowStatement(startPosition);
    } else if (this.match(TokenType.FREE)) {
      const expr = this.parseExpr();
      return {
        type: "FreeStatement",
        expression: expr,
        position: startPosition,
      };
    } else if (this.match(TokenType.DEBUG)) {
      return {
        type: "DebugStatement",
        position: startPosition,
      };
    } else if (this.match(TokenType.BREAK)) {
      return {
        type: "BreakStatement",
        position: startPosition,
      };
    } else if (this.match(TokenType.CONTINUE)) {
      return {
        type: "ContinueStatement",
        position: startPosition,
      };
    } else if (this.match(TokenType.RETURN)) {
      let expression: AST.Expression | undefined;
      if (
        !this.check(TokenType.END_FUNCTION) &&
        !this.check(TokenType.END_METHOD)
      ) {
        expression = this.parseExpr();
      }
      return {
        type: "ReturnStatement",
        expression,
        position: startPosition,
      };
    } else {
      // Handle assignment, function calls, and message sends
      const expr = this.parseExpr();

      // Check for assignment
      if (this.match(TokenType.EQUAL)) {
        const value = this.parseExpr();
        return {
          type: "AssignmentStatement",
          lvalue: this.expressionToLValue(expr),
          expression: value,
          position: startPosition,
        };
      }

      // Check for message sends with chained messages
      if (
        this.check(TokenType.IDENTIFIER) &&
        expr.type === "FieldAccessExpression"
      ) {
        const messages: { message: string; arguments: AST.Expression[] }[] = [];

        do {
          const messageToken = this.consume(
            TokenType.IDENTIFIER,
            "Expected message name"
          );
          const args = this.parseArgList();
          messages.push({
            message: messageToken.lexeme,
            arguments: args,
          });
        } while (this.match(TokenType.DOT));

        return {
          type: "MessageStatement",
          receiver: (expr as AST.FieldAccessExpression).object,
          message: (expr as AST.FieldAccessExpression).field,
          arguments: [], // Initial message args
          chainedMessages: messages,
          position: startPosition,
        };
      }

      // Must be a call statement
      return {
        type: "CallStatement",
        expression: expr as AST.CallExpression,
        position: startPosition,
      };
    }
  }

  private parseIfStatement(startPosition: AST.Position): AST.IfStatement {
    const condition = this.parseExpr();
    const thenBlock = this.parseStmtList();

    const elseIfClauses: {
      condition: AST.Expression;
      block: AST.Statement[];
    }[] = [];
    let elseBlock: AST.Statement[] | undefined;

    while (this.match(TokenType.ELSE_IF)) {
      const elseIfCondition = this.parseExpr();
      const elseIfBlock = this.parseStmtList();
      elseIfClauses.push({
        condition: elseIfCondition,
        block: elseIfBlock,
      });
    }

    if (this.match(TokenType.ELSE)) {
      elseBlock = this.parseStmtList();
    }

    this.consume(TokenType.END_IF, "Expected 'endIf'");

    return {
      type: "IfStatement",
      condition,
      thenBlock,
      elseIfClauses,
      elseBlock,
      position: startPosition,
    };
  }

  private parseWhileStatement(startPosition: AST.Position): AST.WhileStatement {
    const condition = this.parseExpr();
    const body = this.parseStmtList();
    this.consume(TokenType.END_WHILE, "Expected 'endWhile'");

    return {
      type: "WhileStatement",
      condition,
      body,
      position: startPosition,
    };
  }

  private parseDoUntilStatement(
    startPosition: AST.Position
  ): AST.DoUntilStatement {
    const body = this.parseStmtList();
    this.consume(TokenType.UNTIL, "Expected 'until'");
    const condition = this.parseExpr();

    return {
      type: "DoUntilStatement",
      body,
      condition,
      position: startPosition,
    };
  }

  private parseForStatement(startPosition: AST.Position): AST.ForStatement {
    // Check for traditional for loop with parentheses
    if (this.match(TokenType.LEFT_PAREN)) {
      const init = this.parseStmtList();
      this.consume(
        TokenType.SEMICOLON,
        "Expected ';' after for loop initialization"
      );

      let condition: AST.Expression | undefined;
      if (!this.match(TokenType.SEMICOLON)) {
        condition = this.parseExpr();
        this.consume(
          TokenType.SEMICOLON,
          "Expected ';' after for loop condition"
        );
      }

      const update = this.parseStmtList();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after for clauses");

      const body = this.parseStmtList();
      this.consume(TokenType.END_FOR, "Expected 'endFor'");

      return {
        type: "ForStatement",
        variant: "traditional",
        init,
        condition,
        update,
        body,
        position: startPosition,
      };
    }

    // Range-based for loop
    const lvalue = this.expressionToLValue(this.parseExpr());
    this.consume(TokenType.EQUAL, "Expected '=' after for loop variable");
    const start = this.parseExpr();
    this.consume(TokenType.TO, "Expected 'to' in for loop range");
    const end = this.parseExpr();

    let step: AST.Expression | undefined;
    if (this.match(TokenType.BY)) {
      step = this.parseExpr();
    }

    const body = this.parseStmtList();
    this.consume(TokenType.END_FOR, "Expected 'endFor'");

    return {
      type: "ForStatement",
      variant: "range",
      variable: lvalue,
      start,
      end,
      step,
      body,
      position: startPosition,
    };
  }

  private parseSwitchStatement(
    startPosition: AST.Position
  ): AST.SwitchStatement {
    const expression = this.parseExpr();
    const cases: { condition: AST.Expression; body: AST.Statement[] }[] = [];
    let defaultCase: AST.Statement[] | undefined;

    while (!this.check(TokenType.END_SWITCH)) {
      if (this.match(TokenType.CASE)) {
        const condition = this.parseExpr();
        this.consume(TokenType.COLON, "Expected ':' after case condition");
        const body = this.parseStmtList();
        cases.push({ condition, body });
      } else if (this.match(TokenType.DEFAULT)) {
        this.consume(TokenType.COLON, "Expected ':' after default");
        defaultCase = this.parseStmtList();
      } else {
        throw this.error(
          this.current!,
          "Expected 'case' or 'default' in switch statement"
        );
      }
    }

    this.consume(TokenType.END_SWITCH, "Expected 'endSwitch'");

    return {
      type: "SwitchStatement",
      expression,
      cases,
      defaultCase,
      position: startPosition,
    };
  }

  private parseTryStatement(startPosition: AST.Position): AST.TryStatement {
    const body = this.parseStmtList();
    const catches: {
      errorName: string;
      parameters: AST.Parameter[];
      body: AST.Statement[];
    }[] = [];

    while (this.match(TokenType.CATCH)) {
      const errorName = this.consume(
        TokenType.IDENTIFIER,
        "Expected error name"
      ).lexeme;
      const parameters = this.parseParmList();
      this.consume(TokenType.COLON, "Expected ':' after catch parameters");
      const catchBody = this.parseStmtList();
      catches.push({ errorName, parameters, body: catchBody });
    }

    this.consume(TokenType.END_TRY, "Expected 'endTry'");

    return {
      type: "TryStatement",
      body,
      catches,
      position: startPosition,
    };
  }

  private parseThrowStatement(startPosition: AST.Position): AST.ThrowStatement {
    const errorName = this.consume(
      TokenType.IDENTIFIER,
      "Expected error name"
    ).lexeme;
    const arguments_ = this.parseArgList();

    return {
      type: "ThrowStatement",
      errorName,
      arguments: arguments_,
      position: startPosition,
    };
  }

  private expressionToLValue(expr: AST.Expression): AST.LValue {
    switch (expr.type) {
      case "IdentifierExpression":
        return {
          type: "IdentifierLValue",
          name: expr.name,
          position: expr.position,
        };
      case "ArrayAccessExpression":
        return {
          type: "ArrayAccessLValue",
          array: expr.array,
          indices: expr.indices,
          position: expr.position,
        };
      case "FieldAccessExpression":
        return {
          type: "FieldAccessLValue",
          object: expr.object,
          field: expr.field,
          position: expr.position,
        };
      default:
        throw this.error(this.current!, "Invalid left-hand side in assignment");
    }
  }

  private parseType(): AST.Type {
    const startPosition = this.getPosition(this.current!);

    // Handle basic types
    if (this.match(TokenType.CHAR)) {
      return { type: "BasicType", kind: "char", position: startPosition };
    } else if (this.match(TokenType.INT)) {
      return { type: "BasicType", kind: "int", position: startPosition };
    } else if (this.match(TokenType.DOUBLE)) {
      return { type: "BasicType", kind: "double", position: startPosition };
    } else if (this.match(TokenType.BOOL)) {
      return { type: "BasicType", kind: "bool", position: startPosition };
    } else if (this.match(TokenType.VOID)) {
      return { type: "BasicType", kind: "void", position: startPosition };
    } else if (this.match(TokenType.TYPE_OF_NULL)) {
      return { type: "BasicType", kind: "typeOfNull", position: startPosition };
    } else if (this.match(TokenType.ANY_TYPE)) {
      return { type: "BasicType", kind: "anyType", position: startPosition };
    }

    // Handle pointer types
    else if (this.match(TokenType.PTR)) {
      this.consume(TokenType.TO, "Expected 'to' after 'ptr'");
      const elementType = this.parseType();
      return {
        type: "PointerType",
        elementType,
        position: startPosition,
      };
    }

    // Handle record types
    else if (this.match(TokenType.RECORD)) {
      const fields: AST.VarDecl[] = [];

      // Parse fields until endRecord
      while (!this.check(TokenType.END_RECORD)) {
        fields.push(this.parseVarDecl());
      }

      this.consume(TokenType.END_RECORD, "Expected 'endRecord'");

      return {
        type: "RecordType",
        fields,
        position: startPosition,
      };
    }

    // Handle array types
    else if (this.match(TokenType.ARRAY)) {
      // Parse optional dimensions
      const dimensions: (AST.Expression | null)[] = [];

      if (this.match(TokenType.LEFT_BRACKET)) {
        do {
          if (this.match(TokenType.STAR)) {
            dimensions.push(null); // Dynamic size
          } else {
            dimensions.push(this.parseExpr());
          }
        } while (this.match(TokenType.COMMA));

        this.consume(
          TokenType.RIGHT_BRACKET,
          "Expected ']' after array dimensions"
        );
      }

      this.consume(TokenType.OF, "Expected 'of' in array type");
      const elementType = this.parseType();

      return {
        type: "ArrayType",
        dimensions,
        elementType,
        position: startPosition,
      };
    }

    // Handle function types
    else if (this.match(TokenType.FUNCTION)) {
      // Parse parameter types
      this.consume(TokenType.LEFT_PAREN, "Expected '(' in function type");
      const parameters: AST.Type[] = [];

      if (!this.check(TokenType.RIGHT_PAREN)) {
        do {
          parameters.push(this.parseType());
        } while (this.match(TokenType.COMMA));
      }

      this.consume(
        TokenType.RIGHT_PAREN,
        "Expected ')' after function parameters"
      );

      // Parse optional return type
      let returnType: AST.Type | undefined;
      if (this.match(TokenType.RETURNS)) {
        returnType = this.parseType();
      }

      return {
        type: "FunctionType",
        parameters,
        returnType,
        position: startPosition,
      };
    }

    // If none of the above, it must be a named type
    else {
      return this.parseNamedType();
    }
  }

  private parseNamedType(): AST.NamedType {
    const startPosition = this.getPosition(this.current!);
    const name = this.consume(
      TokenType.IDENTIFIER,
      "Expected type name"
    ).lexeme;

    // Parse optional type arguments
    let typeArguments: AST.Type[] | undefined;
    if (this.match(TokenType.LEFT_BRACKET)) {
      typeArguments = [];
      do {
        typeArguments.push(this.parseType());
      } while (this.match(TokenType.COMMA));

      this.consume(
        TokenType.RIGHT_BRACKET,
        "Expected ']' after type arguments"
      );
    }

    return {
      type: "NamedType",
      name,
      typeArguments,
      position: startPosition,
    };
  }

  private parseTypeList(): AST.NamedType[] {
    const types: AST.NamedType[] = [];

    do {
      types.push(this.parseNamedType());
    } while (this.match(TokenType.COMMA));

    return types;
  }

  private parseConstructor(): AST.Constructor {
    const startPosition = this.getPosition(this.current!);

    // Parse the type being constructed
    const constructorType = this.parseType();

    let initialization: AST.ConstructorInit;

    // Check for ClassRecordInit or ArrayInit
    if (this.check(TokenType.LEFT_BRACE)) {
        this.advance()
      if (this.peekNext().type == TokenType.EQUAL) {
        // ClassRecordInit if '=' after brace
        this.currentIndex--;
        this.current = this.tokens[this.currentIndex - 1];
        initialization = this.parseClassRecordInit();
      } else {
        // ArrayInit otherwise
        this.currentIndex--;
        this.current = this.tokens[this.currentIndex - 1];
        initialization = this.parseArrayInit();
      }
    }

    return {
      type: "Constructor",
      constructorType,
      initialization,
      position: startPosition,
    };
  }

  private parseClassRecordInit(): AST.ClassRecordInit {
    const startPosition = this.getPosition(this.current!);

    this.consume(TokenType.LEFT_BRACE, "Expected '{' after class/record initialization");

    const initializers: { field: string; value: AST.Expression }[] = [];

    do {
      if (initializers.length > 0) {
        this.consume(
          TokenType.COMMA,
          "Expected ',' between field initializers"
        );
      }

      const fieldName = this.consume(
        TokenType.IDENTIFIER,
        "Expected field name"
      ).lexeme;
      this.consume(TokenType.EQUAL, "Expected '=' after field name");
      const value = this.parseExpr();

      initializers.push({ field: fieldName, value });
    } while (!this.check(TokenType.RIGHT_BRACE) && this.match(TokenType.COMMA));

    this.consume(
      TokenType.RIGHT_BRACE,
      "Expected '}' after field initializers"
    );

    return {
      type: "ClassRecordInit",
      initializers,
      position: startPosition,
    };
  }

  private parseArrayInit(): AST.ArrayInit {
    const startPosition = this.getPosition(this.current!);

    this.consume(TokenType.LEFT_BRACE, "Expected '{' after array initialization");

    const initializers: { index?: AST.Expression; value: AST.Expression }[] =
      [];

    do {
      if (initializers.length > 0) {
        this.consume(
          TokenType.COMMA,
          "Expected ',' between array initializers"
        );
      }

      let index: AST.Expression | undefined;
      let value: AST.Expression;

      // Check for index specification
      if (this.peekNext().type === TokenType.OF) {
        index = this.parseExpr();
        this.consume(
          TokenType.OF,
          "Expected 'of' after index in array initializer"
        );
      }

      value = this.parseExpr();
      initializers.push({ index, value });
    } while (!this.check(TokenType.RIGHT_BRACE) && this.match(TokenType.COMMA));

    this.consume(
      TokenType.RIGHT_BRACE,
      "Expected '}' after array initializers"
    );

    return {
      type: "ArrayInit",
      initializers,
      position: startPosition,
    };
  }

  // Main expression parser that handles all precedence levels
  private parseExpr(): AST.Expression {
    return this.parseKeywordMessage();
  }

  // Precedence level methods from lowest to highest
  private parseKeywordMessage(): AST.Expression {
    let expr = this.parseInfixOp();

    // Handle keyword messages (e.g., "at:x put:y")
    if (this.check(TokenType.IDENTIFIER)) {
      const segments: { message: string; arguments: AST.Expression[] }[] = [];

      while (
        this.check(TokenType.IDENTIFIER) &&
        this.peekNext().type === TokenType.COLON
      ) {
        const messageToken = this.advance();
        this.advance(); // consume colon
        const arg = this.parseInfixOp();
        segments.push({
          message: messageToken.lexeme,
          arguments: [arg],
        });
      }

      if (segments.length > 0) {
        return {
          type: "MessageExpression",
          receiver: expr,
          message: segments[0].message,
          arguments: segments[0].arguments,
          position: expr.position,
        };
      }
    }

    return expr;
  }

  private parseInfixOp(): AST.Expression {
    let expr = this.parseLogicalOr();

    while (
      this.check(TokenType.IDENTIFIER) &&
      this.isInfixOperator(this.current!.lexeme)
    ) {
      const operator = this.advance().lexeme;
      const right = this.parseLogicalOr();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseLogicalOr(): AST.Expression {
    let expr = this.parseLogicalAnd();

    while (this.match(TokenType.LOGICAL_OR)) {
      const operator = this.previous!.lexeme;
      const right = this.parseLogicalAnd();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseLogicalAnd(): AST.Expression {
    let expr = this.parseBitwiseOr();

    while (this.match(TokenType.LOGICAL_AND)) {
      const operator = this.previous!.lexeme;
      const right = this.parseBitwiseOr();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseBitwiseOr(): AST.Expression {
    let expr = this.parseBitwiseXor();

    while (this.match(TokenType.OR)) {
      const operator = this.previous!.lexeme;
      const right = this.parseBitwiseXor();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseBitwiseXor(): AST.Expression {
    let expr = this.parseBitwiseAnd();

    while (this.match(TokenType.XOR)) {
      const operator = this.previous!.lexeme;
      const right = this.parseBitwiseAnd();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseBitwiseAnd(): AST.Expression {
    let expr = this.parseEquality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous!.lexeme;
      const right = this.parseEquality();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseEquality(): AST.Expression {
    let expr = this.parseComparison();

    while (this.match(TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL)) {
      const operator = this.previous!.lexeme;
      const right = this.parseComparison();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseComparison(): AST.Expression {
    let expr = this.parseShift();

    while (
      this.match(
        TokenType.LESS,
        TokenType.LESS_EQUAL,
        TokenType.GREATER,
        TokenType.GREATER_EQUAL
      )
    ) {
      const operator = this.previous!.lexeme;
      const right = this.parseShift();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseShift(): AST.Expression {
    let expr = this.parseAdditive();

    while (
      this.match(
        TokenType.SHIFT_LEFT,
        TokenType.SHIFT_RIGHT,
        TokenType.SHIFT_RIGHT_UNSIGNED
      )
    ) {
      const operator = this.previous!.lexeme;
      const right = this.parseAdditive();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseAdditive(): AST.Expression {
    let expr = this.parseMultiplicative();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous!.lexeme;
      const right = this.parseMultiplicative();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseMultiplicative(): AST.Expression {
    let expr = this.parseUnary();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.previous!.lexeme;
      const right = this.parseUnary();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        position: expr.position,
      };
    }

    return expr;
  }

  private parseUnary(): AST.Expression {
    if (
      this.match(
        TokenType.MINUS,
        TokenType.BANG,
        TokenType.STAR,
        TokenType.AND
      )
    ) {
      const operator = this.previous!.lexeme;
      const operand = this.parseUnary();
      return {
        type: "UnaryExpression",
        operator,
        operand,
        position: this.getPosition(this.previous!),
      };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): AST.Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.DOT)) {
        // Handle method calls and field access
        const name = this.consume(
          TokenType.IDENTIFIER,
          "Expected identifier after '.'"
        ).lexeme;
        if (this.check(TokenType.LEFT_PAREN)) {
          const args = this.parseArgList();
          expr = {
            type: "MessageExpression",
            receiver: expr,
            message: name,
            arguments: args,
            position: expr.position,
          };
        } else {
          expr = {
            type: "FieldAccessExpression",
            object: expr,
            field: name,
            position: expr.position,
          };
        }
      } else if (this.match(TokenType.LEFT_BRACKET)) {
        // Array access
        const indices: AST.Expression[] = [this.parseExpr()];
        while (this.match(TokenType.COMMA)) {
          indices.push(this.parseExpr());
        }
        this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after array index");
        expr = {
          type: "ArrayAccessExpression",
          array: expr,
          indices,
          position: expr.position,
        };
      } else if (this.match(TokenType.AS_PTR_TO)) {
        const targetType = this.parseType();
        expr = {
          type: "TypeCastExpression",
          kind: "asPtrTo",
          expression: expr,
          targetType,
          position: expr.position,
        };
      } else if (this.match(TokenType.AS_INTEGER)) {
        expr = {
          type: "TypeCastExpression",
          kind: "asInteger",
          expression: expr,
          position: expr.position,
        };
      } else if (this.match(TokenType.ARRAY_SIZE)) {
        expr = {
          type: "ArrayAccessExpression",
          array: expr,
          indices: [],
          position: expr.position,
        };
      } else if (
        this.match(TokenType.IS_INSTANCE_OF) ||
        this.match(TokenType.IS_KIND_OF)
      ) {
        const kind =
          this.previous!.type === TokenType.IS_INSTANCE_OF
            ? "isInstanceOf"
            : "isKindOf";
        const checkType = this.parseType();
        expr = {
          type: "TypeCheckExpression",
          kind,
          expression: expr,
          checkType,
          position: expr.position,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): AST.Expression {
    const startPosition = this.getPosition(this.current!);

    if (this.match(TokenType.TRUE, TokenType.FALSE)) {
      return {
        type: "LiteralExpression",
        kind: this.previous!.type === TokenType.TRUE ? "true" : "false",
        value: this.previous!.type === TokenType.TRUE,
        position: startPosition,
      };
    }

    if (this.match(TokenType.NULL)) {
      return {
        type: "LiteralExpression",
        kind: "null",
        value: null,
        position: startPosition,
      };
    }

    if (this.match(TokenType.SELF)) {
      return {
        type: "LiteralExpression",
        kind: "self",
        value: "self",
        position: startPosition,
      };
    }

    if (this.match(TokenType.SUPER)) {
      return {
        type: "LiteralExpression",
        kind: "super",
        value: "super",
        position: startPosition,
      };
    }

    if (this.match(TokenType.INTEGER_LITERAL)) {
      return {
        type: "LiteralExpression",
        kind: "INTEGER",
        value: this.previous!.literal,
        position: startPosition,
      };
    }

    if (this.match(TokenType.DOUBLE_LITERAL)) {
      return {
        type: "LiteralExpression",
        kind: "DOUBLE",
        value: this.previous!.literal,
        position: startPosition,
      };
    }

    if (this.match(TokenType.HEX_LITERAL)) {
      return {
        type: "LiteralExpression",
        kind: "STRING",
        value: this.previous!.literal,
        position: startPosition,
      };
    }

    if (this.match(TokenType.CHAR_LITERAL)) {
      return {
        type: "LiteralExpression",
        kind: "CHAR",
        value: this.previous!.literal,
        position: startPosition,
      };
    }

    if (this.match(TokenType.STRING_LITERAL)) {
      return {
        type: "LiteralExpression",
        kind: "STRING",
        value: this.previous!.literal,
        position: startPosition,
      };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const name = this.previous!.lexeme;
      if (this.check(TokenType.LEFT_PAREN)) {
        const args = this.parseArgList();
        return {
          type: "CallExpression",
          callee: {
            type: "IdentifierExpression",
            name,
            position: startPosition,
          },
          arguments: args,
          position: startPosition,
        };
      }
      return {
        type: "IdentifierExpression",
        name,
        position: startPosition,
      };
    }

    if (this.match(TokenType.FUNCTION)) {
      // Convert NamelessFunctionDecl to Expression
      const namelessFun = this.parseNamelessFunction();
      return {
        type: "NamelessFunctionExpression",
        function: namelessFun,
        position: namelessFun.position,
      };
    }

    if (this.match(TokenType.NEW)) {
      return {
        type: "NewExpression",
        constructor: this.parseConstructor(),
        position: startPosition,
      };
    }

    if (this.match(TokenType.ALLOC)) {
      return {
        type: "AllocExpression",
        constructor: this.parseConstructor(),
        position: startPosition,
      };
    }

    if (this.match(TokenType.SIZE_OF)) {
      return {
        type: "SizeOfExpression",
        targetType: this.parseType(),
        position: startPosition,
      };
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.parseExpr();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression");
      return expr;
    }

    throw this.error(this.current!, "Expected expression");
  }

  // Helper method to check if an identifier is an infix operator
  private isInfixOperator(identifier: string): boolean {
    // Add your custom infix operators here
    const infixOperators = new Set(["plus", "minus", "times", "dividedBy"]);
    return infixOperators.has(identifier);
  }

  private parseOperator(errorMessage: string): string {
    // Try to match any operator token
    if (
      this.match(
        // Arithmetic operators
        TokenType.PLUS, // +
        TokenType.MINUS, // -
        TokenType.STAR, // *
        TokenType.SLASH, // /
        TokenType.PERCENT, // %

        // Bitwise operators
        TokenType.AND, // &
        TokenType.OR, // |
        TokenType.XOR, // ^
        TokenType.SHIFT_LEFT, // <<
        TokenType.SHIFT_RIGHT, // >>
        TokenType.SHIFT_RIGHT_UNSIGNED, // >>>

        // Comparison operators
        TokenType.EQUAL_EQUAL, // ==
        TokenType.BANG_EQUAL, // !=
        TokenType.LESS, // <
        TokenType.LESS_EQUAL, // <=
        TokenType.GREATER, // >
        TokenType.GREATER_EQUAL // >=
      )
    ) {
      return this.previous!.lexeme;
    }

    throw this.error(this.current!, errorMessage);
  }

  private isNewSection(): boolean {
    return (
      this.check(TokenType.CONST) ||
      this.check(TokenType.ERRORS) ||
      this.check(TokenType.VAR) ||
      this.check(TokenType.ENUM) ||
      this.check(TokenType.TYPE) ||
      this.check(TokenType.FUNCTIONS) ||
      this.check(TokenType.INTERFACE) ||
      this.check(TokenType.CLASS) ||
      this.check(TokenType.BEHAVIOR) ||
      this.check(TokenType.END_CODE) ||
      this.check(TokenType.END_HEADER)
    );
  }

  // --------------------------- Helper Methods ---------------------------

  // Advance a single token
  private advance(): Token {
    this.previous = this.current;
    if (this.currentIndex < this.tokens.length) {
      this.current = this.tokens[this.currentIndex++];
    }
    return this.previous!;
  }

  // Check if the current token is equal to this type
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.current!.type === type;
  }

  // Check if the current token is any of these tokens
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  // Consume the current token of 'type' and advance
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.current!, message);
  }

  private isAtEnd(): boolean {
    return this.current!.type === TokenType.EOF;
  }

  private error(token: Token, message: string): ParseError {
    return new ParseError(message, token);
  }

  private getPosition(token: Token): AST.Position {
    return {
      line: token.line,
      column: token.column,
      position: token.position,
      file: "filename", // You'll need to track this
    };
  }

  private peekNext(): Token {
    if (this.currentIndex >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // Return EOF token
    }
    return this.tokens[this.currentIndex];
  }

  /*
    repetition of zero-or-more:
    { }
    one-or-more
    { }+
    store Material:
    < >
    optional Material:
    [ ]
    multiple Options:
    |

    data to store:
        Header and Code file IDs
    data to store per file:
        uses [packageID]
        constants <constantID, Value>
        errors [errorID]
        enums <enumID, Value>
        typeDecls <typeID, Value>
        ...

    
    Start
        if filename.endsWith(".h"):
            HeaderFile
        else if filename.endsWith(".k"):
            CodeFile
        else if firstTokens == "header" <ID>
            HeaderFile
        else if firstTokens == "code" <ID>
            CodeFile
        else
            throw error on first line (failed to parse)

    --------------------- Page 1 ---------------------
    
    HeaderFile
        header <HeaderID>
            [ Uses ]
            { Constants
            | Errors
            | VarDecls
            | Enum
            | TypeDefs
            | FunctionProtos
            | Interface
            | Class }
        endHeader

    CodeFile
        code <CodeID>
            { Constants
            | Errors
            | VarDecls
            | Enum
            | TypeDefs
            | Function
            | Interface
            | Class
            | Behavior }
        endCode
    
    Interface
        interface <InterfaceID> [ TypeParms ] 
                                [ extends TypeList ]
                                [ messages { MethProto }+ ]
        endInterface
    
    Class
        class <ClassID> [ TypeParms ]
                        [ implements TypeList ]
                        [ superclass NamedType ]
                        [ fields { Decl }+ ]
                        [ methods { MethProto }+ ]
        endClass
    
    Behavior
        behavior <BehaviorID>
            { Method }
        endBehavior

    Uses
        uses OtherPackage { , OtherPackage }
    
    OtherPackage
        <PackageID> [ renaming Rename { , Rename } ]    // package renaming
        | String      [ renaming Rename { , Rename } ]  // Variable renaming

    Rename
        <ID> to <ID>

    TypeParms
        '[' ID : Type { , ID : Type } ']'

    Constants
        const { <ConstID> = Expr }+

    Decl
        ID { , ID } : Type
    
    VarDecl
        <Decl> [ = Expr2 ]

    VarDecls
        var { VarDecl }+

    Errors
        errors { <ErrorID> ParmList }+
        
    TypeDefs
        type { }
    
    Enum
        enum <enumID> [ = Expr ] { , <enumID> }
    
    IDList
        ID { , ID }
    
    ArgList
        ( ) | ( Expr { , Expr } )

    ParmList
        ( ) | ( Decl {, Decl } )

    --------------------- Page 2 ---------------------

    FunProto
        ID ParmList [ returns Type ]
    
    FunctionProtos
        functions { [ external ] FunProto }+

    Function
        function <FunctionID> ParmList [ returns Type ]
            [ VarDecls ]
            StmtLst
        endFunction

    NamelessFunction
        function ParmList [ returns Type ]
            [ VarDecls ]
            StmtLst
        endFunction

    MethProto
        <MethodID> ParmList [ returns Type ]
        | infix OPERATOR ( ID : Type ) returns Type
        | prefix OPERATOR ( ) returns Type
        | { ID : ( ID : Type ) }+ [ returns Type ]

    Method
        method MethodProto
            [ VarDecls ]
            StmtList
        endMethod

    StmtList
        { Statement }

    Statement
        if Expr StmtList
            { elseIf Expr StmtList }
            { else StmtList }
        endIf
        | LValue = Expr
        | ID ArgList
        | Expr { ID : Expr }+
        | Expr . ID ArgList
        | while Expr
            StmtList
          endWhile
        | do
            StmtList
          until Expr
        | break
        | continue
        | return [ Expr ]
        | for LValue = Expr to Expr [ by Expr ]
            StmtList
          endFor
        | for ( StmtList ; [ Expr ] ; StmtList )
            StmtList
          endFor
        | switch Expr
            { case Expr : StmtList }
            [ default : StmtList ]
          endSwitch
        | try StmtList
            { catch ID ParmList : StmtList }+
          endTry
        | throw ID ArgList
        | free Expr
        | debug

    --------------------- Page 3 ---------------------

    Type
        char
        | int
        | double
        | bool
        | void
        | typeOfNull
        | anyType
        | ptr to Type
        | record { Decl }+ endRecord
        | array [ '[' Dimension { , Dimension } ']' ] of Type
        | function ( [ Type { , Type } ] ) [ returns Type ]

    NamedType
        ID [ '[' Type { , Type } ']' ]

    TypeList
        NamedType { , NamedType }

    Dimension
        * | Expr

    Constructor
        Type ClassRecordInit
        | Type ArrayInit
        | Type

    ClassRecordInit
        ID '{' ID = Expr { , ID = Expr } '}'

    ArrayInit
        ID '{' [ Expr of ] Expr { , [ Expr of ] Expr } '}'

    LValue
        Expr

    Expressions
        Expr   --> Expr2 { ID : Expr2 }
        Expr2  --> Expr3 { OPERATOR Expr3 }
        Expr3  --> Expr5 { '||' Expr5 }
        Expr5  --> Expr6 { && Expr6 }
        Expr6  --> Expr7 { '|' Expr7 }
        Expr7  --> Expr8 { ^ Expr8 }
        Expr8  --> Expr9 { & Expr9 }
        Expr9  --> Expr10 { == Expr10
                            | != Expr10 }
        Expr10 --> Expr11 { < Expr11
                            | <= Expr11
                            | > Expr11
                            | >= Expr11 }
        Expr11 --> Expr12 { << Expr12
                            | >> Expr12
                            | >>> Expr12 }
        Expr12 --> Expr13 { + Expr13
                            | - Expr13 }
        Expr13 --> Expr15 { * Expr15
                            | / Expr15
                            | % Expr15 }
        Expr15 --> OPERATOR Expr15 | Expr16
        Expr16 --> Expr17 { . ID ArgList
                            | . ID
                            | asPtrTo Type
                            | asInteger
                            | arraySize
                            | isInstanceOf Type
                            | isKindOf Type
                            | '[' Expr { , Expr } ']' }

    --------------------- Page 4 ---------------------

        Expr17 --> ( Expr )
                    | null
                    | true
                    | false
                    | self
                    | super
                    | INTEGER
                    | DOUBLE
                    | CHAR
                    | STRING
                    | NamelessFunction
                    | ID
                    | ID ArgList
                    | new Constructor
                    | alloc Constructor
                    | sizeOf Type

    */
}
