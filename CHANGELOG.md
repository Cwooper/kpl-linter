# Change Log

All notable changes to the KPL Language Support extension will be documented in
this file.

### [0.0.7] 2025-01-23

Added `btst` instruction hotfix

### [0.0.6] 2025-01-23

Added basic linting and hover support for Blitz Assembly files

## [0.0.5] - 2025-01-21

Added CI/CD for faster development and deployment

## [0.0.4] - 2025-01-21

### Added
- Formatter for Blitz Assembly (.s):
- Aligns comments to a defined column (TAB_SIZE and COMMENT_COLUMN rules).
- Handles labels, instructions, and comment-only lines.
- Supports multi-line formatting for instructions and comments.
- Improved code readability and alignment for Blitz Assembly files.

## [0.0.3] - 2025-01-20

### Added
- Support for Blitz Assembly (.s) files
  - Syntax highlighting for instructions, labels, registers, and comments
  - Label-based indentation
  - Bracket matching and auto-closing
  - Smart highlighting for memory access patterns
  - Additional instructions: mov, cmp
  - Special handling for section header comments

## [0.0.2] - 2025-01-18

- Fixed package extensions

## [0.0.1] - 2025-01-18

### Added
- Initial syntax highlighting support
- Basic language configuration
  - Comment toggling
  - Bracket matching
  - Auto-closing pairs
  - Code block detection
- Smart indentation for:
  - Code blocks
  - Class definitions
  - Function definitions
  - Control structures
