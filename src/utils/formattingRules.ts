export class FormattingRules {
  private stripComment(line: string): { code: string; comment: string | null } {
    let inString = false;
    let stringChar: string | null = null;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && !inString) {
        inString = true;
        stringChar = char;
        continue;
      }

      if (char === stringChar && inString) {
        inString = false;
        stringChar = null;
        continue;
      }

      if (char === "!" && !inString) {
        return {
          code: line.substring(0, i).trim(),
          comment: line.substring(i).trim(),
        };
      }
    }

    return { code: line.trim(), comment: null };
  }

  private getInstructionTabs(instruction: string): string {
    return instruction.length < 4 ? "\t\t\t" : "\t\t";
  }

  // Find groups of consecutive lines that should have aligned comments
  private findCommentBlocks(lines: string[]): { start: number; end: number }[] {
    const blocks: { start: number; end: number }[] = [];
    let currentBlock: { start: number; end: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const { code, comment } = this.stripComment(lines[i].trim());

      // Skip empty lines or comment-only lines
      if (!code || !comment) {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        continue;
      }

      // Start new block or extend current one
      if (!currentBlock) {
        currentBlock = { start: i, end: i };
      } else {
        currentBlock.end = i;
      }
    }

    // Add last block if exists
    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks;
  }

  // Calculate the necessary tabs for comment alignment in a block
  private calculateCommentAlignment(
    lines: string[],
    block: { start: number; end: number }
  ): number {
    let maxCodeLength = 0;

    for (let i = block.start; i <= block.end; i++) {
      const line = lines[i].trim();
      const { code } = this.stripComment(line);
      if (!code) continue;

      // Format the code part as it would appear
      const parts = code.split(/\s+/);
      const instruction = parts[0];
      const operands = parts.slice(1).join(" ");

      let formattedLength = 8; // Initial tab
      if (instruction.endsWith(":")) {
        formattedLength = instruction.length;
      } else {
        formattedLength = 8 + instruction.length; // Tab + instruction
        if (operands) {
          formattedLength +=
            (instruction.length < 4 ? 24 : 16) + operands.length; // Additional tabs + operands
        }
      }

      maxCodeLength = Math.max(maxCodeLength, formattedLength);
    }

    // Convert to tabs (round up to next tab stop)
    return Math.ceil(maxCodeLength / 8) + 1; // +1 for minimum spacing
  }

  public formatLines(lines: string[]): string[] {
    // First find all comment blocks
    const blocks = this.findCommentBlocks(lines);
    const formattedLines: string[] = [...lines];

    // Format each block
    for (const block of blocks) {
      const commentTabs = this.calculateCommentAlignment(lines, block);

      // Format each line in the block
      for (let i = block.start; i <= block.end; i++) {
        const line = lines[i].trim();
        const { code, comment } = this.stripComment(line);
        if (!code || !comment) continue;

        // Format the line
        let formattedLine: string;
        if (code.endsWith(":")) {
          formattedLine = code;
        } else {
          const parts = code.split(/\s+/);
          const instruction = parts[0];
          const operands = parts.slice(1).join(" ");

          formattedLine = "\t" + instruction;
          if (operands) {
            formattedLine += this.getInstructionTabs(instruction) + operands;
          }
        }

        // Add aligned comment
        const currentTabs = Math.ceil(formattedLine.length / 8);
        const additionalTabs = Math.max(1, commentTabs - currentTabs);
        formattedLine += "\t".repeat(additionalTabs) + comment;

        formattedLines[i] = formattedLine;
      }
    }

    // Format non-block lines normally
    for (let i = 0; i < lines.length; i++) {
      if (!formattedLines[i] || formattedLines[i] === lines[i]) {
        formattedLines[i] = this.formatLine(lines[i]);
      }
    }

    return formattedLines;
  }

  public formatLine(line: string): string {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      return "";
    }

    const { code, comment } = this.stripComment(trimmedLine);

    if (code.length === 0 && comment) {
      return comment;
    }

    if (code.endsWith(":")) {
      return code + (comment ? "\t\t\t\t" + comment : "");
    }

    if (code.startsWith(".")) {
      return "\t" + code + (comment ? "\t\t\t" + comment : "");
    }

    const parts = code.split(/\s+/);
    const instruction = parts[0];
    const operands = parts.slice(1).join(" ");

    let formattedLine = "\t" + instruction;
    if (operands) {
      formattedLine += this.getInstructionTabs(instruction) + operands;
    }

    if (comment) {
      formattedLine += "\t\t" + comment;
    }

    return formattedLine;
  }
}
