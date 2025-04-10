export const getIdFromUnknown = (id?: string | null): number | undefined =>
  parseInt(id ?? '', 10) || undefined;

export const getMailtoURLWithBody = (
  email: string,
  subject: string,
  body: string,
): string => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
};

const KB = 1000;
const SIZES = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export const formatReadableBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 bytes';

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(KB)),
    SIZES.length - 1,
  );

  // Round up to specified decimal precision, so it shows "2.01 MB" if slightly over
  const quantizedBytes =
    Math.ceil((bytes * 10 ** decimals) / KB ** unitIndex) / 10 ** decimals;
  return `${parseFloat(quantizedBytes.toFixed(decimals))} ${SIZES[unitIndex]}`;
};
