const DEFAULT_CSV_FILENAME = 'data' as const;

export const downloadCsv = (csvData: string, filename?: string): void => {
  const csvContent = `data:text/csv;charset=utf-8,${csvData}`;
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename ?? DEFAULT_CSV_FILENAME}.csv`);
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};
