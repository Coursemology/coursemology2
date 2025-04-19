import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';

import AdminMenu from '../AdminMenu';

describe('<AdminMenu />', () => {
  it('does not render button if user cannot edit or update', async () => {
    const survey = {
      id: 2,
      title: 'Survey',
      canDelete: false,
      canUpdate: false,
    };

    const page = render(
      <AdminMenu survey={survey} surveyId={survey.id.toString()} />,
    );

    await waitFor(() =>
      expect(page.queryByRole('button')).not.toBeInTheDocument(),
    );
  });

  it('allows surveys to be deleted', async () => {
    const spyDelete = jest.spyOn(CourseAPI.survey.surveys, 'delete');
    const survey = {
      id: 2,
      title: 'Survey To Delete',
      canDelete: true,
    };

    const page = render(
      <>
        <DeleteConfirmation />
        <AdminMenu survey={survey} surveyId={survey.id.toString()} />
      </>,
    );

    fireEvent.click(await page.findByRole('button'));
    fireEvent.click(page.getByText('Delete Survey'));
    fireEvent.click(page.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(spyDelete).toHaveBeenCalledWith(survey.id.toString());
    });
  });

  it('allows surveys to be edited', async () => {
    const spyUpdate = jest.spyOn(CourseAPI.survey.surveys, 'update');
    const surveyFormData = {
      title: 'Survey To Edit',
      base_exp: 100,
      time_bonus_exp: 50,
      start_at: '2017-02-27T00:00:00.000+08:00',
      end_at: '2017-03-12T23:59:00.000+08:00',
      has_todo: true,
      allow_response_after_end: true,
      allow_modify_after_submit: true,
      anonymous: true,
    };

    const survey = {
      ...surveyFormData,
      id: 2,
      hasStudentResponse: true,
      canUpdate: true,
    };

    const page = render(
      <>
        <AdminMenu survey={survey} surveyId={survey.id.toString()} />
        <SurveyFormDialogue />
      </>,
    );

    fireEvent.click(await page.findByRole('button'));
    fireEvent.click(page.getByText('Edit Survey'));

    const description = 'To update description';

    fireEvent.change(page.getByLabelText('Description', { exact: false }), {
      target: { value: description },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    const expectedPayload = {
      survey: {
        ...surveyFormData,
        description,
        start_at: new Date(survey.start_at),
        end_at: new Date(survey.end_at),
      },
    };

    await waitFor(() => {
      expect(spyUpdate).toHaveBeenCalledWith(
        survey.id.toString(),
        expectedPayload,
      );
    });
  });
});
