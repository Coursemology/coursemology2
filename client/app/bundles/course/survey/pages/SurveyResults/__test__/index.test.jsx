import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import SurveyResults from '../index';

const client = CourseAPI.survey.surveys.client;
const mock = createMockAdapter(client);

// Need to prefix this with "mock" because {global.courseId} is referenced
const mockResultsData = {
  sections: [
    {
      id: 2,
      weight: 0,
      title: 'Only section',
      description: 'Has one question',
      questions: [
        {
          id: 5,
          question_type: 'text',
          description: 'Why?',
          weight: 0,
          answers: [
            {
              id: 123,
              course_user_name: 'Normal student',
              phantom: false,
              isStudent: true,
              myStudent: true,
              text_response: 'Normal answer',
              response_path: `/courses/${global.courseId}/surveys/6/responses/9`,
            },
            {
              id: 124,
              course_user_name: 'Some phantom student',
              phantom: true,
              isStudent: true,
              myStudent: true,
              text_response: 'Phantom answer',
              response_path: `/courses/${global.courseId}/surveys/6/responses/10`,
            },
          ],
        },
      ],
    },
  ],
  survey: {
    id: 6,
    title: 'Test Response',
    anonymous: false,
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    surveyId: mockResultsData.survey.id.toString(),
    courseId: global.courseId.toString(),
  }),
}));

beforeEach(() => {
  mock.reset();
});

describe('<SurveyResults />', () => {
  it('allows phantom students to be excluded from the results', async () => {
    const surveyId = mockResultsData.survey.id.toString();
    const resultsUrl = `/courses/${global.courseId}/surveys/${surveyId}/results`;
    mock.onGet(resultsUrl).reply(200, mockResultsData);
    const spyResults = jest.spyOn(CourseAPI.survey.surveys, 'results');

    const page = render(
      <SurveyResults survey={mockResultsData.survey} surveyId={surveyId} />,
      [resultsUrl],
    );

    await waitFor(() => {
      expect(spyResults).toHaveBeenCalled();
    });

    const phantomStudent =
      mockResultsData.sections[0].questions[0].answers[1].course_user_name;

    expect(page.getByText(phantomStudent, { exact: false })).toBeVisible();

    const phantomSwitch = page.getByText('Include phantom users');
    fireEvent.click(phantomSwitch);

    expect(
      page.queryByText(phantomStudent, { exact: false }),
    ).not.toBeInTheDocument();
  });
});
