// blitz parser

// Add functions for tokenizing a line

// Instructions for converting to tokens
    // Labels end with ":"
    // Comments start with "!" to the end of the line
    // Constants have a "=" after them (the value after is their value)
    // Directives start with "."
    // Strings start with "\""
    // Instructions are all others
        // Instructions are found in the blitzDefintitions { Instructions } set
        // Each instruction is followed by 0 or more operands
    // Operand Definitions
        // Registers start with r_, f_, PC or SR
        // Immediate can be any type of number or addr to number. e.g:
            // (1.2, -3.4E-21, +4.5e+21, Label+4, )
        // Label are named
        // Memory start and end with "[" and "]"
        // Constants are named
        // Strings start with "\"" (only used in ascii afaik)
        // data16 is a data16 in hex
        // data24 is a data24 in hex
        // none is No operand

// Perform a first pass
    // Collect data on each line
        // Instruction and operands
        // Directives
        // Labels
        // etc.

// Perform a second pass
    // Validation

    // Note that .import imports a label from elsewere (no validation check)