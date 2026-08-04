import type { Plugin } from 'vite';
import type { LogEvent } from './types';
import { createFileTransport } from './transports/fileTransport';

export interface LogReceiverOptions {
  directory?: string;
  maxBytes?: number;
  maxFiles?: number;
}

export function logReceiverPlugin(options: LogReceiverOptions = {}): Plugin {
  const transport = createFileTransport(options);

  return {
    name: 'local-log-receiver',
    configureServer(server) {
      server.middlewares.use('/__logs', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const events = JSON.parse(body) as LogEvent[];
            if (Array.isArray(events)) {
              for (const event of events) {
                transport.write(event);
              }
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end('{"ok":true}');
          } catch {
            res.statusCode = 400;
            res.end('Bad Request');
          }
        });
      });
    },
  };
}
