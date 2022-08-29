import { ComponentProps } from 'react';

import { fireEvent, render, RenderResult } from 'utilities/test-utils';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from '../../../store';
import AssessmentForm from '..';

const INITIAL_VALUES = {
  id: 1,
  title: 'Test Assessment',
  description: 'Awesome description 4',
  autograded: false,
  start_at: new Date(),
  base_exp: 0,
  time_bonus_exp: 0,
  use_public: true,
  use_private: true,
  use_evaluation: false,
  tabbed_view: false,
  published: false,
};

let store;
let initialValues;
let props: ComponentProps<typeof AssessmentForm>;
let form: RenderResult;

const getComponent = (): JSX.Element => (
  <ProviderWrapper store={store}>
    <AssessmentForm {...props} />
  </ProviderWrapper>
);

beforeEach(() => {
  store = storeCreator({ assessments: {} });
  initialValues = INITIAL_VALUES;

  props = {
    initialValues,
    gamified: false,
    modeSwitching: true,
    showPersonalizedTimelineFeatures: false,
    randomizationAllowed: false,
    conditionAttributes: {
      conditions: [],
      new_condition_urls: [],
    },
    folderAttributes: {
      folder_id: 1,
      materials: [],
      enable_materials_action: true,
    },
    onSubmit: (): void => {},
  };

  form = render(getComponent());
});

describe('<AssessmentForm />', () => {
  it('renders assessment details sections options', () => {
    expect(form.getByText('Assessment details')).toBeVisible();
    expect(form.getByLabelText('Starts at *')).toBeVisible();
    expect(form.getByLabelText('Ends at')).toBeVisible();
    expect(form.getByLabelText('Title *')).toHaveValue(INITIAL_VALUES.title);
    expect(form.getByText('Description')).toBeVisible();
    expect(form.getByDisplayValue(INITIAL_VALUES.description)).toBeVisible();
  });

  it('renders grading section options', () => {
    expect(form.getByText('Grading')).toBeVisible();
    expect(form.getByText('Grading mode')).toBeVisible();

    expect(form.getByText('Autograded')).toBeVisible();
    expect(form.getByDisplayValue('autograded')).not.toBeChecked();

    expect(form.getByText('Manual')).toBeVisible();
    expect(form.getByDisplayValue('manual')).toBeChecked();

    expect(form.getByLabelText('Public test cases')).toBeChecked();
    expect(form.getByLabelText('Private test cases')).toBeChecked();
    expect(form.getByLabelText('Evaluation test cases')).not.toBeChecked();

    expect(
      form.getByLabelText('Enable delayed grade publication'),
    ).not.toBeChecked();
  });

  it('renders answers and test cases section options', () => {
    expect(form.getByText('Answers and test cases')).toBeVisible();
    expect(form.getByLabelText('Allow to skip steps')).not.toBeChecked();
    expect(
      form.getByLabelText('Allow submission with incorrect answers'),
    ).not.toBeChecked();
    expect(form.getByLabelText('Show private test cases')).not.toBeChecked();
    expect(form.getByLabelText('Show evaluation test cases')).not.toBeChecked();
    expect(form.getByLabelText('Show MCQ/MRQ solution(s)')).not.toBeChecked();
  });

  it('renders organisation section options', () => {
    expect(form.getByText('Organisation')).toBeVisible();
    expect(form.getByText('Single Page')).toBeVisible();
  });

  it('renders exams and access control section options', () => {
    expect(form.getByText('Exams and access control')).toBeVisible();
    expect(
      form.getByLabelText('Block students from viewing finalized submissions'),
    ).not.toBeChecked();
    expect(form.getByLabelText('Show MCQ submit result')).not.toBeChecked();
    expect(form.getByLabelText('Enable password protection')).not.toBeChecked();
  });

  it('renders gamified options when course is gamified', () => {
    expect(form.queryByText('Gamification')).not.toBeInTheDocument();
    expect(form.queryByLabelText('Bonus ends at')).not.toBeInTheDocument();
    expect(form.queryByLabelText('Base EXP')).not.toBeInTheDocument();
    expect(form.queryByLabelText('Time Bonus EXP')).not.toBeInTheDocument();

    props.gamified = true;
    form.rerender(getComponent());

    expect(form.getByText('Gamification')).toBeVisible();
    expect(form.getByLabelText('Bonus ends at')).toBeVisible();
    expect(form.getByLabelText('Base EXP')).toHaveValue(
      INITIAL_VALUES.base_exp,
    );
    expect(form.getByLabelText('Time Bonus EXP')).toHaveValue(
      INITIAL_VALUES.time_bonus_exp,
    );
  });

  it('renders editing options when rendered in edit assessment page', () => {
    expect(form.queryByText('Visibility')).not.toBeInTheDocument();
    expect(form.queryByText('Published')).not.toBeInTheDocument();
    expect(form.queryByText('Draft')).not.toBeInTheDocument();
    expect(form.queryByText('Files')).not.toBeInTheDocument();
    expect(form.queryByText('Add Files')).not.toBeInTheDocument();
    expect(form.queryByText('Unlock conditions')).not.toBeInTheDocument();
    expect(form.queryByText('Add a condition')).not.toBeInTheDocument();

    props.editing = true;
    form.rerender(getComponent());

    expect(form.getByText('Visibility')).toBeVisible();
    expect(form.getByText('Published')).toBeVisible();
    expect(form.getByDisplayValue('published')).not.toBeChecked();
    expect(form.getByText('Draft')).toBeVisible();
    expect(form.getByDisplayValue('draft')).toBeChecked();
    expect(form.getByText('Files')).toBeVisible();
    expect(form.getByText('Add Files')).toBeVisible();
    expect(form.queryByText('Unlock conditions')).not.toBeInTheDocument();
    expect(form.queryByText('Add a condition')).not.toBeInTheDocument();

    props.gamified = true;
    form.rerender(getComponent());
    expect(form.getByText('Unlock conditions')).toBeVisible();
    expect(form.getByText('Add a condition')).toBeVisible();
  });

  it('prevents grading mode switching when there are submissions', () => {
    expect(form.getByDisplayValue('autograded')).toBeEnabled();
    expect(form.getByDisplayValue('manual')).toBeEnabled();

    props.modeSwitching = false;
    form.rerender(getComponent());

    expect(form.getByDisplayValue('autograded')).toBeDisabled();
    expect(form.getByDisplayValue('manual')).toBeDisabled();
  });

  it('disables unavailable options in autograded mode', () => {
    expect(form.getByLabelText('Allow to skip steps')).toBeDisabled();
    expect(
      form.getByLabelText('Allow submission with incorrect answers'),
    ).toBeDisabled();
    expect(
      form.getByLabelText('Enable delayed grade publication'),
    ).toBeEnabled();
    expect(form.getByLabelText('Show MCQ submit result')).toBeDisabled();
    expect(form.getByLabelText('Enable password protection')).toBeEnabled();

    const autogradedRadio = form.getByDisplayValue('autograded');
    fireEvent.click(autogradedRadio);

    expect(form.getByLabelText('Allow to skip steps')).toBeEnabled();
    expect(
      form.getByLabelText('Allow submission with incorrect answers'),
    ).toBeEnabled();
    expect(
      form.getByLabelText('Enable delayed grade publication'),
    ).toBeDisabled();
    expect(form.getByLabelText('Show MCQ submit result')).toBeEnabled();
    expect(form.getByLabelText('Enable password protection')).toBeDisabled();
  });

  it('handles password protection options', () => {
    expect(
      form.queryByLabelText('Assessment password *'),
    ).not.toBeInTheDocument();
    expect(
      form.queryByLabelText('Enable session protection'),
    ).not.toBeInTheDocument();
    expect(
      form.queryByLabelText('Session unlock password *'),
    ).not.toBeInTheDocument();

    const passwordCheckbox = form.getByLabelText('Enable password protection');
    expect(passwordCheckbox).toBeEnabled();
    expect(passwordCheckbox).not.toBeChecked();

    fireEvent.click(passwordCheckbox);

    expect(form.getByLabelText('Assessment password *')).toBeVisible();

    const sessionProtectionCheckbox = form.getByLabelText(
      'Enable session protection',
    );
    expect(sessionProtectionCheckbox).toBeEnabled();
    expect(sessionProtectionCheckbox).not.toBeChecked();
    expect(
      form.queryByLabelText('Session unlock password *'),
    ).not.toBeInTheDocument();

    fireEvent.click(sessionProtectionCheckbox);

    expect(form.getByLabelText('Session unlock password *')).toBeVisible();
  });

  it('renders personalised timelines options when enabled', () => {
    expect(form.queryByLabelText('Has personal times')).not.toBeInTheDocument();
    expect(
      form.queryByLabelText('Affects personal times'),
    ).not.toBeInTheDocument();

    props.showPersonalizedTimelineFeatures = true;
    form.rerender(getComponent());

    expect(form.getByLabelText('Has personal times')).toBeEnabled();
    expect(form.getByLabelText('Affects personal times')).toBeEnabled();
  });

  it('renders randomization options when enabled', () => {
    expect(
      form.queryByLabelText('Enable Randomization'),
    ).not.toBeInTheDocument();

    props.randomizationAllowed = true;
    form.rerender(getComponent());

    expect(form.getByLabelText('Enable Randomization')).toBeEnabled();
  });
});
