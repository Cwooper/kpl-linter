// kpl ast types

// Base types for all AST nodes
interface Position {
  line: number;
  column: number;
  file: string;
}

interface Node {
  type: string;
  position: Position;
}

// Top-level constructs
interface Program extends Node {
  type: "Program";
  files: (HeaderFile | CodeFile)[];
}

interface HeaderFile extends Node {
  type: "HeaderFile";
  id: string;
  uses?: Uses;
  declarations: Declaration[];
}

interface CodeFile extends Node {
  type: "CodeFile";
  id: string;
  declarations: Declaration[];
}

// Uses and package handling
interface Uses extends Node {
  type: "Uses";
  packages: Package[];
}

interface Package extends Node {
  type: "Package";
  name: string | { value: string; type: "STRING" };
  renaming?: Rename[];
}

interface Rename extends Node {
  type: "Rename";
  from: string;
  to: string;
}

// Declarations
type Declaration =
  | ConstantDecl
  | ErrorDecl
  | VarDecl
  | EnumDecl
  | TypeDecl
  | FunctionProto
  | FunctionDecl
  | InterfaceDecl
  | ClassDecl
  | BehaviorDecl;

interface ConstantDecl extends Node {
  type: "ConstantDecl";
  name: string;
  value: Expression;
}

interface ErrorDecl extends Node {
  type: "ErrorDecl";
  name: string;
  parameters: Parameter[];
}

interface VarDecl extends Node {
  type: "VarDecl";
  names: string[];
  varType: Type;
  initializer?: Expression;
}

interface EnumDecl extends Node {
  type: "EnumDecl";
  name: string;
  baseValue?: Expression;
  members: string[];
}

interface TypeDecl extends Node {
  type: "TypeDecl";
  name: string;
  value: Type;
}

interface Parameter extends Node {
  type: "Parameter";
  name: string;
  paramType: Type;
}

// Types
interface Type extends Node {
  type: "Type";
  kind: TypeKind;
}

type TypeKind =
  | {
      kind: "Basic";
      basicType:
        | "char"
        | "int"
        | "double"
        | "bool"
        | "void"
        | "typeOfNull"
        | "anyType";
    }
  | { kind: "Pointer"; elementType: Type }
  | { kind: "Record"; fields: VarDecl[] }
  | { kind: "Array"; dimensions: (Expression | null)[]; elementType: Type }
  | { kind: "Function"; parameters: Type[]; returnType?: Type }
  | { kind: "Named"; name: string; typeArguments?: Type[] };

// Functions and Methods
interface FunctionProto extends Node {
  type: "FunctionProto";
  name: string;
  parameters: Parameter[];
  returnType?: Type;
  isExternal: boolean;
}

interface FunctionDecl extends Node {
  type: "FunctionDecl";
  name: string;
  parameters: Parameter[];
  returnType?: Type;
  variables?: VarDecl[];
  body: Statement[];
}

interface NamelessFunctionDecl extends Node {
  type: "NamelessFunctionDecl";
  parameters: Parameter[];
  returnType?: Type;
  variables?: VarDecl[];
  body: Statement[];
}

// Statements
type Statement =
  | IfStatement
  | WhileStatement
  | DoUntilStatement
  | ForStatement
  | AssignmentStatement
  | CallStatement
  | ReturnStatement
  | BreakStatement
  | ContinueStatement
  | SwitchStatement
  | TryStatement
  | ThrowStatement
  | FreeStatement
  | DebugStatement;

interface IfStatement extends Node {
  type: "IfStatement";
  condition: Expression;
  thenBlock: Statement[];
  elseIfClauses: {
    condition: Expression;
    block: Statement[];
  }[];
  elseBlock?: Statement[];
}

interface WhileStatement extends Node {
  type: "WhileStatement";
  condition: Expression;
  body: Statement[];
}

interface DoUntilStatement extends Node {
  type: "DoUntilStatement";
  body: Statement[];
  condition: Expression;
}

interface ForStatement extends Node {
  type: "ForStatement";
  variant: "traditional" | "range";
  // For traditional for loop
  init?: Statement[];
  condition?: Expression;
  update?: Statement[];
  // For range-based for loop
  variable?: LValue;
  start?: Expression;
  end?: Expression;
  step?: Expression;
  body: Statement[];
}

interface AssignmentStatement extends Node {
  type: "AssignmentStatement";
  lvalue: LValue;
  expression: Expression;
}

interface CallStatement extends Node {
  type: "CallStatement";
  expression: CallExpression | MessageExpression;
}

interface ReturnStatement extends Node {
  type: "ReturnStatement";
  expression?: Expression;
}

interface BreakStatement extends Node {
  type: "BreakStatement";
}

interface ContinueStatement extends Node {
  type: "ContinueStatement";
}

interface SwitchStatement extends Node {
  type: "SwitchStatement";
  expression: Expression;
  cases: {
    condition: Expression;
    body: Statement[];
  }[];
  defaultCase?: Statement[];
}

interface TryStatement extends Node {
  type: "TryStatement";
  body: Statement[];
  catches: {
    errorName: string;
    parameters: Parameter[];
    body: Statement[];
  }[];
}

interface ThrowStatement extends Node {
  type: "ThrowStatement";
  errorName: string;
  arguments: Expression[];
}

interface FreeStatement extends Node {
  type: "FreeStatement";
  expression: Expression;
}

interface DebugStatement extends Node {
  type: "DebugStatement";
}

// LValue
interface LValue extends Node {
  type: "LValue";
  kind: LValueKind;
}

type LValueKind =
  | { kind: "Identifier"; name: string }
  | { kind: "ArrayAccess"; array: Expression; indices: Expression[] }
  | { kind: "FieldAccess"; object: Expression; field: string };

// Expressions
type Expression =
  | BinaryExpression
  | UnaryExpression
  | LiteralExpression
  | IdentifierExpression
  | CallExpression
  | MessageExpression
  | MemberExpression
  | NewExpression
  | AllocExpression
  | SizeOfExpression
  | TypeCheckExpression
  | ArrayAccessExpression
  | TypeCastExpression;

interface BinaryExpression extends Node {
  type: "BinaryExpression";
  operator: string;
  left: Expression;
  right: Expression;
}

interface UnaryExpression extends Node {
  type: "UnaryExpression";
  operator: string;
  operand: Expression;
}

interface LiteralExpression extends Node {
  type: "LiteralExpression";
  kind: "INTEGER" | "DOUBLE" | "CHAR" | "STRING" | "true" | "false" | "null";
  value: number | string | boolean | null;
}

interface IdentifierExpression extends Node {
  type: "IdentifierExpression";
  name: string;
}

interface CallExpression extends Node {
  type: "CallExpression";
  callee: Expression;
  arguments: Expression[];
}

interface MessageExpression extends Node {
  type: "MessageExpression";
  receiver: Expression;
  message: string;
  arguments: Expression[];
}

interface MemberExpression extends Node {
  type: "MemberExpression";
  object: Expression;
  property: string;
}

interface NewExpression extends Node {
  type: "NewExpression";
  constructor: Constructor;
}

interface AllocExpression extends Node {
  type: "AllocExpression";
  constructor: Constructor;
}

interface Constructor extends Node {
  type: "Constructor";
  constructorType: Type;
  kind: ConstructorKind;
}

type ConstructorKind =
  | {
      kind: "ClassRecord";
      initializers: { field: string; value: Expression }[];
    }
  | {
      kind: "Array";
      initializers: { index?: Expression; value: Expression }[];
    };

interface SizeOfExpression extends Node {
  type: "SizeOfExpression";
  sizeType: Type;
}

interface TypeCheckExpression extends Node {
  type: "TypeCheckExpression";
  kind: "isInstanceOf" | "isKindOf";
  expression: Expression;
  checkType: Type;
}

interface ArrayAccessExpression extends Node {
  type: "ArrayAccessExpression";
  array: Expression;
  indices: Expression[];
}

interface TypeCastExpression extends Node {
  type: "TypeCastExpression";
  kind: "asPtrTo" | "asInteger";
  expression: Expression;
  targetType?: Type; // Only for asPtrTo
}

// OOP Constructs
interface InterfaceDecl extends Node {
  type: "InterfaceDecl";
  name: string;
  typeParameters?: TypeParameter[];
  extends?: Type[];
  messages?: MethodProto[];
}

interface ClassDecl extends Node {
  type: "ClassDecl";
  name: string;
  typeParameters?: TypeParameter[];
  implements?: Type[];
  superclass?: Type;
  fields?: VarDecl[];
  methods?: MethodProto[];
}

interface BehaviorDecl extends Node {
  type: "BehaviorDecl";
  name: string;
  methods: MethodDecl[];
}

interface TypeParameter extends Node {
  type: "TypeParameter";
  name: string;
  constraint: Type;
}

interface MethodProto extends Node {
  type: "MethodProto";
  kind: MethodKind;
}

type MethodKind =
  | { kind: "Normal"; name: string; parameters: Parameter[]; returnType?: Type }
  | { kind: "Infix"; operator: string; parameter: Parameter; returnType: Type }
  | { kind: "Prefix"; operator: string; returnType: Type }
  | {
      kind: "Keyword";
      segments: { name: string; parameter: Parameter }[];
      returnType?: Type;
    };

interface MethodDecl extends Node {
  type: "MethodDecl";
  prototype: MethodProto;
  variables?: VarDecl[];
  body: Statement[];
}
