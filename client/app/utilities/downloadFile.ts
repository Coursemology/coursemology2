type AllowedFileTypes = 'text/plain' | 'text/csv;charset=utf-8';

export const downloadFile = (
  fileType: AllowedFileTypes,
  fileContent: string,
  filename: string,
): void => {
  const blob = new Blob([fileContent], { type: fileType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
