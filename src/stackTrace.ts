import { type Colors } from './colors';

export type StackFrame = {
  file: string
  function: string | null
  pos: [number, number] | null
}

/** Source row, only if trailing ')' has been trimmed */
const SOURCE_ROW_REGEX = /:\d+:\d+$/;

/** Source column, only if trailing ')' has been trimmed */
const SOURCE_COL_REGEX = /:\d+$/;

const AT_REGEX = /^at /;

/** Find opening '(', which denotes start of filename */
const FILENAME_START_REGEX = /\(/;

/** Find closing ')', which denotes end of filename */
const FILENAME_END_REGEX = /\)$/;

/** Match the filename, source position and surrounding parentheses */
const FILENAME_REGEX = /\(.+:\d+:\d+\)$/;

/** Determine the function name, given a line in a stack trace */
function determineFunctionName(line: string): string | null {
  const open = FILENAME_START_REGEX.exec(line);
  if (open === null) {
    return null;
  }
  // Remove leading 'at '
  return line.slice(0, open.index - 1).replace(AT_REGEX, '');
}

/** Determine the file name, given a line in a stack trace */
function determineFileName(line: string): string {
  // Search for text between first '(' and last ':line:column)'
  const match = FILENAME_REGEX.exec(line);
  if (match) {
    // Slice out the parentheses
    return match[0].replace(FILENAME_END_REGEX, '').replace(SOURCE_ROW_REGEX, '').slice(1);
  } else {
    // Trace had no function, just remove the 'at' and the and file position
    return line.replace(AT_REGEX, '').replace(SOURCE_ROW_REGEX, '');
  }
}

/** Determine source position, given a line in a stack trace */
function determineSourcePosition(line: string): [number, number] | null {
  line = line.replace(FILENAME_END_REGEX, '');
  const rowIdx = line.search(SOURCE_ROW_REGEX);
  const colIdx = line.search(SOURCE_COL_REGEX);
  if (rowIdx === -1) {
    return null;
  }

  const row = parseInt(line.slice(rowIdx + 1, colIdx));
  const col = parseInt(line.slice(colIdx + 1));
  return [row, col];
}

/** Given a line in a stack trace, produce a `StackFrame` object */
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

/**
 * Return whether a file is relevant to the current project
 *
 * True if all of:
 * * File is within the current working directory
 * * File is not in `node_modules`
 */
function pathIsRelevant(file: string) {
  const cwd = `${process.cwd()}/`;
  const nodeModules = `${process.cwd()}/node_modules`;
  return file.startsWith(cwd) && !file.startsWith(nodeModules);
}

/** Add colors to file path, greying out sections outside of the working directory */
function colorizePath(file: string, colors: Colors): string {
  const cwd = `${process.cwd()}/`;
  if (pathIsRelevant(file)) {
    return `${colors.quiet(cwd)}${colors.file(file.replace(cwd, ''))}`;
  } else {
    return colors.quiet(file);
  }
}

/** Given a stack trace, display it to the user in a colorful and friendly manner */
export function displayTrace(trace: StackFrame[], colors: Colors) {
  for (const frame of trace) {
    const fn = colors.func(frame.function ?? '<unknown>');
    const fileIsRelevant = pathIsRelevant(frame.file);
    const file = colorizePath(frame.file, colors);
    let pos = '';
    if (frame.pos) {
      pos = `:${frame.pos[0]}:${frame.pos[1]}`;
      if (!fileIsRelevant) {
        pos = colors.quiet(pos);
      }
    }
    console.log(`    at ${fn} (${file}${pos})`);
  }
}

/** Given an Error object, display it to the user in a colorful and friendly manner */
export function displayError(e: unknown, colors: Colors) {
  if (e instanceof Error) {
    const stack = parseStackFromError(e);
    console.log(`  ${colors.error(e.name)}: ${e.message}`);
    displayTrace(stack, colors);
  } else {
    console.log(colors.error('  Error object is not of type `Error`. Cannot determine stack trace.'));
    console.log(colors.error(e));
  }
}
