import { execa } from 'execa';

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runTestProgram(program: string) {
  return execa`npm run --silent tsx tests/testPrograms/${program}`;
}
