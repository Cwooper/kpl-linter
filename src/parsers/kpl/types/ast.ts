// kpl ast types

// Base types for all AST nodes
export interface Position {
  line: number;
  column: number;
  file: string;
}

export interface Node {
  type: string;
  position: Position;
}

// Top-level constructs
export interface Program extends Node {
  type: "Program";
  files: (HeaderFile | CodeFile)[];
}

export interface HeaderFile extends Node {
  type: "HeaderFile";
  id: string;
  uses?: Uses;
  declarations: Declaration[];
}

export interface CodeFile extends Node {
  type: "CodeFile";
  id: string;
  declarations: Declaration[];
}

// Uses and package handling
export interface Uses extends Node {
  type: "Uses";
  packages: Package[];
}

export interface Package extends Node {
  type: "Package";
  name: string | { value: string; type: "STRING" };
  renaming?: Rename[];
}

export interface Rename extends Node {
  type: "Rename";
  from: string;
  to: string;
}

// Declarations
export type Declaration =
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

export interface ConstantDecl extends Node {
  type: "ConstantDecl";
  name: string;
  value: Expression;
}

export interface ErrorDecl extends Node {
  type: "ErrorDecl";
  name: string;
  parameters: Parameter[];
}

export interface VarDecl extends Node {
  type: "VarDecl";
  names: string[];
  varType: Type;
  initializer?: Expression;
}

export interface EnumDecl extends Node {
  type: "EnumDecl";
  name: string;
  baseValue?: Expression;
  members: string[];
}

export interface TypeDecl extends Node {
  type: "TypeDecl";
  name: string;
  value: Type;
}

export interface Parameter extends Node {
  type: "Parameter";
  name: string;
  paramType: Type;
}

// Types
export interface Type extends Node {
  type: "Type";
  kind: TypeKind;
}

export type TypeKind =
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
export interface FunctionProto extends Node {
  type: "FunctionProto";
  name: string;
  parameters: Parameter[];
  returnType?: Type;
  isExternal: boolean;
}

export interface FunctionDecl extends Node {
  type: "FunctionDecl";
  name: string;
  parameters: Parameter[];
  returnType?: Type;
  variables?: VarDecl[];
  body: Statement[];
}

export interface NamelessFunctionDecl extends Node {
  type: "NamelessFunctionDecl";
  parameters: Parameter[];
  returnType?: Type;
  variables?: VarDecl[];
  body: Statement[];
}

// Statements
export type Statement =
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

export interface IfStatement extends Node {
  type: "IfStatement";
  condition: Expression;
  thenBlock: Statement[];
  elseIfClauses: {
    condition: Expression;
    block: Statement[];
  }[];
  elseBlock?: Statement[];
}

export interface WhileStatement extends Node {
  type: "WhileStatement";
  condition: Expression;
  body: Statement[];
}

export interface DoUntilStatement extends Node {
  type: "DoUntilStatement";
  body: Statement[];
  condition: Expression;
}

export interface ForStatement extends Node {
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

export interface AssignmentStatement extends Node {
  type: "AssignmentStatement";
  lvalue: LValue;
  expression: Expression;
}

export interface CallStatement extends Node {
  type: "CallStatement";
  expression: CallExpression | MessageExpression;
}

export interface ReturnStatement extends Node {
  type: "ReturnStatement";
  expression?: Expression;
}

export interface BreakStatement extends Node {
  type: "BreakStatement";
}

export interface ContinueStatement extends Node {
  type: "ContinueStatement";
}

export interface SwitchStatement extends Node {
  type: "SwitchStatement";
  expression: Expression;
  cases: {
    condition: Expression;
    body: Statement[];
  }[];
  defaultCase?: Statement[];
}

export interface TryStatement extends Node {
  type: "TryStatement";
  body: Statement[];
  catches: {
    errorName: string;
    parameters: Parameter[];
    body: Statement[];
  }[];
}

export interface ThrowStatement extends Node {
  type: "ThrowStatement";
  errorName: string;
  arguments: Expression[];
}

export interface FreeStatement extends Node {
  type: "FreeStatement";
  expression: Expression;
}

export interface DebugStatement extends Node {
  type: "DebugStatement";
}

// LValue
export interface LValue extends Node {
  type: "LValue";
  kind: LValueKind;
}

export type LValueKind =
  | { kind: "Identifier"; name: string }
  | { kind: "ArrayAccess"; array: Expression; indices: Expression[] }
  | { kind: "FieldAccess"; object: Expression; field: string };

// Expressions
export type Expression =
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

export interface BinaryExpression extends Node {
  type: "BinaryExpression";
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends Node {
  type: "UnaryExpression";
  operator: string;
  operand: Expression;
}

export interface LiteralExpression extends Node {
  type: "LiteralExpression";
  kind: "INTEGER" | "DOUBLE" | "CHAR" | "STRING" | "true" | "false" | "null";
  value: number | string | boolean | null;
}

export interface IdentifierExpression extends Node {
  type: "IdentifierExpression";
  name: string;
}

export interface CallExpression extends Node {
  type: "CallExpression";
  callee: Expression;
  arguments: Expression[];
}

export interface MessageExpression extends Node {
  type: "MessageExpression";
  receiver: Expression;
  message: string;
  arguments: Expression[];
}

export interface MemberExpression extends Node {
  type: "MemberExpression";
  object: Expression;
  property: string;
}

export interface NewExpression extends Node {
  type: "NewExpression";
  constructor: Constructor;
}

export interface AllocExpression extends Node {
  type: "AllocExpression";
  constructor: Constructor;
}

export interface Constructor extends Node {
  type: "Constructor";
  constructorType: Type;
  kind: ConstructorKind;
}

export type ConstructorKind =
  | {
      kind: "ClassRecord";
      initializers: { field: string; value: Expression }[];
    }
  | {
      kind: "Array";
      initializers: { index?: Expression; value: Expression }[];
    };

export interface SizeOfExpression extends Node {
  type: "SizeOfExpression";
  sizeType: Type;
}

export interface TypeCheckExpression extends Node {
  type: "TypeCheckExpression";
  kind: "isInstanceOf" | "isKindOf";
  expression: Expression;
  checkType: Type;
}

export interface ArrayAccessExpression extends Node {
  type: "ArrayAccessExpression";
  array: Expression;
  indices: Expression[];
}

export interface TypeCastExpression extends Node {
  type: "TypeCastExpression";
  kind: "asPtrTo" | "asInteger";
  expression: Expression;
  targetType?: Type; // Only for asPtrTo
}

// OOP Constructs
export interface InterfaceDecl extends Node {
  type: "InterfaceDecl";
  name: string;
  typeParameters?: TypeParameter[];
  extends?: Type[];
  messages?: MethodProto[];
}

export interface ClassDecl extends Node {
  type: "ClassDecl";
  name: string;
  typeParameters?: TypeParameter[];
  implements?: Type[];
  superclass?: Type;
  fields?: VarDecl[];
  methods?: MethodProto[];
}

export interface BehaviorDecl extends Node {
  type: "BehaviorDecl";
  name: string;
  methods: MethodDecl[];
}

export interface TypeParameter extends Node {
  type: "TypeParameter";
  name: string;
  constraint: Type;
}

export interface MethodProto extends Node {
  type: "MethodProto";
  kind: MethodKind;
}

export type MethodKind =
  | { kind: "Normal"; name: string; parameters: Parameter[]; returnType?: Type }
  | { kind: "Infix"; operator: string; parameter: Parameter; returnType: Type }
  | { kind: "Prefix"; operator: string; returnType: Type }
  | {
      kind: "Keyword";
      segments: { name: string; parameter: Parameter }[];
      returnType?: Type;
    };

export interface MethodDecl extends Node {
  type: "MethodDecl";
  prototype: MethodProto;
  variables?: VarDecl[];
  body: Statement[];
}
