import { LogMode } from './options';
import { TimerInfo } from './downtimer';
import { TimerId } from './types';
import { displayError, displayTrace, getStackTrace } from './stackTrace';
import { format } from 'date-fns';
import colors from './colors';

function formatTime(t: number) {
  return format(new Date(t), 'hh:mm:ss');
}

function displayHeading(msg: string) {
  console.log(colors.heading(`[DOWNTIMER]@${formatTime(Date.now())} ${msg}`));
}

function displayScheduleTime(scheduledAt: number, scheduledFor: number) {
  console.log(`  Scheduled at ${formatTime(scheduledAt)}`);
  const delta = Date.now() - scheduledFor;
  let lateness = '';
  if (delta > 10) {
    lateness = ` (${delta} ms late)`;
  } else if (delta < -10) {
    lateness = ` (${-delta} ms early)`;
  }
  console.log(`  Scheduled for ${formatTime(scheduledFor)}${lateness}`);
}

export function logSchedule(mode: LogMode, timer: TimerInfo) {
  if (mode === 'off') return;
  displayHeading(`Schedule timer '${timer.externalId}'`);
  if (mode === 'minimal') return;
  console.log('  Stack trace of scheduler');
  displayTrace(timer.scheduleStackTrace);
}

export function logBeforeExecute(mode: LogMode, timer: TimerInfo) {
  if (mode === 'off') return;
  displayHeading(`Execute timer '${timer.externalId}'`);
  if (mode === 'minimal') return;

  displayScheduleTime(timer.scheduledAt, timer.scheduledFor);
  console.log('  Stack trace of scheduler');
  displayTrace(timer.scheduleStackTrace);
}

export function logErrorInExecute(mode: LogMode, timer: TimerInfo, execError: unknown) {
  if (mode === 'off') return;
  displayHeading(`Unhandled error in timer '${timer.externalId}'`);
  if (mode === 'minimal') return;
  displayScheduleTime(timer.scheduledAt, timer.scheduledFor);
  displayError(execError);
  console.log('  Stack trace of scheduler');
  displayTrace(timer.scheduleStackTrace);
}

export function logClearNotFound(mode: LogMode, timerId: TimerId) {
  if (mode === 'off') return;
  displayHeading(`Failed to clear timer: '${timerId}' not found`);
  if (mode === 'minimal') return;
  displayTrace(getStackTrace());
}

export function logClearSuccess(mode: LogMode, timer: TimerInfo) {
  if (mode === 'off') return;
  displayHeading(`Cleared timer '${timer.externalId}'`);
  if (mode === 'minimal') return;
  console.log('  Stack trace of scheduler');
  displayTrace(timer.scheduleStackTrace);
  console.log('  Stack trace of clearer');
  displayTrace(getStackTrace());
}

export function logClearAll(mode: LogMode, timers: Record<string, TimerInfo>) {
  if (mode === 'off') return;
  const n = Object.keys(timers).length;
  displayHeading(`Cleared ${n} timer${n === 1 ? '' : 's'}`);
  if (mode === 'minimal') return;
  for (const t of Object.values(timers)) {
    console.log(` -> '${t.externalId}'`);
    displayScheduleTime(t.scheduledAt, t.scheduledFor);
  }
  console.log('  Stack trace of clearer');
  displayTrace(getStackTrace());
}

export function logClearOnExit(mode: LogMode, timers: Record<string, TimerInfo>, code: number) {
  if (mode === 'off') return;
  const n = Object.keys(timers).length;
  displayHeading(`Clearing ${n} timer${n === 1 ? '' : 's'} due to exit with code ${code}`);
}
