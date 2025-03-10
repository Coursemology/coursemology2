export const justifyPosition = (
  isStudent: boolean,
  isError: boolean,
): string => {
  if (isStudent) {
    return 'justify-end';
  }

  if (isError) {
    return 'justify-center';
  }

  return 'justify-start';
};

export const isAllFileIdsIdentical = (
  fileIds: number[],
  fileIdHash: Record<number, boolean>,
): boolean => {
  if (fileIds.length !== Object.keys(fileIdHash).map(Number).length) {
    return false;
  }

  for (let i = 0; i < fileIds.length; i++) {
    if (!fileIdHash[fileIds[i]]) {
      return false;
    }
  }

  return true;
};
