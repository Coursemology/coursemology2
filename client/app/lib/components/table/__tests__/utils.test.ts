import { downloadFile } from 'utilities/downloadFile';

import { downloadCsv } from '../utils';

jest.mock('utilities/downloadFile', () => ({ downloadFile: jest.fn() }));

const mockDownloadFile = downloadFile as jest.Mock;

describe('downloadCsv', () => {
  beforeEach(() => mockDownloadFile.mockClear());

  it('uses the provided filename with .csv extension', () => {
    downloadCsv('a,b', 'my-file');
    expect(mockDownloadFile.mock.calls[0][2]).toBe('my-file.csv');
  });

  it('defaults to data.csv when no filename is given', () => {
    downloadCsv('a,b');
    expect(mockDownloadFile.mock.calls[0][2]).toBe('data.csv');
  });
});
