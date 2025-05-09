import downtimer from '../../src';

const dt = downtimer();

dt.schedule(() => console.log('Uhhhh'), 1000);

process.exit(0);
