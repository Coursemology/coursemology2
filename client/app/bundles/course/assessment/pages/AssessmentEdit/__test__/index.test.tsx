import userEvent from '@testing-library/user-event';
import { fireEvent, render, RenderResult, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import AssessmentEdit from '../AssessmentEditPage';

const INITIAL_VALUES = {
  id: 1,
  title: 'Test Assessment',
  description: 'Awesome description 4',
  autograded: false,
  start_at: new Date(),
  end_at: undefined,
  bonus_end_at: undefined,
  base_exp: 0,
  time_bonus_exp: 0,
  use_public: true,
  use_private: true,
  use_evaluation: false,
  tabbed_view: false,
  published: false,
  has_todo: false,
  has_time_limit: false,
  time_limit: null,
  allow_partial_submission: false,
  block_student_viewing_after_submitted: false,
  delayed_grade_publication: false,
  password_protected: false,
  view_password: null,
  session_password: null,
  show_private: false,
  show_evaluation: false,
  show_mcq_answer: false,
  show_mcq_mrq_solution: false,
  show_rubric_to_students: false,
  skippable: false,
  monitoring: { enabled: false },
};

const NEW_VALUES = {
  title: 'New Assessment Title',
  description: 'Awesome new description 5',
  published: true,
  use_public: false,
};

let initialValues;
let form: RenderResult;
let updateApi: jest.SpyInstance;

const getComponent = (): JSX.Element => (
  /* @ts-ignore until AssessmentEdit/index.jsx is fully typed */
  <AssessmentEdit initialValues={initialValues} modeSwitching />
);

beforeEach(() => {
  initialValues = INITIAL_VALUES;
  updateApi = jest.spyOn(CourseAPI.assessment.assessments, 'update');

  form = render(getComponent());
});

describe('<AssessmentEdit />', () => {
  it('submits correct form data', async () => {
    const user = userEvent.setup();

    const title = form.getByLabelText('Title *');
    await user.type(title, '{Control>}a{/Control}{Delete}');
    await user.type(title, NEW_VALUES.title);
    expect(title).toHaveValue(NEW_VALUES.title);

    const description = form.getByDisplayValue(INITIAL_VALUES.description);
    await user.type(description, '{Control>}a{/Control}{Delete}');
    await user.type(description, NEW_VALUES.description);
    expect(description).toHaveValue(NEW_VALUES.description);

    const published = form.getByDisplayValue('published');
    fireEvent.click(published);

    const publicTestCases = form.getByLabelText('Public test cases');
    fireEvent.click(publicTestCases);

    const saveButton = form.getByText('Save');
    expect(saveButton).toBeVisible();

    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(updateApi).toHaveBeenCalledWith(initialValues.id, {
        assessment: {
          ...initialValues,
          ...NEW_VALUES,
        },
      }),
    );
  });
});
