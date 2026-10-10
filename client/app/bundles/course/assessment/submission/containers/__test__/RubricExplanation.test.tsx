import { AppState } from 'store';
import { fireEvent, render } from 'test-utils';

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
const stateWith = (
  isSaving: boolean,
  grade: number | null,
): Partial<AppState> =>
  ({
    assessments: {
      submission: {
        submission: { workflowState: 'submitted' },
        questions: { 1: { id: 1, maximumGrade: 2 } },
        grading: { questions: { 1: { id: 100, grade } } },
        questionsFlags: {},
        submissionFlags: { isAutograding: false, isSaving },
      },
    },
  }) as unknown as Partial<AppState>;

const renderExplanation = (
  isSaving: boolean,
  { grade = 0, updateGrade = jest.fn() } = {} as {
    grade?: number | null;
    updateGrade?: jest.Mock;
  },
): ReturnType<typeof render> =>
  render(
    <RubricExplanation
      category={category}
      categoryGrades={{
        1: { id: 1, gradeId: 10, grade: 0, explanation: null, name: 'Clarity' },
      }}
      questionId={1}
      setIsFirstRendering={jest.fn()}
      updateGrade={updateGrade}
    />,
    { state: stateWith(isSaving, grade) },
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

  // An answer nobody has graded yet has a null grade; picking a criterion must still save a numeric one.
  it('saves a numeric grade when the answer has not been graded yet', async () => {
    const updateGrade = jest.fn();
    const page = renderExplanation(false, { grade: null, updateGrade });

    fireEvent.mouseDown(await page.findByRole('combobox'));
    fireEvent.click(await page.findByRole('option', { name: /Clear/ }));

    expect(updateGrade).toHaveBeenCalledWith(
      expect.objectContaining({ 1: expect.objectContaining({ gradeId: 11 }) }),
      1,
      expect.anything(),
      2,
    );
  });
});
