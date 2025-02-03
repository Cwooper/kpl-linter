// AST Types for KPL Parser

import { Token, TokenType } from "./tokens";

// Base position information for VSCode integration
export interface Position {
  line: number;
  column: number;
  position: number;
  file: string;
}

// Base node interface that all AST nodes implement
export interface Node {
  type: string;
  position: Position;
  token?: Token; // Original token if applicable
}

export interface Program extends Node {
  type: "Program";
  headers: Header[];
  code?: Code;
}

// ==== Basic Types ====
export type Type =
  | CharType
  | IntType
  | DoubleType
  | BoolType
  | VoidType
  | TypeOfNullType
  | AnyType
  | PtrType
  | ArrayType
  | RecordType
  | FunctionType
  | NamedType;

export interface BaseType extends Node {
  kind: "type";
}

export interface CharType extends BaseType {
  type: "CharType";
}

export interface IntType extends BaseType {
  type: "IntType";
}

export interface DoubleType extends BaseType {
  type: "DoubleType";
}

export interface BoolType extends BaseType {
  type: "BoolType";
}

export interface VoidType extends BaseType {
  type: "VoidType";
}

export interface TypeOfNullType extends BaseType {
  type: "TypeOfNullType";
}

export interface AnyType extends BaseType {
  type: "AnyType";
}

export interface PtrType extends BaseType {
  type: "PtrType";
  baseType: Type;
}

export interface ArrayType extends BaseType {
  type: "ArrayType";
  sizeExpr?: Expression;
  baseType: Type;
  sizeInBytes: number;
  sizeOfElements: number;
}

export interface RecordType extends BaseType {
  type: "RecordType";
  fields: RecordField[];
  sizeInBytes: number;
  fieldMapping: Map<string, RecordField>;
}

export interface FunctionType extends BaseType {
  type: "FunctionType";
  paramTypes: TypeArg[];
  returnType: Type;
  totalParamSize: number;
  returnSize: number;
}

export interface NamedType extends BaseType {
  type: "NamedType";
  identifier: string;
  typeArgs?: TypeArg[];
  definition?: Node; // Interface | ClassDef | TypeParm | TypeDef
  substitutions?: Map<TypeParm, Type>;
}

// ==== Declarations ====
export interface VarDecl extends Node {
  identifier: string;
  varType: Type;
  offset?: number;
  sizeInBytes?: number;
  varDescLabel?: string;
}

export interface Global extends VarDecl {
  type: "Global";
  initExpr?: Expression;
  isPrivate: boolean;
}

export interface Local extends VarDecl {
  type: "Local";
  initExpr?: Expression;
  wasUsed: boolean;
}

export interface Parameter extends VarDecl {
  type: "Parameter";
  throwSideOffset?: number;
}

export interface ClassField extends VarDecl {
  type: "ClassField";
}

export interface RecordField extends VarDecl {
  type: "RecordField";
}

// ==== Abstract Types ====
export interface Abstract extends Node {
  identifier: string;
  myHeader?: Header;
  nextAbstract?: Abstract;
  knownSubAbstracts: Map<Abstract, Abstract>;
  superAbstractsInPackage: Map<Abstract, Abstract>;
  superAbstractsInOtherPackages: Map<Abstract, Abstract>;
  selectorMapping: Map<string, MethodProto>;
  offsetToSelector: Map<number, string>;
  selectorToOffset: Map<string, number>;
  unavailableOffsets: Map<number, string>;
  newName?: string;
}

export interface Interface extends Abstract {
  type: "Interface";
  next?: Interface;
  typeParms?: TypeParm[];
  extends?: TypeArg[];
  methodProtos?: MethodProto[];
  mark: number;
  tempNext?: Interface;
  isPrivate: boolean;
  inheritedMethodProtos?: MethodProto[];
}

export interface ClassDef extends Abstract {
  type: "ClassDef";
  next?: ClassDef;
  typeParms?: TypeParm[];
  implements?: TypeArg[];
  superclass?: NamedType;
  fields?: ClassField[];
  methodProtos?: MethodProto[];
  mark: number;
  tempNext?: ClassDef;
  isPrivate: boolean;
  methods?: Method[];
  superclassDef?: ClassDef;
  superclassMapping?: Map<TypeParm, Type>;
  classMapping?: Map<string, Node>;
  localMethodMapping?: Map<string, Method>;
  sizeInBytes: number;
  typeOfSelf?: Type;
}

// ==== Expressions ====
export type Expression =
  | Constant
  | CallExpr
  | SendExpr
  | SelfExpr
  | SuperExpr
  | FieldAccess
  | ArrayAccess
  | Constructor
  | ClosureExpr
  | VariableExpr
  | AsPtrToExpr
  | AsIntegerExpr
  | ArraySizeExpr
  | IsInstanceOfExpr
  | IsKindOfExpr
  | SizeOfExpr
  | DynamicCheck;

export interface BaseExpression extends Node {
  nodeKind: "expression";
  kind?: string | number;
}

export type Constant =
  | IntConst
  | DoubleConst
  | CharConst
  | StringConst
  | BoolConst
  | NullConst;

export interface BaseConstant extends BaseExpression {
  nodeKind: "expression";
  kind: "constant";
}

export interface IntConst extends BaseConstant {
  type: "IntConst";
  value: number;
}

export interface DoubleConst extends BaseConstant {
  type: "DoubleConst";
  value: number;
  next?: DoubleConst;
  nameOfConstant?: string;
}

export interface CharConst extends BaseConstant {
  type: "CharConst";
  value: number;
}

export interface StringConst extends BaseConstant {
  type: "StringConst";
  value: string;
  next?: StringConst;
  nameOfConstant?: string;
}

export interface BoolConst extends BaseConstant {
  type: "BoolConst";
  value: boolean;
}

export interface NullConst extends BaseConstant {
  type: "NullConst";
}

// ==== Statements ====
export type Statement =
  | IfStmt
  | AssignStmt
  | CallStmt
  | SendStmt
  | WhileStmt
  | DoStmt
  | BreakStmt
  | ContinueStmt
  | ReturnStmt
  | ForStmt
  | SwitchStmt
  | TryStmt
  | ThrowStmt
  | FreeStmt
  | DebugStmt;

export interface BaseStatement extends Node {
  kind: "statement";
  next?: Statement;
}

export interface IfStmt extends BaseStatement {
  type: "IfStmt";
  condition: Expression;
  thenStatements?: Statement[];
  elseStatements?: Statement[];
}

export interface AssignStmt extends BaseStatement {
  type: "AssignStmt";
  lvalue: Expression;
  expr: Expression;
  sizeInBytes: number;
  dynamicCheck: number;
  classDef?: ClassDef;
  arraySize?: number;
}

export interface CallStmt extends BaseStatement {
  type: "CallStmt";
  expr: CallExpr;
}

// ==== Additional Nodes ====
export interface MethOrFunction extends Node {
  parameters?: Parameter[];
  returnType: Type;
  locals?: Local[];
  statements?: Statement[];
  frameSize: number;
  newName?: string;
  maxArgBytes: number;
  totalParamSize: number;
  containsTry: boolean;
  catchStackSave?: Local;
  catchList?: Catch[];
}

export interface Function extends MethOrFunction {
  type: "Function";
  next?: Function;
  identifier?: string;
  myProto?: FunctionProto;
}

export interface Method extends MethOrFunction {
  type: "Method";
  next?: Method;
  kind: "INFIX" | "PREFIX" | "KEYWORD" | "NORMAL";
  selector: string;
  myMethodProto?: MethodProto;
  myClass?: ClassDef;
}

export interface TypeParm extends Node {
  type: "TypeParm";
  next?: TypeParm;
  identifier: string; // Maps to 'id' in C++
  paramType: Type; // Maps to 'type' in C++
  fourByteRestricted: boolean; // Maps to C++ int as boolean
}

export interface TypeArg extends Node {
  type: "TypeArg";
  next?: TypeArg;
  argType: Type; // Maps to 'type' in C++
  offset: number; // Only for typeArgs in FunctionTypes
  sizeInBytes: number; // Only for typeArgs in FunctionTypes
}

export interface SendExpr extends BaseExpression {
  type: "SendExpr";
  selector: string;
  receiver: Expression;
  argList?: Argument[];
  kind: "INFIX" | "PREFIX" | "KEYWORD" | "NORMAL";
  primitiveSymbol: number; // 0=not a primitive, otherwise specific primitive value
  myProto?: MethodProto; // NULL for primitives
}

export interface FieldAccess extends BaseExpression {
  type: "FieldAccess";
  expr: Expression;
  identifier: string; // Maps to 'id' in C++
  offset: number;
}

export interface ArrayAccess extends BaseExpression {
  type: "ArrayAccess";
  arrayExpr: Expression;
  indexExpr: Expression;
  sizeOfElements: number; // This is the multiplication scale factor
}

export interface Constructor extends BaseExpression {
  type: "Constructor";
  constructorType: Type; // Maps to 'type' in C++
  countValueList?: CountValue[];
  fieldInits?: FieldInit[];
  sizeInBytes: number; // Classes, records, array: size of whole
  myClass?: ClassDef; // Null if not a Class constructor
  kind: "CLASS" | "RECORD" | "ARRAY";
  allocKind: "NEW" | "ALLOC";
}

export interface ClosureExpr extends BaseExpression {
  type: "ClosureExpr";
  function: Function;
}

export interface VariableExpr extends BaseExpression {
  type: "VariableExpr";
  identifier: string; // Maps to 'id' in C++
  myDef?: Node; // Can point to various node types in symbol table
}

export interface AsPtrToExpr extends BaseExpression {
  type: "AsPtrToExpr";
  expr: Expression;
  targetType: Type; // Maps to 'type' in C++
}

export interface AsIntegerExpr extends BaseExpression {
  type: "AsIntegerExpr";
  expr: Expression;
}

export interface ArraySizeExpr extends BaseExpression {
  type: "ArraySizeExpr";
  expr: Expression;
}

export interface IsInstanceOfExpr extends BaseExpression {
  type: "IsInstanceOfExpr";
  expr: Expression;
  checkType: Type; // Maps to 'type' in C++
  classDef?: ClassDef;
}

export interface IsKindOfExpr extends BaseExpression {
  type: "IsKindOfExpr";
  expr: Expression;
  checkType: Type; // Maps to 'type' in C++
  classOrInterface?: Abstract; // Points to Class or Interface
}

export interface SizeOfExpr extends BaseExpression {
  type: "SizeOfExpr";
  targetType: Type; // Maps to 'type' in C++
}

export interface CallExpr extends BaseExpression {
  type: "CallExpr";
  identifier: string; // Maps to 'id' in C++
  argList?: Argument[];
  myDef?: Node; // Points to FunctionProto, Local, Global, Parameter, or ClassField
  primitiveSymbol: number; // 0=not a primitive
  returnSize: number; // Size of returned value (0 if void), -1 for primitives
}

export interface SelfExpr extends BaseExpression {
  type: "SelfExpr";
}

export interface SuperExpr extends BaseExpression {
  type: "SuperExpr";
}

export interface DynamicCheck extends BaseExpression {
  type: "DynamicCheck";
  expr: Expression;
  kind: number; // 8=OBJECT COPY, 9/10/11/12=ARRAY COPY variations
  expectedArraySize?: number; // Cases 9 and 10 only
  arraySizeInBytes?: number; // Cases 9 and 10 only
  expectedClassDef?: ClassDef; // Case 8 only
}

export interface Argument extends Node {
  type: "Argument";
  next?: Argument;
  expr: Expression;
  tempName?: Node; // Used in code gen
  offset: number;
  sizeInBytes: number;
}

export interface CountValue extends Node {
  type: "CountValue";
  count?: Expression; // May be null
  value: Expression; // Not null
  next?: CountValue;
  countTemp?: Node; // May be null, means 1 if null
  valueTemp: Node; // Not null
}

export interface FieldInit extends Node {
  type: "FieldInit";
  next?: FieldInit;
  identifier: string; // Maps to 'id' in C++
  expr: Expression;
  offset: number;
  sizeInBytes: number;
}

// Other statement types...
export interface SendStmt extends BaseStatement {
  type: "SendStmt";
  expr: SendExpr;
}

export interface WhileStmt extends BaseStatement {
  type: "WhileStmt";
  condition: Expression;
  statements?: Statement[];
  containsBreaks: boolean;
  containsContinues: boolean;
  topLabel?: string;
  exitLabel?: string;
}

export interface DoStmt extends BaseStatement {
  type: "DoStmt";
  statements?: Statement[];
  condition: Expression;
  containsBreaks: boolean;
  containsContinues: boolean;
  exitLabel?: string;
  testLabel?: string;
}

export interface BreakStmt extends BaseStatement {
  type: "BreakStmt";
  enclosingStmt?: Statement; // Points to FOR, DO, WHILE, or SWITCH stmt
}

export interface ContinueStmt extends BaseStatement {
  type: "ContinueStmt";
  enclosingStmt?: Statement; // Points to FOR, DO, or WHILE stmt
}

export interface ReturnStmt extends BaseStatement {
  type: "ReturnStmt";
  expr?: Expression;
  enclosingMethOrFunction: MethOrFunction; // Not null
  returnSize: number; // Size of return result (-1 = void, could be 1)
}

export interface ForStmt extends BaseStatement {
  type: "ForStmt";
  lvalue: Expression;
  startExpr: Expression;
  endExpr: Expression;
  stepExpr?: Expression;
  statements?: Statement[];
  containsBreaks: boolean;
  containsContinues: boolean;
  incrLabel?: string;
  exitLabel?: string;
}

export interface Case extends Node {
  type: "Case";
  next?: Case;
  expr: Expression;
  value: number; // The evaluated constant value of the case expression
  statements?: Statement[];
  label?: string; // Label for code generation
}

export interface SwitchStmt extends BaseStatement {
  type: "SwitchStmt";
  expr: Expression;
  cases?: Case[]; // May be empty
  defaultStmts?: Statement[]; // May be null
  containsBreaks: boolean;
  hasDefault: boolean; // Maps to 'defaultIncluded' - 1="default:" clause present
  lowValue: number; // The range of values seen
  highValue: number; // Used for optimization
  exitLabel?: string; // Used for break statements
}

export interface Catch extends Node {
  type: "Catch";
  next?: Catch; // In list for each try stmt
  nextInMethOrFunction?: Catch; // In list for this function/method
  identifier: string; // Maps to 'id' in C++
  parameters?: Parameter[]; // May be empty, maps to 'parmList'
  statements?: Statement[]; // May be empty
  errorDef?: ErrorDecl; // Null iff errors
  label?: string;
  enclosingMethOrFunction?: MethOrFunction;
}

export interface TryStmt extends BaseStatement {
  type: "TryStmt";
  statements?: Statement[]; // May be empty
  catches: Catch[]; // Null only if errors
}

export interface ThrowStmt extends BaseStatement {
  type: "ThrowStmt";
  identifier: string; // Maps to 'id' in C++
  args?: Argument[]; // May be empty
  errorDef?: ErrorDecl; // Null iff errors
}

export interface FreeStmt extends BaseStatement {
  type: "FreeStmt";
  expr: Expression;
}

export interface DebugStmt extends BaseStatement {
  type: "DebugStmt";
  // No additional fields needed
}

// Error declarations referenced by Throw and Catch
export interface ErrorDecl extends Node {
  type: "ErrorDecl";
  next?: ErrorDecl;
  identifier: string; // Maps to 'id' in C++
  parameters?: Parameter[]; // Maps to 'parmList', may be empty
  newName?: string; // E.g., "_Error_P_MyPackageName_OriginalName"
  totalParamSize: number;
}

// Header node referenced in many places
export interface Header extends Node {
  type: "Header";
  next?: Header;
  packageName: string;
  uses?: Uses[];
  consts?: ConstDecl[];
  errors?: ErrorDecl[];
  globals?: Global[];
  typeDefs?: TypeDef[];
  functionProtos?: FunctionProto[];
  interfaces?: Interface[];
  classes?: ClassDef[];
  hashValue: number; // Pseudo-random code for token sequence
  mark: number; // 0=unseen, 1=processing, 2=done
  tempNext?: Header; // Used in topoProcessAllPackages
  packageMapping: Map<string, Node>; // String -> Various node types
  errorMapping: Map<string, ErrorDecl>;
  functions?: Function[]; // For mainHeader
  closures?: Function[]; // All closures encountered
}

export interface Uses extends Node {
  type: "Uses";
  next?: Uses;
  identifier: string; // Maps to 'id' in C++, package name
  renamings?: Renaming[];
  myDef?: Header; // Null if errors in topoProcessing Headers
}

export interface Renaming extends Node {
  type: "Renaming";
  next?: Renaming;
  from: string; // E.g., "foo" or "++"
  to: string; // E.g., "superFoo" or "^++"
}

export interface Code extends Node {
  type: "Code";
  packageName: string;
  consts?: ConstDecl[];
  errors?: ErrorDecl[];
  globals?: Global[];
  typeDefs?: TypeDef[];
  functions?: Function[];
  interfaces?: Interface[];
  classes?: ClassDef[];
  behaviors?: Behavior[];
  hashValue: number; // Pseudo-random code for token sequence
}

export interface Behavior extends Node {
  type: "Behavior";
  next?: Behavior;
  identifier: string; // Maps to 'id' in C++
  methods?: Method[]; // May be empty
}

export interface TypeDef extends Node {
  type: "TypeDef";
  next?: TypeDef;
  identifier: string; // Maps to 'id' in C++
  definedType: Type; // Maps to 'type' in C++
  mark: number;
}

export interface ConstDecl extends Node {
  type: "ConstDecl";
  next?: ConstDecl;
  identifier: string; // Maps to 'id' in C++
  expr: Expression;
  isPrivate: boolean; // 1=in code file, 0=in header file
}

export interface MethodProto extends Node {
  type: "MethodProto";
  next?: MethodProto;
  kind: "INFIX" | "PREFIX" | "KEYWORD" | "NORMAL";
  selector: string; // e.g., "foo", "+", "at:put:"
  parameters?: Parameter[]; // Maps to 'parmList', may be empty
  returnType: Type; // Never null
  myMethod?: Method; // For Classes: Only null when errors
  totalParamSize: number; // Size of all params including padding
  returnSize: number; // Size of return result (-1=void)
  offset: number; // Offset in dispatch table
}

export interface FunctionProto extends Node {
  type: "FunctionProto";
  next?: FunctionProto;
  identifier: string; // Maps to 'id' in C++
  parameters?: Parameter[]; // Maps to 'parmList', may be empty
  returnType: Type; // Never null
  isExternal: boolean; // 1=external
  isPrivate: boolean; // 0=not in header file, 1=in header file
  myHeader?: Header; // Package containing this function
  myFunction?: Function; // Null if none or if error
  newName?: string; // E.g., "bar", "_function_123_foo", "_closure_321"
  totalParamSize: number; // Size of all params including padding
  returnSize: number; // Size of return result (-1=void)
}
