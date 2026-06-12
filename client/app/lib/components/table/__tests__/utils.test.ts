import { downloadFile } from 'utilities/downloadFile';

import { downloadCsv } from '../utils';

jest.mock('utilities/downloadFile', () => ({ downloadFile: jest.fn() }));

const mockDownloadFile = downloadFile as jest.Mock;

describe('downloadCsv', () => {
  beforeEach(() => mockDownloadFile.mockClear());

  it('prepends a UTF-8 BOM so Excel detects UTF-8 encoding', () => {
    downloadCsv('a,b\n1,2');
    const content: string = mockDownloadFile.mock.calls[0][1];
    expect(content.charCodeAt(0)).toBe(0xfeff);
  });

  it('preserves em dash characters after the BOM', () => {
    downloadCsv('Name,Score\nAlice — Test,10');
    const content: string = mockDownloadFile.mock.calls[0][1];
    expect(content).toContain('—');
  });

  it('uses the provided filename with .csv extension', () => {
    downloadCsv('a,b', 'my-file');
    expect(mockDownloadFile.mock.calls[0][2]).toBe('my-file.csv');
  });

  it('defaults to data.csv when no filename is given', () => {
    downloadCsv('a,b');
    expect(mockDownloadFile.mock.calls[0][2]).toBe('data.csv');
  });
});
