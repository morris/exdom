import { test } from '@playwright/test';
import express from 'express';
import { Server } from 'http';

export function useTestServer(t: typeof test) {
  const app = express();

  app.use('/test-build', express.static('test-build'));
  app.use('/test', express.static('test'));

  let server: Server | undefined;

  t.beforeAll(() => {
    return new Promise((resolve, reject) => {
      server = app.listen(0);
      server.on('listening', resolve);
      server.on('error', reject);
    });
  });

  t.afterAll(() => {
    server?.close();
  });

  return () => {
    const { port } = server?.address() as { port: number };

    return {
      port,
      url: `http://localhost:${port}/test`,
    };
  };
}
