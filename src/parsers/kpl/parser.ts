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
    this.tokens = tokens.filter(token => token.type !== TokenType.COMMENT);
    this.advance(); // Load first token
}

  parse(): AST.Program {
    try {
      return this.parseProgram();
    } catch (error) {
      if (error instanceof ParseError) {
        // Handle parse error
        console.error(error.message);
        // You might want to return a partial AST or throw
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

    // Parse declarations until we hit endHeader
    while (!this.isAtEnd() && !this.check(TokenType.END_HEADER)) {
      if (this.match(TokenType.USES)) {
        if (uses) {
          throw this.error(
            this.previous!,
            "Multiple 'uses' declarations in header"
          );
        }
        // uses = this.parseUses();
        // TODO
        console.log("Parsing Uses")
        continue;
      }

      // Parse other declarations
      if (this.match(TokenType.CONST)) {
        // declarations.push(this.parseConstants());
        // TODO uncomment
        console.log("Parsing constants")
      } else { // TODO add more
        throw this.error(
          this.current!,
          "Expected declaration (const, errors, class, etc.)"
        );
      }
    }

    // Consume the endHeader token
    this.consume(TokenType.END_HEADER, "Expected 'endHeader'");

    return {
      type: "HeaderFile",
      id: idToken.lexeme,
      uses: uses,
      declarations: declarations,
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
        // declarations.push(this.parseConstants());
        console.log("Parsing constants")
        // TODO: add more
      } else {
        throw this.error(
          this.current!,
          "Expected declaration (const, function, class, behavior, etc.)"
        );
      }
    }

    // Consume the endCode token
    this.consume(TokenType.END_CODE, "Expected 'endCode'");

    return {
      type: "CodeFile",
      id: idToken.lexeme,
      declarations: declarations,
      position: startPosition,
    };
  }

// TODO: uncomment
//   private parseUses(): AST.Uses {
//     // We've already consumed the 'uses' token
//     const startPosition = this.getPosition(this.previous!);
//     const packages: AST.Package[] = [];

//     // Parse first package (required)
//     packages.push(this.parseOtherPackage());

//     // Parse additional packages separated by commas
//     while (this.match(TokenType.COMMA)) {
//       packages.push(this.parseOtherPackage());
//     }

//     return {
//       type: "Uses",
//       packages: packages,
//       position: startPosition,
//     };
//   }

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

 private parseInterface(): void {}
 private parseClass(): void {}
 private parseBehavior(): void {}
 private parseOtherPackage(): void {}
 private parseRename(): void {}
 private parseTypeParms(): void {}
 private parseConstants(): void {}
 private parseDecl(): void {}
 private parseVarDecl(): void {}
 private parseVarDecls(): void {}
 private parseErrors(): void {}
 private parseTypeDefs(): void {}
 private parseEnum(): void {}
 private parseIDList(): void {}
 private parseArgList(): void {}
 private parseParmList(): void {}
 private parseFunProto(): void {}
 private parseFunctionProtos(): void {}
 private parseFunction(): void {}
 private parseNamelessFunction(): void {}
 private parseMethProto(): void {}
 private parseMethod(): void {}
 private parseStmtList(): void {}
 private parseStatement(): void {}
 private parseType(): void {}
 private parseNamedType(): void {}
 private parseTypeList(): void {}
 private parseDimension(): void {}
 private parseConstructor(): void {}
 private parseClassRecordInit(): void {}
 private parseArrayInit(): void {}
 private parseLValue(): void {}
 private parseExpressions(): void {}
  
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
                                [ messages { MessageProto }+ ]
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
        ID '{' [ Expr of ] Expr
        |  { , [ Expr of ] Expr } '}

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
