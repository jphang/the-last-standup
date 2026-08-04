import type { LogEvent, LogTransport } from '../types';

export const consoleTransport: LogTransport = {
  name: 'console',
  write(event: LogEvent) {
    const line = JSON.stringify(event);
    switch (event.level) {
      case 'error':
        console.error(line);
        break;
      case 'warn':
        console.warn(line);
        break;
      case 'debug':
        console.debug(line);
        break;
      default:
        console.info(line);
    }
  },
};
