/* eslint-disable import/prefer-default-export */
/**
 * Formats the display for file sizes
 */
export function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 Byte';
  const k = 1000; // or 1024 for binary
  const dm = decimals || 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
}
