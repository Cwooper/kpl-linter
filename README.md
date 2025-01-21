# KPL Language Support

Syntax highlighting and language support for the Kernel Programming Language
(KPL) in Visual Studio Code. 

Syntax highlighting based on Context Free Lanuage [here](https://web.cecs.pdx.edu/~harry/Blitz/BlitzDoc/Syntax.pdf).

## Features

- Full syntax highlighting for KPL files (`.k` extension)
- Smart bracket matching and autoclosing
- Code folding
- Comment toggling
- Auto-indentation for code blocks
- Support for:
  - Classes and interfaces
  - Functions and methods
  - Control structures
  - Type declarations
  - Error handling
  - Parameterized classes
  - Function types and pointers

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
