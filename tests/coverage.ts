import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { BrowserContext } from '@playwright/test';

import { coverage as config } from './package.json';

const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), config.outputDir);

const getJSONFileName = () =>
  `${config.fileNamePrefix}${crypto.randomBytes(16).toString('hex')}.json`;

const collectCoverage = () =>
  window.collectCoverage(JSON.stringify(window.__coverage__));

export const configureCoverage = async (
  context: BrowserContext,
  use: (r: BrowserContext) => Promise<void>,
) => {
  await context.addInitScript(() => {
    window.addEventListener('beforeunload', collectCoverage);
  });

  await fs.promises.mkdir(DEFAULT_OUTPUT_PATH, { recursive: true });

  await context.exposeFunction('collectCoverage', async (coverage: string) => {
    if (!coverage) return;

    const saveLocation = path.join(DEFAULT_OUTPUT_PATH, getJSONFileName());
    fs.writeFileSync(saveLocation, coverage);
  });

  await use(context);

  for (const page of context.pages()) {
    await page.evaluate(collectCoverage);
  }
};
