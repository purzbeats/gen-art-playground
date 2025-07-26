/**
 * Parses error messages to extract line numbers and provide better context
 */
export function parseCodeError(error: Error, code: string): {
  message: string;
  line?: number;
  column?: number;
  context?: string;
} {
  const errorString = error.toString();
  
  // Try to extract line and column from error message
  // Common patterns: "at line X", "Line X:", "(X:Y)"
  const lineMatch = errorString.match(/(?:line|Line)\s*(\d+)|:(\d+):(\d+)|at\s+.*:(\d+):(\d+)/);
  
  let line: number | undefined;
  let column: number | undefined;
  
  if (lineMatch) {
    line = parseInt(lineMatch[1] || lineMatch[2] || lineMatch[4]) || undefined;
    column = parseInt(lineMatch[3] || lineMatch[5]) || undefined;
  }
  
  // If we have a line number, get context
  let context: string | undefined;
  if (line && code) {
    const lines = code.split('\n');
    const startLine = Math.max(0, line - 3);
    const endLine = Math.min(lines.length, line + 2);
    
    context = lines
      .slice(startLine, endLine)
      .map((lineContent, index) => {
        const lineNumber = startLine + index + 1;
        const isErrorLine = lineNumber === line;
        const prefix = isErrorLine ? '>' : ' ';
        return `${prefix} ${lineNumber.toString().padStart(3)} | ${lineContent}`;
      })
      .join('\n');
  }
  
  // Clean up the error message
  let message = error.message;
  
  // Remove generic prefixes
  message = message.replace(/^(SyntaxError:|ReferenceError:|TypeError:|Error:)\s*/i, '');
  
  // Add line number if found
  if (line) {
    message = `Line ${line}: ${message}`;
  }
  
  return {
    message,
    line,
    column,
    context
  };
}

/**
 * Formats an error for display in the UI
 */
export function formatError(error: Error, code?: string): string {
  if (!code) {
    return error.message;
  }
  
  const parsed = parseCodeError(error, code);
  
  let formatted = parsed.message;
  
  if (parsed.context) {
    formatted += '\n\n' + parsed.context;
  }
  
  return formatted;
}