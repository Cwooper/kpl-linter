// types/blitzTypes.ts

export interface Location {
  line: number;
  column: number;
}

export interface BlitzToken {
  type:
    | "label"
    | "constant"
    | "instruction"
    | "directive"
    | "comment"
    | "string";
  value: string;
  line: number;
  column: number;
  isDefinition?: boolean;
  references?: Location[];
}

// Instruction operand types
export type OperandType =
  | "register" // r1, r2, etc.
  | "immediate" // numerical value
  | "label" // jump target
  | "memory" // [r1], [r1+offset]
  | "constant" // named constant
  | "string" // string literal
  | "data16" // 16-bit data
  | "data24" // 24-bit data
  | "none"; // no operand

// Define the standard formats
export enum InstructionFormat {
  A = "A", // No operands
  B = "B", // Rc
  C = "C", // Rc,Ra
  D = "D", // Rc,Ra,Rb
  E = "E", // Rc,Ra,data16
  F = "F", // data24
  G = "G", // Rc,data16
}

// Define two register types
export enum RegisterType {
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT'
}

// Map each format to its operand types
export const FormatOperands: Record<InstructionFormat, OperandType[]> = {
  [InstructionFormat.A]: [],
  [InstructionFormat.B]: ["register"],
  [InstructionFormat.C]: ["register", "register"],
  [InstructionFormat.D]: ["register", "register", "register"],
  [InstructionFormat.E]: ["register", "register", "data16"],
  [InstructionFormat.F]: ["data24"],
  [InstructionFormat.G]: ["register", "data16"],
};

// Define a format usage with specific example and description
export interface FormatUsage {
  format: InstructionFormat;
  example: string;
  description?: string;
}

// Define the structure of an instruction
export interface InstructionDefinition {
  mnemonic: string;
  description: string;
  formats: FormatUsage[];
  category?: "arithmetic" | "control" | "memory" | "system" | "bitwise";
}

// Register definition
export interface RegisterDefinition {
  name: string;
  number: number;
  description: string;
  isReserved?: boolean;
  type: RegisterType;
}

// Directive definition
export interface DirectiveDefinition {
  name: string;
  description: string;
  operands: OperandType[];
  example?: string;
}
