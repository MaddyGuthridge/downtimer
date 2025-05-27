import chalk from 'chalk';

/** Color for function names in log output */
const func = chalk.cyan;
/** Color for type names in log output */
const type = chalk.red;
/**
 * Color for output that is less relevant to readers (eg parts of stack trace within `node_modules`)
 */
const quiet = chalk.gray;
/** Color for file names */
const file = chalk.reset;
/** Color for heading text */
const heading = chalk.magenta;
/** Color for error text */
const error = chalk.red;

export default {
  func,
  type,
  file,
  quietFile: quiet,
  heading,
  error,
};
