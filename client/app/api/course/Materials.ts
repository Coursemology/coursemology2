import { AxiosResponseHeaders } from 'axios';
import { FileListData } from 'types/course/material/files';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

const getShouldDownloadFromContentDisposition = (
  headers: Partial<AxiosResponseHeaders>,
): boolean | null => {
  const disposition = headers['content-disposition'] as string | null;
  if (!disposition) return null;

  return disposition.startsWith('attachment');
};

export default class MaterialsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/materials/folders`;
  }

  fetch(folderId: number, materialId: number): APIResponse<FileListData> {
    return this.client.get(
      `${this.#urlPrefix}/${folderId}/files/${materialId}`,
    );
  }

  /**
   * Attempts to download the file at the given `url` as a `Blob` and returns
   * its URL and disposition. Remember to `revoke` the URL when no longer needed.
   *
   * The server to which `url` points must expose the `Content-Disposition`
   * response header for the file name to be extracted. It must also allow this
   * app's `Origin` in `Access-Control-Allow-Origin`.
   *
   * For `attachment` dispositions, the `filename` parameter must exist.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
   *
   * @param directDownloadURL A URL that directly points to a file.
   * @returns The `Blob` URL, `disposition`, and a `revoke` function.
   */
  async download(directDownloadURL: string): Promise<{
    url: string;
    shouldDownload: boolean;
    revoke: () => void;
  }> {
    const { data, headers } = await this.externalClient.get(directDownloadURL, {
      responseType: 'blob',
      params: { format: undefined },
    });

    const shouldDownload = getShouldDownloadFromContentDisposition(headers);
    if (shouldDownload === null)
      throw new Error('Invalid Content-Disposition header');

    const url = URL.createObjectURL(data);

    return { url, shouldDownload, revoke: () => URL.revokeObjectURL(url) };
  }

  destroy(folderId: number, materialId: number): APIResponse {
    return this.client.delete(
      `${this.#urlPrefix}/${folderId}/files/${materialId}`,
    );
  }
}
