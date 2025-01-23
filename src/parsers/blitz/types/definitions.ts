// instructionSet/blitzDefinitions.ts
import {
  InstructionDefinition,
  RegisterDefinition,
  DirectiveDefinition,
  InstructionFormat,
  RegisterType,
} from "./types";

// -------------------- Instructions --------------------

export const Instructions: { [key: string]: InstructionDefinition } = {
  // Arithmetic and Logic Instructions
  add: {
    mnemonic: "add",
    description: "Add two values and store the result",
    formats: [
      {
        format: InstructionFormat.D,
        example: "add Ra,Rb,Rc",
        description: "Add registers: Rc = Ra + Rb",
      },
      {
        format: InstructionFormat.E,
        example: "add Ra,data16,Rc",
        description: "Add immediate: Rc = Ra + data16",
      },
    ],
    category: "arithmetic",
  },
  sub: {
    mnemonic: "sub",
    description: "Subtract two values and store the result",
    formats: [
      {
        format: InstructionFormat.D,
        example: "sub Ra,Rb,Rc",
        description: "Subtract registers: Rc = Ra - Rb",
      },
      {
        format: InstructionFormat.E,
        example: "sub Ra,data16,Rc",
        description: "Subtract immediate: Rc = Ra - data16",
      },
    ],
    category: "arithmetic",
  },
  mul: {
    mnemonic: "mul",
    description: "Multiply two values and store the result",
    formats: [
      {
        format: InstructionFormat.D,
        example: "mul Ra,Rb,Rc",
        description: "Multiply registers: Rc = Ra * Rb",
      },
      {
        format: InstructionFormat.E,
        example: "mul Ra,data16,Rc",
        description: "Multiply immediate: Rc = Ra * data16",
      },
    ],
    category: "arithmetic",
  },
  div: {
    mnemonic: "div",
    description: "Divide two values and store the result",
    formats: [
      {
        format: InstructionFormat.D,
        example: "div Ra,Rb,Rc",
        description: "Divide registers: Rc = Ra / Rb",
      },
      {
        format: InstructionFormat.E,
        example: "div Ra,data16,Rc",
        description: "Divide immediate: Rc = Ra / data16",
      },
    ],
    category: "arithmetic",
  },

  // Shift Instructions
  sll: {
    mnemonic: "sll",
    description: "Shift left logical",
    formats: [
      {
        format: InstructionFormat.D,
        example: "sll Ra,Rb,Rc",
        description: "Shift Ra left by Rb bits, store in Rc",
      },
      {
        format: InstructionFormat.E,
        example: "sll Ra,data16,Rc",
        description: "Shift Ra left by immediate value, store in Rc",
      },
    ],
    category: "bitwise",
  },
  srl: {
    mnemonic: "srl",
    description: "Shift right logical",
    formats: [
      {
        format: InstructionFormat.D,
        example: "srl Ra,Rb,Rc",
        description: "Shift Ra right by Rb bits, store in Rc",
      },
      {
        format: InstructionFormat.E,
        example: "srl Ra,data16,Rc",
        description: "Shift Ra right by immediate value, store in Rc",
      },
    ],
    category: "bitwise",
  },
  sra: {
    mnemonic: "sra",
    description: "Shift right arithmetic",
    formats: [
      {
        format: InstructionFormat.D,
        example: "sra Ra,Rb,Rc",
        description: "Shift Ra right arithmetic by Rb bits, store in Rc",
      },
      {
        format: InstructionFormat.E,
        example: "sra Ra,data16,Rc",
        description:
          "Shift Ra right arithmetic by immediate value, store in Rc",
      },
    ],
    category: "bitwise",
  },
  btst: {
    mnemonic: "btst",
    description: "Bit Test",
    formats: [
      {
        format: InstructionFormat.C,
        example: "btst Ra,Rc",
        description: "Test the bit specified by Ra in the value stored in Rc",
      },
      {
        format: InstructionFormat.E,
        example: "btst data16,Rc",
        description: "Test the bit specified by the immediate value data16 in Rc",
      },
    ],
    category: "bitwise",
  },
  rem: {
    mnemonic: "rem",
    description: "Integer remainder/modulo operation",
    formats: [
      {
        format: InstructionFormat.D,
        example: "rem Ra,Rb,Rc",
        description: "Remainder of Ra divided by Rb stored in Rc",
      },
      {
        format: InstructionFormat.E,
        example: "rem Ra,data16,Rc",
        description: "Remainder of Ra divided by immediate value stored in Rc",
      },
    ],
    category: "arithmetic",
  },

  // Logical Operations
  or: {
    mnemonic: "or",
    description: "Bitwise OR operation",
    formats: [
      {
        format: InstructionFormat.D,
        example: "or Ra,Rb,Rc",
        description: "OR registers: Rc = Ra OR Rb",
      },
      {
        format: InstructionFormat.E,
        example: "or Ra,data16,Rc",
        description: "OR immediate: Rc = Ra OR data16",
      },
    ],
    category: "bitwise",
  },
  and: {
    mnemonic: "and",
    description: "Bitwise AND operation",
    formats: [
      {
        format: InstructionFormat.D,
        example: "and Ra,Rb,Rc",
        description: "AND registers: Rc = Ra AND Rb",
      },
      {
        format: InstructionFormat.E,
        example: "and Ra,data16,Rc",
        description: "AND immediate: Rc = Ra AND data16",
      },
    ],
    category: "bitwise",
  },
  andn: {
    mnemonic: "andn",
    description: "Bitwise AND NOT operation",
    formats: [
      {
        format: InstructionFormat.D,
        example: "andn Ra,Rb,Rc",
        description: "AND NOT registers: Rc = Ra AND (NOT Rb)",
      },
      {
        format: InstructionFormat.E,
        example: "andn Ra,data16,Rc",
        description: "AND NOT immediate: Rc = Ra AND (NOT data16)",
      },
    ],
    category: "bitwise",
  },
  xor: {
    mnemonic: "xor",
    description: "Bitwise XOR operation",
    formats: [
      {
        format: InstructionFormat.D,
        example: "xor Ra,Rb,Rc",
        description: "XOR registers: Rc = Ra XOR Rb",
      },
      {
        format: InstructionFormat.E,
        example: "xor Ra,data16,Rc",
        description: "XOR immediate: Rc = Ra XOR data16",
      },
    ],
    category: "bitwise",
  },

  // Memory Operations
  load: {
    mnemonic: "load",
    description: "Load word from memory",
    formats: [
      {
        format: InstructionFormat.D,
        example: "load [Ra+Rb],Rc",
        description: "Load word from memory at Ra+Rb into Rc",
      },
      {
        format: InstructionFormat.E,
        example: "load [Ra+data16],Rc",
        description: "Load word from memory at Ra+data16 into Rc",
      },
    ],
    category: "memory",
  },
  loadb: {
    mnemonic: "loadb",
    description: "Load byte from memory",
    formats: [
      {
        format: InstructionFormat.D,
        example: "loadb [Ra+Rb],Rc",
        description: "Load byte from memory at Ra+Rb into Rc",
      },
      {
        format: InstructionFormat.E,
        example: "loadb [Ra+data16],Rc",
        description: "Load byte from memory at Ra+data16 into Rc",
      },
    ],
    category: "memory",
  },
  loadv: {
    mnemonic: "loadv",
    description: "Load word using virtual address",
    formats: [
      {
        format: InstructionFormat.D,
        example: "loadv [Ra+Rb],Rc",
        description: "Load word from virtual memory at Ra+Rb into Rc",
      },
      {
        format: InstructionFormat.E,
        example: "loadv [Ra+data16],Rc",
        description: "Load word from virtual memory at Ra+data16 into Rc",
      },
    ],
    category: "memory",
  },
  loadbv: {
    mnemonic: "loadbv",
    description: "Load byte using virtual address",
    formats: [
      {
        format: InstructionFormat.D,
        example: "loadbv [Ra+Rb],Rc",
        description: "Load byte from virtual memory at Ra+Rb into Rc",
      },
      {
        format: InstructionFormat.E,
        example: "loadbv [Ra+data16],Rc",
        description: "Load byte from virtual memory at Ra+data16 into Rc",
      },
    ],
    category: "memory",
  },
  store: {
    mnemonic: "store",
    description: "Store word to memory",
    formats: [
      {
        format: InstructionFormat.D,
        example: "store Rc,[Ra+Rb]",
        description: "Store Rc to memory at Ra+Rb",
      },
      {
        format: InstructionFormat.E,
        example: "store Rc,[Ra+data16]",
        description: "Store Rc to memory at Ra+data16",
      },
    ],
    category: "memory",
  },
  storeb: {
    mnemonic: "storeb",
    description: "Store byte to memory",
    formats: [
      {
        format: InstructionFormat.D,
        example: "storeb Rc,[Ra+Rb]",
        description: "Store byte from Rc to memory at Ra+Rb",
      },
      {
        format: InstructionFormat.E,
        example: "storeb Rc,[Ra+data16]",
        description: "Store byte from Rc to memory at Ra+data16",
      },
    ],
    category: "memory",
  },
  storev: {
    mnemonic: "storev",
    description: "Store word using virtual address",
    formats: [
      {
        format: InstructionFormat.D,
        example: "storev Rc,[Ra+Rb]",
        description: "Store word from Rc to virtual memory at Ra+Rb",
      },
      {
        format: InstructionFormat.E,
        example: "storev Rc,[Ra+data16]",
        description: "Store word from Rc to virtual memory at Ra+data16",
      },
    ],
    category: "memory",
  },
  storebv: {
    mnemonic: "storebv",
    description: "Store byte using virtual address",
    formats: [
      {
        format: InstructionFormat.D,
        example: "storebv Rc,[Ra+Rb]",
        description: "Store byte from Rc to virtual memory at Ra+Rb",
      },
      {
        format: InstructionFormat.E,
        example: "storebv Rc,[Ra+data16]",
        description: "Store byte from Rc to virtual memory at Ra+data16",
      },
    ],
    category: "memory",
  },

  // Control Flow Instructions
  call: {
    mnemonic: "call",
    description: "Call subroutine",
    formats: [
      {
        format: InstructionFormat.C,
        example: "call Ra+Rc",
        description: "Call subroutine at Ra+Rc",
      },
      {
        format: InstructionFormat.F,
        example: "call data24",
        description: "Call subroutine at immediate address",
      },
    ],
    category: "control",
  },
  jmp: {
    mnemonic: "jmp",
    description: "Jump to address",
    formats: [
      {
        format: InstructionFormat.C,
        example: "jmp Ra+Rc",
        description: "Jump to address Ra+Rc",
      },
      {
        format: InstructionFormat.F,
        example: "jmp data24",
        description: "Jump to immediate address",
      },
    ],
    category: "control",
  },

  // System Instructions
  nop: {
    mnemonic: "nop",
    description: "No operation",
    formats: [
      {
        format: InstructionFormat.A,
        example: "nop",
        description: "Perform no operation",
      },
    ],
    category: "system",
  },
  syscall: {
    mnemonic: "syscall",
    description: "System call",
    formats: [
      {
        format: InstructionFormat.G,
        example: "syscall Rc+data16",
        description: "Execute system call with parameters",
      },
    ],
    category: "system",
  },

  // Format G instructions
  sethi: {
    mnemonic: "sethi",
    description: "Set high 16 bits of register",
    formats: [
      {
        format: InstructionFormat.G,
        example: "sethi data16,Rc",
        description: "Set high 16 bits of Rc to data16, clear low bits",
      },
    ],
    category: "system",
  },
  setlo: {
    mnemonic: "setlo",
    description: "Set low 16 bits of register",
    formats: [
      {
        format: InstructionFormat.G,
        example: "setlo data16,Rc",
        description: "Set low 16 bits of Rc to data16, preserve high bits",
      },
    ],
    category: "system",
  },
  ldaddr: {
    mnemonic: "ldaddr",
    description: "Load address into register",
    formats: [
      {
        format: InstructionFormat.G,
        example: "ldaddr data16,Rc",
        description: "Load address specified by data16 into Rc",
      },
    ],
    category: "memory",
  },

  // Format C instructions
  push: {
    mnemonic: "push",
    description: "Push register onto stack",
    formats: [
      {
        format: InstructionFormat.C,
        example: "push Rc,[--Ra]",
        description: "Decrement Ra and push Rc onto stack at address Ra",
      },
    ],
    category: "memory",
  },
  pop: {
    mnemonic: "pop",
    description: "Pop value from stack into register",
    formats: [
      {
        format: InstructionFormat.C,
        example: "pop [Ra++],Rc",
        description:
          "Pop value from stack at address Ra into Rc and increment Ra",
      },
    ],
    category: "memory",
  },

  // Format A instructions (no operands)
  wait: {
    mnemonic: "wait",
    description: "Enter low-power wait state",
    formats: [
      {
        format: InstructionFormat.A,
        example: "wait",
        description: "Processor enters low-power wait state until interrupt",
      },
    ],
    category: "system",
  },
  debug: {
    mnemonic: "debug",
    description: "Debug breakpoint",
    formats: [
      {
        format: InstructionFormat.A,
        example: "debug",
        description: "Generate debug breakpoint",
      },
    ],
    category: "system",
  },
  debug2: {
    mnemonic: "debug2",
    description: "Alternative debug breakpoint",
    formats: [
      {
        format: InstructionFormat.A,
        example: "debug2",
        description: "Generate alternative debug breakpoint",
      },
    ],
    category: "system",
  },
  reti: {
    mnemonic: "reti",
    description: "Return from interrupt",
    formats: [
      {
        format: InstructionFormat.A,
        example: "reti",
        description: "Return from interrupt handler to interrupted code",
      },
    ],
    category: "control",
  },
  ret: {
    mnemonic: "ret",
    description: "Return from subroutine",
    formats: [
      {
        format: InstructionFormat.A,
        example: "ret",
        description: "Return from subroutine to caller",
      },
    ],
    category: "control",
  },

  // Test and Set instruction
  tset: {
    mnemonic: "tset",
    description: "Atomic test and set memory location",
    formats: [
      {
        format: InstructionFormat.C,
        example: "tset [Ra],Rc",
        description:
          "Atomically test and set memory location at Ra, result in Rc",
      },
    ],
    category: "memory",
  },

  // User mode access instructions
  readu: {
    mnemonic: "readu",
    description: "Read from user mode register",
    formats: [
      {
        format: InstructionFormat.C,
        example: "readu Rc,Ra",
        description: "Read user mode register Ra into Rc",
      },
      {
        format: InstructionFormat.E,
        example: "readu Rc,[Ra+data16]",
        description: "Read user mode memory at Ra+data16 into Rc",
      },
    ],
    category: "system",
  },
  writeu: {
    mnemonic: "writeu",
    description: "Write to user mode register",
    formats: [
      {
        format: InstructionFormat.C,
        example: "writeu Ra,Rc",
        description: "Write Rc to user mode register Ra",
      },
      {
        format: InstructionFormat.E,
        example: "writeu [Ra+data16],Rc",
        description: "Write Rc to user mode memory at Ra+data16",
      },
    ],
    category: "system",
  },

  // Page table register instructions
  ldptbr: {
    mnemonic: "ldptbr",
    description: "Load page table base register",
    formats: [
      {
        format: InstructionFormat.B,
        example: "ldptbr Rc",
        description: "Load page table base register from Rc",
      },
    ],
    category: "system",
  },
  ldptlr: {
    mnemonic: "ldptlr",
    description: "Load page table length register",
    formats: [
      {
        format: InstructionFormat.B,
        example: "ldptlr Rc",
        description: "Load page table length register from Rc",
      },
    ],
    category: "system",
  },

  // Format C floating point instructions
  ftoi: {
    mnemonic: "ftoi",
    description: "Convert floating point to integer",
    formats: [
      {
        format: InstructionFormat.C,
        example: "ftoi Fa,Rc",
        description: "Convert float in Fa to integer in Rc",
      },
    ],
    category: "arithmetic",
  },
  itof: {
    mnemonic: "itof",
    description: "Convert integer to floating point",
    formats: [
      {
        format: InstructionFormat.C,
        example: "itof Ra,Fc",
        description: "Convert integer in Ra to float in Fc",
      },
    ],
    category: "arithmetic",
  },
  fcmp: {
    mnemonic: "fcmp",
    description: "Compare floating point values",
    formats: [
      {
        format: InstructionFormat.C,
        example: "fcmp Fa,Fc",
        description: "Compare float in Fa with Fc, set condition codes",
      },
    ],
    category: "arithmetic",
  },
  fsqrt: {
    mnemonic: "fsqrt",
    description: "Floating point square root",
    formats: [
      {
        format: InstructionFormat.C,
        example: "fsqrt Fa,Fc",
        description: "Calculate square root of Fa, store in Fc",
      },
    ],
    category: "arithmetic",
  },
  fneg: {
    mnemonic: "fneg",
    description: "Floating point negation",
    formats: [
      {
        format: InstructionFormat.C,
        example: "fneg Fa,Fc",
        description: "Negate float in Fa, store in Fc",
      },
    ],
    category: "arithmetic",
  },
  fabs: {
    mnemonic: "fabs",
    description: "Floating point absolute value",
    formats: [
      {
        format: InstructionFormat.C,
        example: "fabs Fa,Fc",
        description: "Calculate absolute value of Fa, store in Fc",
      },
    ],
    category: "arithmetic",
  },

  // Format D floating point arithmetic
  fadd: {
    mnemonic: "fadd",
    description: "Floating point addition",
    formats: [
      {
        format: InstructionFormat.D,
        example: "fadd Fa,Fb,Fc",
        description: "Add floats: Fc = Fa + Fb",
      },
    ],
    category: "arithmetic",
  },
  fsub: {
    mnemonic: "fsub",
    description: "Floating point subtraction",
    formats: [
      {
        format: InstructionFormat.D,
        example: "fsub Fa,Fb,Fc",
        description: "Subtract floats: Fc = Fa - Fb",
      },
    ],
    category: "arithmetic",
  },
  fmul: {
    mnemonic: "fmul",
    description: "Floating point multiplication",
    formats: [
      {
        format: InstructionFormat.D,
        example: "fmul Fa,Fb,Fc",
        description: "Multiply floats: Fc = Fa * Fb",
      },
    ],
    category: "arithmetic",
  },
  fdiv: {
    mnemonic: "fdiv",
    description: "Floating point division",
    formats: [
      {
        format: InstructionFormat.D,
        example: "fdiv Fa,Fb,Fc",
        description: "Divide floats: Fc = Fa / Fb",
      },
    ],
    category: "arithmetic",
  },

  // Floating point memory operations
  fload: {
    mnemonic: "fload",
    description: "Load floating point value from memory",
    formats: [
      {
        format: InstructionFormat.D,
        example: "fload [Ra+Rb],Fc",
        description: "Load float from memory at Ra+Rb into Fc",
      },
      {
        format: InstructionFormat.E,
        example: "fload [Ra+data16],Fc",
        description: "Load float from memory at Ra+data16 into Fc",
      },
    ],
    category: "memory",
  },
  fstore: {
    mnemonic: "fstore",
    description: "Store floating point value to memory",
    formats: [
      {
        format: InstructionFormat.D,
        example: "fstore Fc,[Ra+Rb]",
        description: "Store float Fc to memory at Ra+Rb",
      },
      {
        format: InstructionFormat.E,
        example: "fstore Fc,[Ra+data16]",
        description: "Store float Fc to memory at Ra+data16",
      },
    ],
    category: "memory",
  },

  // Branch instructions
  be: {
    mnemonic: "be",
    description: "Branch if equal",
    formats: [
      {
        format: InstructionFormat.C,
        example: "be Ra+Rc",
        description: "Branch to Ra+Rc if equal flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "be data24",
        description: "Branch to data24 if equal flag is set",
      },
    ],
    category: "control",
  },
  bne: {
    mnemonic: "bne",
    description: "Branch if not equal",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bne Ra+Rc",
        description: "Branch to Ra+Rc if equal flag is clear",
      },
      {
        format: InstructionFormat.F,
        example: "bne data24",
        description: "Branch to data24 if equal flag is clear",
      },
    ],
    category: "control",
  },

  // Comparison branches for less/greater
  bl: {
    mnemonic: "bl",
    description: "Branch if less than",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bl Ra+Rc",
        description: "Branch to Ra+Rc if less than flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "bl data24",
        description: "Branch to data24 if less than flag is set",
      },
    ],
    category: "control",
  },
  ble: {
    mnemonic: "ble",
    description: "Branch if less than or equal",
    formats: [
      {
        format: InstructionFormat.C,
        example: "ble Ra+Rc",
        description: "Branch to Ra+Rc if less than or equal flags are set",
      },
      {
        format: InstructionFormat.F,
        example: "ble data24",
        description: "Branch to data24 if less than or equal flags are set",
      },
    ],
    category: "control",
  },
  bg: {
    mnemonic: "bg",
    description: "Branch if greater than",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bg Ra+Rc",
        description: "Branch to Ra+Rc if greater than flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "bg data24",
        description: "Branch to data24 if greater than flag is set",
      },
    ],
    category: "control",
  },
  bge: {
    mnemonic: "bge",
    description: "Branch if greater than or equal",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bge Ra+Rc",
        description: "Branch to Ra+Rc if greater than or equal flags are set",
      },
      {
        format: InstructionFormat.F,
        example: "bge data24",
        description: "Branch to data24 if greater than or equal flags are set",
      },
    ],
    category: "control",
  },

  // Overflow/carry status branches
  bvs: {
    mnemonic: "bvs",
    description: "Branch if overflow set",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bvs Ra+Rc",
        description: "Branch to Ra+Rc if overflow flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "bvs data24",
        description: "Branch to data24 if overflow flag is set",
      },
    ],
    category: "control",
  },
  bvc: {
    mnemonic: "bvc",
    description: "Branch if overflow clear",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bvc Ra+Rc",
        description: "Branch to Ra+Rc if overflow flag is clear",
      },
      {
        format: InstructionFormat.F,
        example: "bvc data24",
        description: "Branch to data24 if overflow flag is clear",
      },
    ],
    category: "control",
  },
  bns: {
    mnemonic: "bns",
    description: "Branch if negative set",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bns Ra+Rc",
        description: "Branch to Ra+Rc if negative flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "bns data24",
        description: "Branch to data24 if negative flag is set",
      },
    ],
    category: "control",
  },
  bnc: {
    mnemonic: "bnc",
    description: "Branch if negative clear",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bnc Ra+Rc",
        description: "Branch to Ra+Rc if negative flag is clear",
      },
      {
        format: InstructionFormat.F,
        example: "bnc data24",
        description: "Branch to data24 if negative flag is clear",
      },
    ],
    category: "control",
  },

  // System status branches
  bss: {
    mnemonic: "bss",
    description: "Branch if supervisor set",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bss Ra+Rc",
        description: "Branch to Ra+Rc if supervisor mode flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "bss data24",
        description: "Branch to data24 if supervisor mode flag is set",
      },
    ],
    category: "control",
  },
  bsc: {
    mnemonic: "bsc",
    description: "Branch if supervisor clear",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bsc Ra+Rc",
        description: "Branch to Ra+Rc if supervisor mode flag is clear",
      },
      {
        format: InstructionFormat.F,
        example: "bsc data24",
        description: "Branch to data24 if supervisor mode flag is clear",
      },
    ],
    category: "control",
  },
  bis: {
    mnemonic: "bis",
    description: "Branch if interrupt set",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bis Ra+Rc",
        description: "Branch to Ra+Rc if interrupt flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "bis data24",
        description: "Branch to data24 if interrupt flag is set",
      },
    ],
    category: "control",
  },
  bic: {
    mnemonic: "bic",
    description: "Branch if interrupt clear",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bic Ra+Rc",
        description: "Branch to Ra+Rc if interrupt flag is clear",
      },
      {
        format: InstructionFormat.F,
        example: "bic data24",
        description: "Branch to data24 if interrupt flag is clear",
      },
    ],
    category: "control",
  },

  // Paging status branches
  bps: {
    mnemonic: "bps",
    description: "Branch if paging set",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bps Ra+Rc",
        description: "Branch to Ra+Rc if paging flag is set",
      },
      {
        format: InstructionFormat.F,
        example: "bps data24",
        description: "Branch to data24 if paging flag is set",
      },
    ],
    category: "control",
  },
  bpc: {
    mnemonic: "bpc",
    description: "Branch if paging clear",
    formats: [
      {
        format: InstructionFormat.C,
        example: "bpc Ra+Rc",
        description: "Branch to Ra+Rc if paging flag is clear",
      },
      {
        format: InstructionFormat.F,
        example: "bpc data24",
        description: "Branch to data24 if paging flag is clear",
      },
    ],
    category: "control",
  },
  mov: {
    mnemonic: "mov",
    description: "Move (copy) value from one register to another",
    formats: [
      {
        format: InstructionFormat.C,
        example: "mov Ra,Rc",
        description: "Copy value from Ra to Rc",
      },
    ],
    category: "memory",
  },

  set: {
    mnemonic: "set",
    description: "Set a register to an immediate value",
    formats: [
      {
        format: InstructionFormat.G,
        example: "set data16,Rc",
        description: "Set register Rc to immediate value",
      },
    ],
    category: "arithmetic",
  },

  cmp: {
    mnemonic: "cmp",
    description: "Compare two values and set condition codes",
    formats: [
      {
        format: InstructionFormat.C,
        example: "cmp Ra,Rc",
        description: "Compare Ra with Rc and set condition codes",
      },
    ],
    category: "arithmetic",
  },

  // No-operand system control instructions
  cleari: {
    mnemonic: "cleari",
    description: "Clear interrupt enable flag",
    formats: [
      {
        format: InstructionFormat.A,
        example: "cleari",
        description: "Clear the interrupt enable flag in status register",
      },
    ],
    category: "system",
  },

  seti: {
    mnemonic: "seti",
    description: "Set interrupt enable flag",
    formats: [
      {
        format: InstructionFormat.A,
        example: "seti",
        description: "Set the interrupt enable flag in status register",
      },
    ],
    category: "system",
  },

  clearp: {
    mnemonic: "clearp",
    description: "Clear paging enable flag",
    formats: [
      {
        format: InstructionFormat.A,
        example: "clearp",
        description: "Clear the paging enable flag in status register",
      },
    ],
    category: "system",
  },

  setp: {
    mnemonic: "setp",
    description: "Set paging enable flag",
    formats: [
      {
        format: InstructionFormat.A,
        example: "setp",
        description: "Set the paging enable flag in status register",
      },
    ],
    category: "system",
  },

  clears: {
    mnemonic: "clears",
    description: "Clear supervisor mode flag",
    formats: [
      {
        format: InstructionFormat.A,
        example: "clears",
        description: "Clear the supervisor mode flag in status register",
      },
    ],
    category: "system",
  },
};

// -------------------- Directives --------------------

export const Directives: { [key: string]: DirectiveDefinition } = {
  ".ascii": {
    name: ".ascii",
    description: "Define ASCII string constant",
    operands: ["string"],
    example: '.ascii "hello\\n\\0"',
  },
  ".byte": {
    name: ".byte",
    description: "Define 8-bit value",
    operands: ["immediate"],
    example: ".byte ('a'+4)&0x0f",
  },
  ".word": {
    name: ".word",
    description: "Define 32-bit word value or address",
    operands: ["immediate"],
    example: ".word MyLabel+4",
  },
  ".double": {
    name: ".double",
    description: "Define 32-bit floating point value",
    operands: ["immediate"],
    example: ".double -12.34e-56",
  },
  ".align": {
    name: ".align",
    description: "Align to next boundary",
    operands: [],
    example: ".align",
  },
  ".skip": {
    name: ".skip",
    description: "Skip specified number of bytes",
    operands: ["immediate"],
    example: ".skip 1000",
  },
  ".data": {
    name: ".data",
    description: "Begin data section",
    operands: [],
    example: ".data",
  },
  ".text": {
    name: ".text",
    description: "Begin code section",
    operands: [],
    example: ".text",
  },
  ".bss": {
    name: ".bss",
    description: "Begin uninitialized data section",
    operands: [],
    example: ".bss",
  },
  ".export": {
    name: ".export",
    description: "Export symbol for use by other modules",
    operands: ["label"],
    example: ".export MyLabel",
  },
  ".import": {
    name: ".import",
    description: "Import symbol from another module",
    operands: ["label"],
    example: ".import ForeignProc",
  },
};

export class RegisterSet {
  private static generateRegisters(
    prefix: string,
    count: number,
    type: RegisterType
  ): { [key: string]: RegisterDefinition } {
    const registers: { [key: string]: RegisterDefinition } = {};
    for (let i = 0; i < count; i++) {
      registers[`${prefix}${i}`] = {
        name: `${prefix}${i}`,
        number: i,
        description:
          type === RegisterType.INTEGER
            ? `32-bit general purpose register ${i}`
            : `64-bit floating point register ${i}`,
        type: type,
      };
    }
    return registers;
  }

  static getAllRegisters(): { [key: string]: RegisterDefinition } {
    return {
      ...RegisterSet.generateRegisters("r", 16, RegisterType.INTEGER),
      ...RegisterSet.generateRegisters("f", 16, RegisterType.FLOAT),
      pc: {
        name: "pc",
        number: -1,
        description: "Program Counter",
        type: RegisterType.INTEGER,
        isReserved: true,
      },
      sr: {
        name: "sr",
        number: -1,
        description: "Status Register",
        type: RegisterType.INTEGER,
        isReserved: true,
      },
    };
  }
}

export const Registers = RegisterSet.getAllRegisters();
