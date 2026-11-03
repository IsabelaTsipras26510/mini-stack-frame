/**
 * Parses a single V8 stack frame line into its component fields.
 *
 * A V8 stack frame is one line of `Error().stack`, for example:
 *   at foo (/app/index.js:1:2)
 *   at /app/index.js:1:2
 *   at foo (native)
 *
 * The function name is optional. The location is either a file path with
 * line and column, or the literal string `native`.
 *
 * @param {string} frame - A single stack frame line, with or without leading
 *   whitespace and the leading `at`.
 * @returns {{ file: string | null, line: number | null, column: number | null, functionName: string | null }}
 * @throws {TypeError} If `frame` is not a string.
 */
export function parseStackFrame(frame) {
  if (typeof frame !== 'string') {
    throw new TypeError('frame must be a string');
  }

  // Strip leading whitespace and an optional leading "at ".
  let s = frame.trim();
  if (s.toLowerCase().startsWith('at ')) {
    s = s.slice(3).trim();
  }

  let functionName = null;
  let location = s;

  // The function name is everything before the first ` (`. A location such as
  // `/app/index.js:1:2` contains no ` (`, so it stays as the location.
  const openParen = s.indexOf(' (');
  if (openParen !== -1 && s.endsWith(')')) {
    functionName = s.slice(0, openParen);
    location = s.slice(openParen + 2, -1);
  }

  // A bare location is either the literal `native` or a file with line/column.
  if (location === 'native') {
    return { file: null, line: null, column: null, functionName };
  }

  const match = /^(.*):(\d+):(\d+)$/.exec(location);
  if (!match) {
    // Unknown shape: keep the function name if we found one, but there is no
    // usable file/line/column to report.
    return { file: null, line: null, column: null, functionName };
  }

  return {
    file: match[1],
    line: Number(match[2]),
    column: Number(match[3]),
    functionName,
  };
}

/**
 * A parsed V8 stack frame.
 *
 * `file`, `line`, `column`, and `functionName` are null when the frame does
 * not carry that information (for example `at native`).
 */
export class StackFrame {
  /**
   * @param {string | null} file
   * @param {number | null} line
   * @param {number | null} column
   * @param {string | null} functionName
   */
  constructor(file, line, column, functionName) {
    this.file = file;
    this.line = line;
    this.column = column;
    this.functionName = functionName;
  }

  /**
   * Parse a single stack frame line into a StackFrame instance.
   *
   * @param {string} frame
   * @returns {StackFrame}
   */
  static parse(frame) {
    const parsed = parseStackFrame(frame);
    return new StackFrame(
      parsed.file,
      parsed.line,
      parsed.column,
      parsed.functionName,
    );
  }
}
