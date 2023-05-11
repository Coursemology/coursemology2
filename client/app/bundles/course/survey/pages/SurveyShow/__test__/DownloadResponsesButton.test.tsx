import { fireEvent, render } from 'test-utils';

import CourseAPI from 'api/course';

import DownloadResponsesButton from '../DownloadResponsesButton';

describe('<DownloadResponsesButton />', () => {
  it('injects handlers that allows survey responses to be downloaded', () => {
    const spyRemind = jest.spyOn(CourseAPI.survey.surveys, 'download');

    const page = render(<DownloadResponsesButton />);
    const downloadButton = page.getByRole('button');

    fireEvent.click(downloadButton);

    expect(spyRemind).toHaveBeenCalled();
  });
});
