import { fireEvent, render, waitFor } from 'test-utils';
import {
  AttachmentType,
  SolutionEntity,
  TextResponseEditableFormData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import TextResponseForm from '../components/TextResponseForm';

jest.mock(
  'lib/components/core/fields/CKEditorRichText',
  () =>
    // eslint-disable-next-line react/display-name
    ({
      name,
      onChange,
      value,
    }: {
      name: string;
      onChange?: (v: string) => void;
      value?: string;
    }): JSX.Element => (
      <textarea
        name={name}
        onChange={(e): void => onChange?.(e.target.value)}
        value={value ?? ''}
      />
    ),
);

const mockSavedSolution: SolutionEntity = {
  id: 1,
  solution: 'exact answer',
  solutionType: 'exact_match',
  grade: 5,
  explanation: '',
};

/** Matches the shape of a real backend response for a text_response question. */
const makeFormData = (
  solutions: SolutionEntity[] = [],
): TextResponseFormData => ({
  questionType: 'text_response',
  isAssessmentAutograded: false,
  defaultMaxAttachmentSize: 100,
  defaultMaxAttachments: 10,
  // solutions lives at the top level, matching the backend response shape
  solutions,
  question: {
    title: '',
    description: '',
    staffOnlyComments: '',
    maximumGrade: '10',
    skillIds: [],
    hideText: false,
    templateText: null,
    attachmentType: AttachmentType.NO_ATTACHMENT,
    maxAttachments: 3,
    maxAttachmentSize: 10,
    isAttachmentRequired: false,
  },
  availableSkills: null,
  skillsUrl: '',
});

/** Wait for I18nProvider to load async translations before asserting. */
const waitForForm = async (page: ReturnType<typeof render>): Promise<void> => {
  await waitFor(() =>
    expect(
      page.getByRole('button', { name: 'Add a new solution' }),
    ).toBeVisible(),
  );
};

describe('TextResponseForm — solutions UI', () => {
  it('loads solutions from a backend response into the form', async () => {
    const page = render(
      <TextResponseForm
        onSubmit={jest.fn()}
        with={makeFormData([
          mockSavedSolution,
          {
            id: 2,
            solution: 'keyword answer',
            solutionType: 'keyword',
            grade: 3,
            explanation: '',
          },
        ])}
      />,
    );

    await waitForForm(page);

    expect(page.getAllByPlaceholderText('0.0')).toHaveLength(2);
    expect(page.getByDisplayValue('exact answer')).toBeVisible();
    expect(page.getByDisplayValue('keyword answer')).toBeVisible();
  });

  it('renders existing saved solutions', async () => {
    const page = render(
      <TextResponseForm
        onSubmit={jest.fn()}
        with={makeFormData([mockSavedSolution])}
      />,
    );

    await waitForForm(page);

    expect(page.getAllByPlaceholderText('0.0')).toHaveLength(1);
    expect(page.getByDisplayValue('exact answer')).toBeVisible();
  });

  it('adds a new draft solution when "Add a new solution" is clicked', async () => {
    const page = render(
      <TextResponseForm onSubmit={jest.fn()} with={makeFormData()} />,
    );

    await waitForForm(page);
    expect(page.queryByPlaceholderText('0.0')).not.toBeInTheDocument();

    fireEvent.click(page.getByRole('button', { name: 'Add a new solution' }));

    expect(page.getAllByPlaceholderText('0.0')).toHaveLength(1);
    expect(
      page.getByText(
        'This is a new solution. It will immediately disappear if you delete before saving it.',
      ),
    ).toBeVisible();
  });

  it('removes a draft solution immediately when deleted', async () => {
    const page = render(
      <TextResponseForm onSubmit={jest.fn()} with={makeFormData()} />,
    );

    await waitForForm(page);
    fireEvent.click(page.getByRole('button', { name: 'Add a new solution' }));
    expect(page.getAllByPlaceholderText('0.0')).toHaveLength(1);

    fireEvent.click(page.getByRole('button', { name: 'Delete solution' }));

    expect(page.queryByPlaceholderText('0.0')).not.toBeInTheDocument();
  });

  it('keeps a saved solution visible but marks it for deletion', async () => {
    const page = render(
      <TextResponseForm
        onSubmit={jest.fn()}
        with={makeFormData([mockSavedSolution])}
      />,
    );

    await waitForForm(page);

    fireEvent.click(page.getByRole('button', { name: 'Delete solution' }));

    expect(page.getAllByPlaceholderText('0.0')).toHaveLength(1);
    expect(
      page.getByText(
        'This solution will be deleted once you save your changes.',
      ),
    ).toBeVisible();
  });

  it('restores a saved solution when deletion is undone', async () => {
    const page = render(
      <TextResponseForm
        onSubmit={jest.fn()}
        with={makeFormData([mockSavedSolution])}
      />,
    );

    await waitForForm(page);

    fireEvent.click(page.getByRole('button', { name: 'Delete solution' }));
    expect(
      page.getByText(
        'This solution will be deleted once you save your changes.',
      ),
    ).toBeVisible();

    fireEvent.click(page.getByRole('button', { name: 'Undo delete solution' }));

    expect(
      page.queryByText(
        'This solution will be deleted once you save your changes.',
      ),
    ).not.toBeInTheDocument();
  });

  it('passes solutions at the top level of the submitted payload', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});

    const page = render(
      <TextResponseForm
        onSubmit={onSubmit}
        with={makeFormData([mockSavedSolution])}
      />,
    );

    await waitForForm(page);

    fireEvent.change(page.getByPlaceholderText('0.0'), {
      target: { value: '8' },
    });

    await waitFor(() =>
      expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible(),
    );

    fireEvent.click(page.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    const submitted = onSubmit.mock.calls[0][0] as TextResponseEditableFormData;
    // solutions must be at top level, not inside question
    expect(submitted.solutions).toHaveLength(1);
    expect(submitted.solutions![0]).toMatchObject({
      id: 1,
      solution: 'exact answer',
      solutionType: 'exact_match',
    });
    expect(
      (submitted.question as unknown as Record<string, unknown>).solutions,
    ).toBeUndefined();
  });

  it('clears solutions from the payload for file_upload questions even if form state has them', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});

    // file_upload hides the SolutionsManager, but solutions may still be
    // present in the form's internal state from initialization.
    const fileUploadData: TextResponseFormData = {
      ...makeFormData([mockSavedSolution]),
      questionType: 'file_upload',
    };

    const page = render(
      <TextResponseForm onSubmit={onSubmit} with={fileUploadData} />,
    );

    // No solutions UI for file_upload — dirty the form via a common field.
    await waitFor(() =>
      expect(
        page.getByLabelText('Maximum grade', { exact: false }),
      ).toBeVisible(),
    );

    fireEvent.change(page.getByLabelText('Maximum grade', { exact: false }), {
      target: { value: '20' },
    });

    await waitFor(() =>
      expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible(),
    );

    fireEvent.click(page.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    const submitted = onSubmit.mock.calls[0][0] as TextResponseEditableFormData;
    expect(submitted.solutions).toHaveLength(0);
  });
});
