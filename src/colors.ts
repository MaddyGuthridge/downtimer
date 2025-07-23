import pc from 'picocolors';

/**
 * Colorizer function, takes a string and applies a color to it.
 */
type Colorizer = (s: string) => string;

/** Identity function: applies no color to string */
const identity: Colorizer = s => s;


export default function colors(useColor: boolean) {
  const noColor = !!process.env.NO_COLOR && useColor && (!pc.isColorSupported);

  function handleColor(c: Colorizer): Colorizer {
    return noColor ? identity : c;
  }

  /** Color for function names in log output */
  const func = handleColor(pc.cyan);
  /** Color for type names in log output */
  const type = handleColor(pc.red);
  /**
   * Color for output that is less relevant to readers (eg parts of stack trace within `node_modules`)
   */
  const quiet = handleColor(pc.gray);
  /** Color for file names */
  const file = handleColor(pc.reset);
  /** Color for heading text */
  const heading = handleColor(pc.magenta);
  /** Color for error text */
  const error = handleColor(pc.red);

  return {
    func,
    type,
    file,
    quiet,
    heading,
    error,
  } as const;
}

export type Colors = ReturnType<typeof colors>;
