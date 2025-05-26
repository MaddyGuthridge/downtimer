import colors from './colors';

export type StackFrame = {
  file: string
  function: string | null
  pos: [number, number] | null
}

const SOURCE_ROW_REGEX = /:\d+:\d+\)$/;
const SOURCE_COL_REGEX = /:\d+\)$/;
const AT_REGEX = /^at /;

/** Find opening '(', which denotes start of filename */
const FILENAME_START_REGEX = /\(/;

/** Match the filename, source position and surrounding parentheses */
const FILENAME_REGEX = /\(.+:\d+:\d+\)$/;

function determineFunctionName(line: string): string | null {
  const open = FILENAME_START_REGEX.exec(line);
  if (open === null) {
    return null;
  }
  // Remove leading 'at '
  return line.slice(0, open.index - 1).replace(AT_REGEX, '');
}

function determineFileName(line: string): string {
  // Search for text between first '(' and last ':line:column)'
  const match = FILENAME_REGEX.exec(line);
  if (match) {
    // Slice out the parentheses
    return match[0].replace(SOURCE_ROW_REGEX, '').slice(1);
  } else {
    // Trace had no function, just remove the 'at' and the and file position
    return line.replace(AT_REGEX, '').replace(SOURCE_ROW_REGEX, '');
  }
}

function determineSourcePosition(line: string): [number, number] | null {
  const rowIdx = line.search(SOURCE_ROW_REGEX);
  const colIdx = line.search(SOURCE_COL_REGEX);
  if (rowIdx === -1) {
    return null;
  }

  const row = parseInt(line.slice(rowIdx + 1, colIdx));
  const col = parseInt(line.slice(colIdx + 1, -1));
  return [row, col];
}

function parseStackFrame(line: string): StackFrame {
  line = line.trim();
  return {
    file: determineFileName(line),
    function: determineFunctionName(line),
    pos: determineSourcePosition(line),
  };
}

/** Parse a stack trace from an Error object */
export function parseStackFromError(e: Error) {
  // Remove first line with error contents
  return e.stack!.split('\n').slice(1).map(parseStackFrame);
}

/** Get the current stack trace */
export function getStackTrace() {
  return parseStackFromError(new Error());
}

export function displayTrace(trace: StackFrame[]) {
  for (const frame of trace) {
    const fn = colors.func(frame.function ?? '<unknown>');
    const file = colors.file(frame.file ?? '<unknown>');
    const pos = frame.pos ? `:${frame.pos[0]}:${frame.pos[1]}` : '';
    console.log(`    at ${fn} (${file}${pos})`);
  }
}

export function displayError(e: unknown) {
  if (e instanceof Error) {
    const stack = parseStackFromError(e);
    console.log(`  ${colors.error(e.name)}: ${e.message}`);
    displayTrace(stack);
  } else {
    console.log(colors.error('  Error object is not of type `Error`. Cannot determine stack trace.'));
    console.log(colors.error(e));
  }
}
