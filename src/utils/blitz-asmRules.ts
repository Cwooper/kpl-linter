export class FormattingRules {
  private readonly TAB_SIZE = 8;
  private readonly COMMENT_COLUMN = 49; // 1-indexed

  private stripComment(line: string): { code: string; comment: string | null } {
    let inString = false;
    let stringChar: string | null = null;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
      }

      if (char === "!" && !inString) {
        return {
          code: line.substring(0, i).trimEnd(),
          comment: line.substring(i),
        };
      }
    }

    return { code: line.trimEnd(), comment: null };
  }

  private calculateTabsNeeded(currentPos: number, targetCol: number): number {
    const remainingSpaces = targetCol - currentPos;
    if (remainingSpaces <= 0) return 1; // At least one tab/space separator

    // Calculate how many tabs we need to get to or past the target column
    let tabsNeeded = Math.ceil(remainingSpaces / this.TAB_SIZE);

    // If adding these tabs would put us too far past the target, reduce by one
    while (tabsNeeded > 1) {
      const posWithTabs = currentPos + tabsNeeded * this.TAB_SIZE;
      if (posWithTabs <= targetCol + this.TAB_SIZE) break;
      tabsNeeded--;
    }

    return tabsNeeded;
  }

  private getEffectiveLength(str: string): number {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "\t") {
        // Move to the next tab stop
        length = Math.ceil((length + 1) / this.TAB_SIZE) * this.TAB_SIZE;
      } else {
        length++;
      }
    }
    return length;
  }

  private alignComment(code: string, comment: string): string {
    const effectiveLength = this.getEffectiveLength(code);

    // If we're already past the comment column, just add one space
    if (effectiveLength >= this.COMMENT_COLUMN - 1) {
      return code + " " + comment;
    }

    // Calculate tabs needed to reach the comment column
    const tabsNeeded = this.calculateTabsNeeded(
      effectiveLength,
      this.COMMENT_COLUMN - 1
    );
    return code + "\t".repeat(tabsNeeded) + comment;
  }

  private isLabelLine(code: string): boolean {
    let inString = false;
    let stringChar: string | null = null;

    if (code.length === 0) return false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
      }

      if (char === ":" && !inString && i === code.length - 1) {
        return true;
      }
    }

    return false;
  }

  public formatLine(line: string): string | string[] {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      return "";
    }

    // Handle comment-only lines
    if (trimmedLine.startsWith("!")) {
      return trimmedLine;
    }

    const { code, comment } = this.stripComment(trimmedLine);
    const cleanCode = code.trimEnd();

    // Handle empty lines with only comments
    if (cleanCode.length === 0 && comment) {
      return comment;
    }

    // First check if this is a pure label line (no content after the colon)
    if (this.isLabelLine(cleanCode)) {
      return comment ? this.alignComment(cleanCode, comment) : cleanCode;
    }

    // Now check if there's content after a label
    const colonIndex = cleanCode.indexOf(":");
    if (colonIndex !== -1) {
      let inString = false;
      let stringChar: string | null = null;

      for (let i = 0; i < colonIndex; i++) {
        const char = cleanCode[i];
        if (char === '"' || char === "'") {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = null;
          }
        }
      }

      if (!inString && colonIndex < cleanCode.length - 1) {
        const label = cleanCode.substring(0, colonIndex + 1);
        const remainder = cleanCode.substring(colonIndex + 1).trim();

        if (remainder.length > 0) {
          // Format both lines with proper comment alignment if needed
          if (comment) {
            const secondLine = "\t" + remainder;
            return [label, this.alignComment(secondLine, comment)];
          }
          return [label, "\t" + remainder];
        }
      }
    }

    // Handle regular instructions
    const formattedLine = "\t" + cleanCode;
    return comment ? this.alignComment(formattedLine, comment) : formattedLine;
  }

  public formatLines(lines: string[]): string[] {
    return lines.flatMap((line) => this.formatLine(line));
  }
}
