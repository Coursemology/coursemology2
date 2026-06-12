import { downloadFile } from 'utilities/downloadFile';

const DEFAULT_CSV_FILENAME = 'data' as const;

// Prepend UTF-8 BOM so Excel on macOS/Windows detects UTF-8 encoding instead
// of falling back to a legacy code page (Mac Roman / Windows-1252), which
// misreads multibyte characters like em dash (U+2014) as mojibake (e.g. "‚Äî").
export const downloadCsv = (csvData: string, filename?: string): void => {
  downloadFile(
    'text/csv;charset=utf-8',
    `\uFEFF${csvData}`,
    `${filename ?? DEFAULT_CSV_FILENAME}.csv`,
  );
};
