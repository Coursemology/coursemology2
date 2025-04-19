import { render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { LOADING_INDICATOR_TEST_ID } from 'lib/components/core/LoadingIndicator';

import WrappedResponseShow, { ResponseShow } from '../index';

const getResponseUrl = (surveyId, responseId) =>
  `/courses/${global.courseId}/surveys/${surveyId}/responses/${responseId}/edit`;

describe('<ResponseShow />', () => {
  it('allows responses to be saved', async () => {
    const surveyId = 1;
    const responseId = 1;
    const spyFetch = jest.spyOn(CourseAPI.survey.responses, 'fetch');
    const responseUrl = getResponseUrl(surveyId, responseId);

    render(
      <WrappedResponseShow
        courseId={global.courseId}
        match={{ params: { responseId } }}
        survey={{}}
        surveyId={surveyId}
      />,
      [responseUrl],
    );

    await waitFor(() => expect(spyFetch).toHaveBeenCalled());
  });

  it('shows form and admin buttons if user has permissions and page is loaded', async () => {
    const surveyId = 2;
    const responseId = 2;
    const responseUrl = getResponseUrl(surveyId, responseId);

    const data = {
      survey: {
        id: surveyId,
        title: 'Survey',
        description: 'Description',
      },
      response: {
        id: responseId,
        creator_name: 'Staff',
        submitted_at: '2099-12-31T16:00:00.000Z',
        updated_at: '2100-01-12T16:00:00.000Z',
      },
      flags: {
        canModify: true,
        canSubmit: true,
        canUnsubmit: true,
        isResponseCreator: true,
        isLoading: false,
      },
    };

    const params = {
      courseId: global.courseId,
      surveyId: surveyId.toString(),
      match: { params: { responseId: responseId.toString() } },
    };

    const page = render(
      <ResponseShow dispatch={jest.fn()} {...data} {...params} />,
      [responseUrl],
    );

    expect(await page.findByText(data.response.creator_name)).toBeVisible();
    expect(page.getByText(data.survey.description)).toBeVisible();
    expect(page.getByRole('button', { name: 'View' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Unsubmit' })).toBeVisible();
  });

  it('shows only description and loading indicator when loading', async () => {
    const surveyId = 2;
    const responseId = 2;

    const data = {
      survey: {
        id: surveyId,
        description: 'Description',
      },
      response: {
        id: responseId,
        creator_name: 'Student',
      },
      flags: {
        canModify: true,
        canSubmit: true,
        canUnsubmit: true,
        isResponseCreator: true,
        isLoading: true,
      },
    };

    const params = {
      courseId: global.courseId,
      surveyId: surveyId.toString(),
      match: { params: { responseId: responseId.toString() } },
    };

    const page = render(
      <ResponseShow dispatch={jest.fn()} {...data} {...params} />,
    );

    expect(await page.findByText(data.survey.description)).toBeVisible();
    expect(page.getByTestId(LOADING_INDICATOR_TEST_ID)).toBeVisible();
  });
});
