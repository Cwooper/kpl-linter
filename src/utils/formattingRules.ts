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

  public formatLine(line: string): string {
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

    // Handle label lines (ending with ':')
    if (cleanCode.endsWith(":")) {
      return cleanCode + (comment ? " " + comment : "");
    }

    // Handle regular instructions
    const formattedLine = "\t" + cleanCode;

    // Add a tab after the instruction if there's a comment
    return formattedLine + (comment ? "\t" + comment : "");
  }

  public formatLines(lines: string[]): string[] {
    return lines.map((line) => this.formatLine(line));
  }
}
