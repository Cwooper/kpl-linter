// Base types for all AST nodes
export interface Position {
  line: number;
  column: number;
  position: number; // Added position for exact location
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

// Types
export type Type =
  | BasicType
  | PointerType
  | RecordType
  | ArrayType
  | FunctionType
  | NamedType;

export interface BasicType extends Node {
  type: "BasicType";
  kind: "char" | "int" | "double" | "bool" | "void" | "typeOfNull" | "anyType";
}

export interface PointerType extends Node {
  type: "PointerType";
  elementType: Type;
}

export interface RecordType extends Node {
  type: "RecordType";
  fields: VarDecl[];
}

export interface ArrayType extends Node {
  type: "ArrayType";
  dimensions: (Expression | null)[]; // null for dynamic size *
  elementType: Type;
}

export interface FunctionType extends Node {
  type: "FunctionType";
  parameters: Type[];
  returnType?: Type;
}

export interface NamedType extends Node {
  type: "NamedType";
  name: string;
  typeArguments?: Type[];
}

// Parameters and TypeParameters
export interface Parameter extends Node {
  type: "Parameter";
  name: string;
  paramType: Type;
}

export interface TypeParameter extends Node {
  type: "TypeParameter";
  name: string;
  constraint: Type;
}

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
  | DebugStatement
  | MessageStatement; // Added for message passing

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
  expression: CallExpression;
}

export interface MessageStatement extends Node {
  type: "MessageStatement";
  receiver: Expression;
  message: string;
  arguments: Expression[];
  chainedMessages?: {
    message: string;
    arguments: Expression[];
  }[];
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

// Expressions
export type Expression =
  | BinaryExpression
  | UnaryExpression
  | LiteralExpression
  | IdentifierExpression
  | CallExpression
  | MessageExpression
  | FieldAccessExpression
  | NewExpression
  | AllocExpression
  | SizeOfExpression
  | TypeCheckExpression
  | ArrayAccessExpression
  | TypeCastExpression
  | ChainedExpression
  | NamelessFunctionExpression;

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
  kind:
    | "INTEGER"
    | "DOUBLE"
    | "CHAR"
    | "STRING"
    | "true"
    | "false"
    | "null"
    | "self"
    | "super";
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

export interface FieldAccessExpression extends Node {
  type: "FieldAccessExpression";
  object: Expression;
  field: string;
}

export interface ChainedExpression extends Node {
  type: "ChainedExpression";
  expressions: Expression[];
  chainOperators: string[]; // The operators between expressions
}

export interface NamelessFunctionExpression extends Node {
  type: "NamelessFunctionExpression";
  function: NamelessFunctionDecl;
}

// LValue (Left-hand side value)
export type LValue = IdentifierLValue | ArrayAccessLValue | FieldAccessLValue;

export interface IdentifierLValue extends Node {
  type: "IdentifierLValue";
  name: string;
}

export interface ArrayAccessLValue extends Node {
  type: "ArrayAccessLValue";
  array: Expression;
  indices: Expression[];
}

export interface FieldAccessLValue extends Node {
  type: "FieldAccessLValue";
  object: Expression;
  field: string;
}

// OOP Constructs
export interface InterfaceDecl extends Node {
  type: "InterfaceDecl";
  name: string;
  typeParameters?: TypeParameter[];
  extends?: NamedType[];
  messages?: MethodProto[];
}

export interface ClassDecl extends Node {
  type: "ClassDecl";
  name: string;
  typeParameters?: TypeParameter[];
  implements?: NamedType[];
  superclass?: NamedType;
  fields?: VarDecl[];
  methods?: MethodProto[];
}

export interface BehaviorDecl extends Node {
  type: "BehaviorDecl";
  name: string;
  methods: MethodDecl[];
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

// Constructors
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
  initialization: ConstructorInit;
}

export type ConstructorInit = ClassRecordInit | ArrayInit | undefined;

export interface ClassRecordInit extends Node {
  type: "ClassRecordInit";
  initializers: { field: string; value: Expression }[];
}

export interface ArrayInit extends Node {
  type: "ArrayInit";
  initializers: { index?: Expression; value: Expression }[];
}

// Type Operations
export interface SizeOfExpression extends Node {
  type: "SizeOfExpression";
  targetType: Type;
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
