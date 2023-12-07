import { downloadFile } from 'utilities/downloadFile';

const DEFAULT_CSV_FILENAME = 'data' as const;

export const downloadCsv = (csvData: string, filename?: string): void => {
  downloadFile(
    'text/csv;charset=utf-8',
    csvData,
    `${filename ?? DEFAULT_CSV_FILENAME}.csv`,
  );
};
