import { createMockAdapter } from 'mocks/axiosMock';
import { render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import SurveyIndex from '../pages/SurveyIndex';

const SURVEYS = [
  {
    id: 1,
    base_exp: 20,
    canManage: true,
    title: 'First Survey',
    published: true,
    start_at: '2017-02-27T00:00:00.000+08:00',
    end_at: '2017-03-12T23:59:00.000+08:00',
    response: null,
  },
];

const mock = createMockAdapter(CourseAPI.survey.surveys.client);

beforeEach(() => {
  mock.reset();
});

describe('Surveys', () => {
  it('renders the index page and survey form', async () => {
    const url = `/courses/${global.courseId}/surveys`;

    mock.onGet(url).reply(200, {
      surveys: SURVEYS,
      canCreate: true,
    });

    const spyIndex = jest.spyOn(CourseAPI.survey.surveys, 'index');

    const page = render(<SurveyIndex />, { at: [url] });

    await waitFor(() => expect(spyIndex).toHaveBeenCalled());

    expect(page.getByText(SURVEYS[0].title)).toBeVisible();
  });
});
