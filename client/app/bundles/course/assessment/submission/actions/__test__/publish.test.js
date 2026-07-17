import CourseAPI from 'api/course';
import { getActivePreview } from 'course/marketplace/contexts/PreviewContext';
import { setNotification } from 'lib/actions';

import translations from '../../translations';
import { publish } from '../index';

jest.mock('lib/actions', () => ({
  setNotification: jest.fn(() => ({ type: 'MOCK_SET_NOTIFICATION' })),
}));

jest.mock('course/marketplace/contexts/PreviewContext', () => ({
  getActivePreview: jest.fn(),
}));

describe('publish thunk success notification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(CourseAPI.assessment.submissions, 'update')
      .mockResolvedValue({ data: { submission: {} } });
  });

  afterEach(() => jest.restoreAllMocks());

  it('uses the sandbox message when publishing inside a marketplace preview', async () => {
    getActivePreview.mockReturnValue({
      courseId: 1,
      assessmentId: 2,
      submissionId: 3,
      isPreview: true,
    });

    await publish(3, [], 0)(jest.fn());

    expect(setNotification).toHaveBeenCalledWith(
      translations.gradesPublishedSandbox,
    );
    expect(setNotification).not.toHaveBeenCalledWith(translations.updateSuccess);
  });

  it('uses the standard message when publishing outside a preview', async () => {
    getActivePreview.mockReturnValue(null);

    await publish(3, [], 0)(jest.fn());

    expect(setNotification).toHaveBeenCalledWith(translations.updateSuccess);
    expect(setNotification).not.toHaveBeenCalledWith(
      translations.gradesPublishedSandbox,
    );
  });
});
