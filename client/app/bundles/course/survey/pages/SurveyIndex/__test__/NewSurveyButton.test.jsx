import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import SurveyFormDialogue from 'course/survey/containers/SurveyFormDialogue';

import NewSurveyButton from '../NewSurveyButton';

const state = {
  surveys: { surveysFlags: { canCreate: true } },
};

const startAt = '01-01-2017 00:00';
const endAt = '01-01-2018 00:00';

const survey = {
  allow_modify_after_submit: false,
  allow_response_after_end: true,
  anonymous: false,
  base_exp: 0,
  description: '',
  has_todo: true,
  start_at: new Date(startAt),
  end_at: new Date(endAt),
  bonus_end_at: null,
  title: 'Funky survey title',
  time_bonus_exp: 0,
};

describe('<NewSurveyButton />', () => {
  // start_at date field seems to not be updated

  it('injects handlers that allow surveys to be created', async () => {
    const spyCreate = jest.spyOn(CourseAPI.survey.surveys, 'create');

    const page = render(
      <>
        <SurveyFormDialogue />
        <NewSurveyButton />
      </>,
      { state },
    );

    fireEvent.click(await page.findByRole('button'));

    fireEvent.change(page.getByLabelText('Title', { exact: false }), {
      target: { value: survey.title },
    });

    fireEvent.change(page.getByLabelText('Starts at'), {
      target: { value: startAt },
    });

    fireEvent.change(page.getByLabelText('Ends at'), {
      target: { value: endAt },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(spyCreate).toHaveBeenCalledWith({ survey });
    });
  });
});
