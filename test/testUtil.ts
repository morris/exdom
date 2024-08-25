import { Page, test } from '@playwright/test';
import { randomUUID } from 'crypto';
import express from 'express';
import { promises as fs } from 'fs';
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

export async function startCoverage(page: Page) {
  await fs.mkdir('coverage/tmp', { recursive: true });

  try {
    await page.coverage.startJSCoverage();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // ignore
  }
}

export async function stopCoverage(page: Page) {
  try {
    const result = await page.coverage.stopJSCoverage();

    await fs.writeFile(
      `coverage/tmp/${randomUUID()}.json`,
      JSON.stringify({ result: result.map(rewriteUrl) }),
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // ignore
  }
}

function rewriteUrl(entry: { url: string }) {
  const cwd = process.cwd();

  return {
    ...entry,
    url: entry.url.replace(/http:\/\/localhost:\d+/, `file://${cwd}`),
  };
}
