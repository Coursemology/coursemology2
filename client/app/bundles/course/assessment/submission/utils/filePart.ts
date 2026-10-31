/**
 * A programming file's content as a file part of a multipart request. A browser sends a file part's
 * bytes unchanged, but turns every line ending in a text field into CRLF, so content sent as text
 * would be saved with line endings the student never had. A `File`, such as an upload, is sent as it
 * is.
 */
export const asFilePart = (content: string | File, filename: string): File =>
  content instanceof File
    ? content
    : new File([content], filename, { type: 'text/plain' });
