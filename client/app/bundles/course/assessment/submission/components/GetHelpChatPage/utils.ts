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
