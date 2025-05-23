import { execa } from 'execa';
import { DowntimerOptions } from '../src/options';

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runTestProgram(program: string) {
  return execa`npm run --silent tsx tests/testPrograms/${program}`;
}

export const optionsNoLogging: DowntimerOptions = {
  logConfig: {
    clear: {
      notFound: 'off',
      success: 'off',
      allOutstanding: 'off',
    },
    execute: {
      before: 'off',
      onError: 'off',
    },
    exitWithOutstandingTimers: 'off',
    schedule: 'off',
  },
};
