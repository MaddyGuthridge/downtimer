import { execa } from 'execa';

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runTestProgram(program: string) {
  const { exitCode, stdout } = await execa`npm run tsx tests/testPrograms/${program}`;
  return {
    exitCode,
    stdout,
  };
}
