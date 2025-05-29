import { Chalk, supportsColor, type ChalkInstance } from 'chalk';


export default function colors(useColor: boolean) {
  const noColor = !!process.env.NO_COLOR && useColor;

  const colorLevel = supportsColor ? supportsColor.level : 0;

  const chalk = new Chalk({ level: noColor ? 0 : colorLevel });

  function handleColor(c: ChalkInstance) {
    return noColor ? chalk.reset : c;
  }

  /** Color for function names in log output */
  const func = handleColor(chalk.cyan);
  /** Color for type names in log output */
  const type = handleColor(chalk.red);
  /**
   * Color for output that is less relevant to readers (eg parts of stack trace within `node_modules`)
   */
  const quiet = handleColor(chalk.gray);
  /** Color for file names */
  const file = handleColor(chalk.reset);
  /** Color for heading text */
  const heading = handleColor(chalk.magenta);
  /** Color for error text */
  const error = handleColor(chalk.red);

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
