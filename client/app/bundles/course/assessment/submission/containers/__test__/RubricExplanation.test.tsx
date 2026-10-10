import { AppState } from 'store';
import { render } from 'test-utils';

import RubricExplanation from '../RubricExplanation';

const category = {
  id: 1,
  name: 'Clarity',
  maximumGrade: 2,
  grades: [
    { id: 10, grade: 0, explanation: 'Unclear' },
    { id: 11, grade: 2, explanation: 'Clear' },
  ],
};

// Only the fields the component reads. `Partial<AppState>` allows omitting whole slices but not fields
// within one, hence the cast.
const stateWith = (isSaving: boolean): Partial<AppState> =>
  ({
    assessments: {
      submission: {
        submission: { workflowState: 'submitted' },
        questions: { 1: { id: 1, maximumGrade: 2 } },
        grading: { questions: { 1: { id: 100, grade: 0 } } },
        questionsFlags: {},
        submissionFlags: { isAutograding: false, isSaving },
      },
    },
  }) as unknown as Partial<AppState>;

const renderExplanation = (isSaving: boolean): ReturnType<typeof render> =>
  render(
    <RubricExplanation
      category={category}
      categoryGrades={{
        1: { id: 1, gradeId: 10, grade: 0, explanation: null, name: 'Clarity' },
      }}
      questionId={1}
      setIsFirstRendering={jest.fn()}
      updateGrade={jest.fn()}
    />,
    { state: stateWith(isSaving) },
  );

describe('<RubricExplanation />', () => {
  // A criterion picked while a grade save is in flight would be overwritten by the save's outdated breakdown.
  it('disables criterion selection while a grade is saving', async () => {
    const page = renderExplanation(true);

    expect(await page.findByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('allows criterion selection otherwise', async () => {
    const page = renderExplanation(false);

    expect(await page.findByRole('combobox')).not.toHaveAttribute(
      'aria-disabled',
    );
  });
});
