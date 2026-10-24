import { fireEvent, render, screen } from 'test-utils';
import { downloadFile } from 'utilities/downloadFile';

import ProgrammingFileDownloadChip from '../ProgrammingFileDownloadChip';

jest.mock('utilities/downloadFile', () => ({ downloadFile: jest.fn() }));

describe('<ProgrammingFileDownloadChip />', () => {
  it('shows the whole path, and downloads the file under its own name', async () => {
    render(
      <ProgrammingFileDownloadChip
        file={{ id: 1, filename: 'templates/index.html', content: '<p>' }}
      />,
    );

    fireEvent.click(await screen.findByText('templates/index.html'));

    expect(downloadFile).toHaveBeenCalledWith(
      'text/plain',
      '<p>',
      'index.html',
    );
  });
});
