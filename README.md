# KPL Language Support

Syntax highlighting and language support for the Kernel Programming Language
(kpl) and the compiled Blitz Assembly Language (blitz-asm) from the
[Blitz System](https://web.cecs.pdx.edu/~harry/Blitz/) (v2.0) in Visual
Studio Code.

Links:
[Code Examples](https://web.cecs.pdx.edu/~harry/Blitz/OSProject/p2/),
[KPL Overview](https://web.cecs.pdx.edu/~harry/Blitz/BlitzDoc/KPLOverview.pdf),
[Context Free Language](https://web.cecs.pdx.edu/~harry/Blitz/BlitzDoc/Syntax.pdf), and
[Instruction Set](https://web.cecs.pdx.edu/~harry/Blitz/BlitzDoc/InstructionSet.pdf),

## Features

- Full syntax highlighting for KPL (`.k`) and Blitz Assembly (`.h`) files
- Smart bracket matching and autoclosing
- Code folding
- Comment toggling
- Auto-indentation for code blocks
- Syntax Highlighting Support for:
  - Classes and interfaces
  - Functions and methods
  - Control structures
  - Type declarations
  - Error handling
  - Parameterized classes
  - Function types and pointers
- A formatter for the `blitz-asm` language files

## Installation

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P` to open the Quick Open dialog
3. Type `ext install kpl-linter`
4. Press Enter

## Requirements

VS Code 1.96.0 or higher

## Known Issues

Please report any issues on the [GitHub repository](https://github.com/Cwooper/kpl-linter).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Release Notes

### 0.0.9

Added constants checking to the KPL language syntax highlighting

### 0.0.8

Added single quote string to the Blitz Assembly Language syntax highlighting

### 0.0.7

Added `btst` instruction hotfix

### 0.0.6

Added basic linting and hover support for Blitz Assembly files

### 0.0.5

Added CI/CD for faster development

### 0.0.4

Added Blitz Assembly formatter with support for:
- Comment alignment and label-based indentation
- Formatting instructions, labels, and comments with customizable tab spacing
- Automatic handling of label lines and in-line comments

### 0.0.3

Added Blitz Assembly support with syntax highlighting, smart indentation, and more.

### 0.0.2

Fixed package extensions

### 0.0.1

Initial release of KPL Language Support:
- Basic syntax highlighting
- Code block detection
- Smart indentation
- Bracket matching

## License

[MIT](LICENSE)
