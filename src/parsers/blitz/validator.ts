import {
  InstructionFormat,
  OperandType,
  FormatOperands,
} from "./types/types";
import { Instructions } from "./types/definitions";

/**
 * Get hover text documentation for an instruction
 */
export function getInstructionHoverText(instruction: string): string {
  const def = Instructions[instruction.toLowerCase()];
  if (!def) return "";

  let text = `${def.description}\n`;
  if (def.category) {
    text += `Category: ${def.category}\n`;
  }
  text += "\nFormats:\n";

  def.formats.forEach((format) => {
    text += `\n${InstructionFormat[format.format]}: ${format.example}`;
    if (format.description) {
      text += `\n   ${format.description}`;
    }
  });

  return text;
}

/**
 * Get all available formats for an instruction
 */
export function getInstructionFormats(
  instruction: string
): InstructionFormat[] {
  const def = Instructions[instruction.toLowerCase()];
  if (!def) return [];
  return def.formats.map((f) => f.format);
}

/**
 * Validate if a string matches register format
 */
export function isValidRegister(operand: string): boolean {
  return /^[rf][0-9]{1,2}$/.test(operand) && parseInt(operand.slice(1)) < 16;
}

/**
 * Validate if a string is a valid immediate value
 */
export function isValidImmediate(operand: string): boolean {
  // Handle hex, decimal, and binary formats
  return /^(0x[0-9a-fA-F]+|0b[01]+|-?[0-9]+)$/.test(operand);
}

/**
 * Validate if a string is a valid memory reference
 */
export function isValidMemoryRef(operand: string): boolean {
  return /^\[[rf][0-9]{1,2}(\+([rf][0-9]{1,2}|[0-9]+))?\]$/.test(operand);
}

/**
 * Validate an operand against an expected type
 */
export function validateOperandType(
  operand: string,
  expectedType: OperandType
): boolean {
  switch (expectedType) {
    case "register":
      return isValidRegister(operand);
    case "immediate":
    case "data16":
    case "data24":
      return isValidImmediate(operand);
    case "memory":
      return isValidMemoryRef(operand);
    case "label":
      // TODO: Labels will need to be validated against a symbol table
      return true;
    default:
      return false;
  }
}

/**
 * Validate operands against a specific format
 */
export function validateFormat(
  format: InstructionFormat,
  operands: string[]
): boolean {
  const expectedOperands = FormatOperands[format];
  if (expectedOperands.length !== operands.length) return false;

  return expectedOperands.every((expectedType, index) =>
    validateOperandType(operands[index], expectedType)
  );
}

/**
 * Get matching format for given operands
 */
export function getMatchingFormat(
  instruction: string,
  operands: string[]
): InstructionFormat | undefined {
  const def = Instructions[instruction.toLowerCase()];
  if (!def) return undefined;

  const matchingFormat = def.formats.find((formatUsage) =>
    validateFormat(formatUsage.format, operands)
  );

  return matchingFormat?.format;
}
