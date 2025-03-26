import { createMockAdapter } from 'mocks/axiosMock';
import { render, waitFor, within } from 'test-utils';

import CourseAPI from 'api/course';

import ResponseIndex from '../index';

const mock = createMockAdapter(CourseAPI.survey.responses.client);

const responsesData = {
  responses: [
    {
      course_user: {
        id: 1,
        name: 'Student A',
        phantom: true,
        isStudent: true,
        myStudent: true,
        path: '/courses/1/users/1',
      },
      present: true,
      submitted_at: '2017-03-01T09:10:01.180+08:00',
      path: '/courses/1/surveys/2/responses/5',
    },
    {
      course_user: {
        id: 2,
        name: 'Student B',
        phantom: false,
        isStudent: true,
        myStudent: true,
        path: '/courses/1/users/2',
      },
      present: false,
    },
    {
      course_user: {
        id: 3,
        name: 'Student C',
        phantom: false,
        isStudent: true,
        myStudent: true,
        path: '/courses/1/users/3',
      },
      present: true,
      submitted_at: null,
      path: '/courses/1/surveys/2/responses/6',
    },
    {
      course_user: {
        id: 4,
        name: 'Student D',
        phantom: true,
        isStudent: true,
        myStudent: true,
        path: '/courses/1/users/4',
      },
      present: true,
      submitted_at: '2017-03-03T09:10:01.180+08:00',
      path: '/courses/1/surveys/2/responses/7',
    },
  ],
  survey: {
    id: 2,
    title: 'Test Responses Page',
    start_at: '2017-03-01T09:10:01.180+08:00',
    end_at: '2017-03-02T09:10:01.180+08:00',
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    surveyId: responsesData.survey.id.toString(),
    courseId: global.courseId.toString(),
  }),
}));

beforeEach(() => {
  mock.reset();
});

describe('<ResponseIndex />', () => {
  it('allows responses to be saved', async () => {
    const surveyId = responsesData.survey.id;
    const url = `/courses/${global.courseId}/surveys/${surveyId}/responses`;
    mock.onGet(url).reply(200, responsesData);
    const spy = jest.spyOn(CourseAPI.survey.responses, 'index');

    window.history.pushState({}, '', url);
    const page = render(<ResponseIndex />);

    await waitFor(() => expect(spy).toHaveBeenCalled());

    responsesData.responses.forEach((response) => {
      expect(page.getByText(response.course_user.name)).toBeVisible();
    });

    const tables = page.getAllByRole('table');
    const normalStudentsTable = within(tables[1]);
    const phantomStudentsTable = within(tables[2]);

    const studentB = normalStudentsTable.getByText('Student B').closest('tr');
    const studentC = normalStudentsTable.getByText('Student C').closest('tr');

    expect(within(studentB).getByText('Not Started')).toBeVisible();
    expect(within(studentC).getByText('Responding')).toBeVisible();
    expect(phantomStudentsTable.getAllByText('Submitted')).toHaveLength(2);
  });
});
