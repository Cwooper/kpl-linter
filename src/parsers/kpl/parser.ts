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
  /*
    Repetition of zero-or-more:
    { }
    One-or-more
    { }+
    Store Material:
    < >
    Optional Material:
    [ ]
    Multiple Options:
    |

    Data to store:
        Header and Code file IDs
    Data to store per file:
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
