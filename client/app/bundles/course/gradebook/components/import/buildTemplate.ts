import type { IdentifierMode } from 'types/course/gradebook';

export const identifierHeader = (mode: IdentifierMode): string =>
  mode === 'email' ? 'Email' : 'External ID';

// Sample identifier values per mode for the downloadable/preview template.
// Mirrors the invite-users dialog convention (A0123456, test1@example.com).
const SAMPLE_IDENTIFIERS: Record<IdentifierMode, [string, string]> = {
  external_id: ['A0123456', 'A0123457'],
  email: ['test1@example.com', 'test2@example.com'],
};

// The example CSV shown (and downloaded) in the wizard's Upload step: an
// identifier column plus two illustrative assessment columns.
export const exampleCsv = (mode: IdentifierMode): string => {
  const [first, second] = SAMPLE_IDENTIFIERS[mode];
  return [
    `${identifierHeader(mode)},Assessment 1,Assessment 2`,
    `${first},85,90`,
    `${second},78,88`,
  ].join('\n');
};

// A client-side download target for the example CSV. The gradebook import has
// no server template endpoint (unlike the invite-users flow), so the template
// is generated inline as a data URI.
export const templateDataUri = (mode: IdentifierMode): string =>
  `data:text/csv;charset=utf-8,${encodeURIComponent(`${exampleCsv(mode)}\n`)}`;

// Reads an uploaded File to text (raw CSV; the server parses authoritatively).
export const readFileText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(String(reader.result));
    reader.onerror = (): void => reject(reader.error);
    reader.readAsText(file);
  });
