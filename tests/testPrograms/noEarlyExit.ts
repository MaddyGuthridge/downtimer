import downtimer from '../../src';

const dt = downtimer({ logConfig: { exitWithOutstandingTimers: 'off' } });

dt.schedule(() => console.log('Uhhhh'), 1000);

process.exit(0);
