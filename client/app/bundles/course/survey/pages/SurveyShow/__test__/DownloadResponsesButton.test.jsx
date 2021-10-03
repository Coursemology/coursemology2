import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';

import DownloadResponsesButton from '../DownloadResponsesButton';

describe('<DownloadResponsesButton />', () => {
  it('injects handlers that allows survey responses to be downloaded', () => {
    const spyRemind = jest.spyOn(CourseAPI.survey.surveys, 'download');
    const store = storeCreator({ surveys: {} });
    const downloadButton = mount(
      <DownloadResponsesButton />,
      buildContextOptions(store),
    );
    downloadButton.find('button').simulate('click');
    expect(spyRemind).toHaveBeenCalled();
  });
});
