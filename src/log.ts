import chalk, { ChalkInstance } from 'chalk';
import { LogMode } from './options';
import { TimerInfo } from './downtimer';
import { TimerId } from './types';
import { getTrace } from './stackTrace';
import { format } from 'date-fns';

function formatTime(t: number) {
  return format(new Date(t), 'hh:mm:ss');
}

function displayHeading(msg: string, color: ChalkInstance) {
  console.log(`${chalk.magenta(`[DOWNTIMER]@${formatTime(Date.now())}`)} ${color(msg)}`);
}

function displayScheduleTime(scheduledAt: number, scheduledFor: number) {
  console.log(`  Scheduled at ${formatTime(scheduledAt)}`);
  const delta = Date.now() - scheduledFor;
  let lateness = '';
  if (delta > 0) {
    lateness = ` (${delta} ms late)`;
  } else if (delta < 0) {
    lateness = ` (${-delta} ms early)`;
  }
  console.log(`  Scheduled for ${formatTime(scheduledFor)}${lateness}`);
}

function displayStackTrace(stackTrace: string, kind?: string) {
  const title = kind !== undefined ? `Stack trace of ${kind}` : 'Stack trace';
  console.log(`${chalk.yellow}${title}${chalk.reset}`);
  console.log(stackTrace);
}

function displayError(e: unknown) {
  if (e instanceof Error) {
    console.log(`${chalk.red(e.name)}: ${e.message}`);
    displayStackTrace(e.stack!, 'error');
  } else {
    console.log(chalk.red(`${e}`));
  }
}

export function logSchedule(mode: LogMode, timer: TimerInfo) {
  if (mode === 'off') return;
  displayHeading(`Schedule timer '${timer.externalId}'`, chalk.cyan);
  if (mode === 'minimal') return;
  displayStackTrace(timer.scheduleStackTrace);
}

export function logBeforeExecute(mode: LogMode, timer: TimerInfo) {
  if (mode === 'off') return;
  displayHeading(`Execute timer '${timer.externalId}'`, chalk.cyan);
  if (mode === 'minimal') return;

  displayScheduleTime(timer.scheduledAt, timer.scheduledFor);
  displayStackTrace(timer.scheduleStackTrace, 'scheduler');
}

export function logErrorInExecute(mode: LogMode, timer: TimerInfo, execError: unknown) {
  if (mode === 'off') return;
  displayHeading(`Unhandled error in timer '${timer.externalId}'`, chalk.red);
  if (mode === 'minimal') return;
  displayScheduleTime(timer.scheduledAt, timer.scheduledFor);
  displayStackTrace(timer.scheduleStackTrace, 'scheduler');
  displayError(execError);
}

export function logClearNotFound(mode: LogMode, timerId: TimerId) {
  if (mode === 'off') return;
  displayHeading(`Failed to clear timer: '${timerId}' not found`, chalk.yellow);
  if (mode === 'minimal') return;
  displayStackTrace(getTrace());
}

export function logClearSuccess(mode: LogMode, timer: TimerInfo) {
  if (mode === 'off') return;
  displayHeading(`Cleared timer '${timer.externalId}'`, chalk.cyan);
  if (mode === 'minimal') return;
  displayStackTrace(timer.scheduleStackTrace, 'Scheduler');
  displayStackTrace(getTrace(), 'Clearer');
}

export function logClearAll(mode: LogMode, timers: Record<string, TimerInfo>) {
  if (mode === 'off') return;
  const n = Object.keys(timers).length;
  displayHeading(`Cleared ${n} timer${n === 1 ? '' : 's'}`, chalk.cyan);
  if (mode === 'minimal') return;
  for (const t of Object.values(timers)) {
    console.log(` -> '${t.externalId}'`);
    displayScheduleTime(t.scheduledAt, t.scheduledFor);
  }
  displayStackTrace(getTrace(), 'Clearer');
}

export function logClearOnExit(mode: LogMode, timers: Record<string, TimerInfo>, code: number) {
  if (mode === 'off') return;
  const n = Object.keys(timers).length;
  displayHeading(`Clearing ${n} timer${n === 1 ? '' : 's'} due to exit with code ${code}`, chalk.cyan);
}
