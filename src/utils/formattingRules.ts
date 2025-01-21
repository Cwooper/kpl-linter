export class FormattingRules {
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

  private isLabelLine(code: string): boolean {
    let inString = false;
    let stringChar: string | null = null;

    // Handle empty strings
    if (code.length === 0) {
      return false;
    }

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

      // Only consider it a label if the colon is at the end and not in a string
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
      return cleanCode + (comment ? " " + comment : "");
    }

    // Now check if there's content after a label
    const colonIndex = cleanCode.indexOf(":");
    if (colonIndex !== -1) {
      // Check if the colon is part of a label (not in a string and has content after it)
      let inString = false;
      let stringChar: string | null = null;
      let isLabelColon = true;

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
        // This is a label with content after it
        const label = cleanCode.substring(0, colonIndex + 1);
        const remainder = cleanCode.substring(colonIndex + 1).trim();

        if (remainder.length > 0) {
          return [label, "\t" + remainder + (comment ? "\t" + comment : "")];
        }
      }
    }

    // Handle regular instructions
    const formattedLine = "\t" + cleanCode;
    return formattedLine + (comment ? "\t" + comment : "");
  }

  public formatLines(lines: string[]): string[] {
    return lines.flatMap((line) => this.formatLine(line));
  }
}
