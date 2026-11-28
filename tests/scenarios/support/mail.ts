import * as fs from 'fs';

import { expect } from '@playwright/test';

import { devServer } from './env';

// ActionMailer logs a delivered message's full source at debug level. Its headers and body are
// written as plain lines, so a message is found by its `To:` header and read up to this many lines.
const MAX_MESSAGE_LINES = 400;

const decodeQuotedPrintable = (text: string): string =>
  text
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

const readFrom = async (offset: number): Promise<string> => {
  const handle = await fs.promises.open(devServer.logPath, 'r');
  try {
    const { size } = await handle.stat();
    const buffer = Buffer.alloc(Math.max(size - offset, 0));
    await handle.read(buffer, 0, buffer.length, offset);
    return buffer.toString('utf8');
  } finally {
    await handle.close();
  }
};

const findLink = (log: string, recipient: string, linkPattern: RegExp): string | undefined => {
  const lines = log.split('\n');
  const toHeader = `to: ${recipient}`.toLowerCase();

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().toLowerCase() !== toHeader) continue;

    const message = decodeQuotedPrintable(lines.slice(i, i + MAX_MESSAGE_LINES).join('\n'));
    for (const [, href] of message.matchAll(/href="([^"]+)"/g)) {
      const url = new URL(href.replace(/&amp;/g, '&'));
      const pathAndQuery = `${url.pathname}${url.search}`;
      if (linkPattern.test(pathAndQuery)) return pathAndQuery;
    }
  }

  return undefined;
};

/**
 * Reads mail that the development server logged instead of delivering.
 *
 * Call `mark()` before the action that sends the mail, so that older messages to the same address
 * are ignored.
 */
export const mailLog = {
  mark: async (): Promise<number> => (await fs.promises.stat(devServer.logPath)).size,

  /**
   * Waits for a message to `recipient` and returns the path and query of its first link matching
   * `linkPattern`. Only the path is returned: mailers build links with `http://`, while the
   * development client may be served over HTTPS.
   */
  waitForLink: async (
    since: number,
    recipient: string,
    linkPattern: RegExp,
  ): Promise<string> => {
    let link: string | undefined;
    await expect
      .poll(
        async () => {
          link = findLink(await readFrom(since), recipient, linkPattern);
          return link;
        },
        {
          message: `No mail to ${recipient} with a link matching ${linkPattern} in ${devServer.logPath}`,
          intervals: [500, 1_000, 2_000],
          timeout: 30_000,
        },
      )
      .toBeTruthy();
    return link!;
  },
};
