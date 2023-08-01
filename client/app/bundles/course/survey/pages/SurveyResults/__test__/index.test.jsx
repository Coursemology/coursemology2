import { createMockAdapter } from 'mocks/axiosMock';
import { store } from 'store';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import { SurveyResults } from '../index';

const client = CourseAPI.survey.surveys.client;
const mock = createMockAdapter(client);

const data = {
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
              text_response: 'Normal answer',
              response_path: `/courses/${global.courseId}/surveys/6/responses/9`,
            },
            {
              id: 124,
              course_user_name: 'Some phantom student',
              phantom: true,
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

beforeEach(() => {
  mock.reset();
});

describe('<SurveyResults />', () => {
  it('allows phantom students to be excluded from the results', async () => {
    const surveyId = data.survey.id.toString();
    const resultsUrl = `/courses/${global.courseId}/surveys/${surveyId}/results`;
    mock.onGet(resultsUrl).reply(200, data);
    const spyResults = jest.spyOn(CourseAPI.survey.surveys, 'results');

    const page = render(
      <SurveyResults
        dispatch={store.dispatch}
        isLoading={false}
        sections={data.sections}
        survey={data.survey}
        surveyId={surveyId}
      />,
      [resultsUrl],
    );

    await waitFor(() => {
      expect(spyResults).toHaveBeenCalled();
    });

    const phantomStudent =
      data.sections[0].questions[0].answers[1].course_user_name;

    expect(page.getByText(phantomStudent, { exact: false })).toBeVisible();

    const phantomSwitch = page.getByText('Include Phantom Students');
    fireEvent.click(phantomSwitch);

    expect(
      page.queryByText(phantomStudent, { exact: false }),
    ).not.toBeInTheDocument();
  });
});
