import chalk, { type ChalkInstance } from 'chalk';

const noColor = !!process.env.NO_COLOR;

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

export default {
  func,
  type,
  file,
  quietFile: quiet,
  heading,
  error,
};
