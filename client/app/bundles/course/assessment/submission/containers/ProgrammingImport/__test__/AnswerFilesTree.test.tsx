import { useState } from 'react';
import {
  FieldValues,
  FormProvider,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { dispatch } from 'store';
import { fireEvent, render, screen, waitFor } from 'test-utils';
import {
  ProgrammingAnswerData,
  ProgrammingContent,
} from 'types/course/assessment/submission/answer/programming';

import ProgrammingAPI from 'api/course/Assessment/Submission/Answer/Programming';
import toast from 'lib/hooks/toast';

import actionTypes from '../../../constants';
import { convertAnswerDataToInitialValue } from '../../../utils/answers';
import ProgrammingImportEditor from '../ProgrammingImportEditor';

jest.mock(
  'lib/components/core/fields/EditorField',
  () =>
    // eslint-disable-next-line react/display-name
    ({ value }: { value: string }): JSX.Element => (
      <textarea data-testid="editor" readOnly value={value} />
    ),
);

const ANSWER_ID = 7;

const file = (id: number, filename: string): ProgrammingContent => ({
  id,
  filename,
  content: `content of ${filename}`,
});

const answerData = (files: ProgrammingContent[]): ProgrammingAnswerData =>
  ({
    questionType: 'Programming',
    fields: { id: ANSWER_ID, files_attributes: files },
  }) as unknown as ProgrammingAnswerData;

const FILES = [
  file(1, 'app.py'),
  file(2, 'templates/index.html'),
  file(3, 'templates/base.html'),
];

let form: UseFormReturn<FieldValues>;
let shown: string;

const Harness = (props: { initiallyShown?: string }): JSX.Element => {
  form = useForm<FieldValues>({
    defaultValues: {
      [ANSWER_ID]: convertAnswerDataToInitialValue(answerData(FILES)),
    },
  });
  const [displayFileName, setDisplayFileName] = useState(
    props.initiallyShown ?? 'app.py',
  );
  shown = displayFileName;

  // Rendered within the editor, which registers the answer's files with the form.
  return (
    <FormProvider {...form}>
      <ProgrammingImportEditor
        answerId={ANSWER_ID}
        displayFileName={displayFileName}
        editorRef={{ current: null }}
        isSavingAnswer={false}
        question={{ editorMode: 'python' }}
        readOnly={false}
        saveAnswerAndUpdateClientVersion={(): void => {}}
        setDisplayFileName={setDisplayFileName}
      />
    </FormProvider>
  );
};

const loadSubmission = (workflowState: string, isCreator: boolean): void => {
  dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: {
      submission: { workflowState, isCreator },
      assessment: {},
      annotations: [],
      posts: [],
      questions: [],
      topics: [],
      answers: [],
    },
  });
};

const renderTree = async (initiallyShown?: string): Promise<void> => {
  render(<Harness initiallyShown={initiallyShown} />);
  await screen.findByRole('tree');
};

const savedPaths = (): string[] =>
  (form.getValues()[ANSWER_ID].files_attributes as ProgrammingContent[]).map(
    (saved) => saved.filename,
  );

beforeEach(() => {
  loadSubmission('attempting', true);
  // Watched, not replaced, so the toasts still render.
  jest.spyOn(toast, 'success');
});

afterEach(() => jest.restoreAllMocks());

describe('<AnswerFilesTree />', () => {
  it('shows the files in their folders, and selects one by its path', async () => {
    const user = userEvent.setup();
    await renderTree();

    expect(screen.getByRole('treeitem', { name: 'app.py' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('treeitem', { name: 'base.html' }));

    expect(shown).toBe('templates/base.html');
  });

  it('saves an upload under the folder it was added to', async () => {
    const create = jest
      .spyOn(ProgrammingAPI.prototype, 'createProgrammingFiles')
      .mockImplementation((_answerId, payload) => {
        const sent = payload.answer.files_attributes as ProgrammingContent[];
        return Promise.resolve({
          data: answerData(
            sent.map((saved, index) => ({
              ...saved,
              id: saved.id ?? 10 + index,
            })),
          ),
        } as never);
      });
    const user = userEvent.setup();
    await renderTree();

    await user.click(screen.getByRole('treeitem', { name: 'templates' }));
    fireEvent.change(screen.getByTestId('file-tree-add-files'), {
      target: { files: [new File(['<nav>'], 'nav.html')] },
    });

    await waitFor(() => expect(create).toHaveBeenCalled());
    const sent = create.mock.calls[0][1].answer.files_attributes;
    expect(sent).toContainEqual({
      id: undefined,
      filename: 'templates/nav.html',
      content: '<nav>',
    });
    await waitFor(() => expect(savedPaths()).toContain('templates/nav.html'));
    // A green toast, not the snackbar: the test app renders both, so the text alone proves nothing.
    expect(toast.success).toHaveBeenCalled();
    expect(
      await screen.findByText('Files uploaded successfully'),
    ).toBeVisible();
  });

  it('rejects an upload whose name differs from a saved file only in case', async () => {
    const create = jest.spyOn(
      ProgrammingAPI.prototype,
      'createProgrammingFiles',
    );
    await renderTree();

    fireEvent.change(screen.getByTestId('file-tree-add-files'), {
      target: { files: [new File(['x'], 'App.py')] },
    });

    expect(await screen.findByText(/not added/)).toBeVisible();
    expect(create).not.toHaveBeenCalled();
  });

  it('deletes the shown file after asking, then shows the next file in the tree', async () => {
    const destroy = jest
      .spyOn(ProgrammingAPI.prototype, 'deleteProgrammingFile')
      .mockResolvedValue({ data: {} } as never);
    const user = userEvent.setup();
    await renderTree('templates/base.html');

    await user.click(screen.getByLabelText('Delete base.html'));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(destroy).toHaveBeenCalledWith(ANSWER_ID, {
        answer: { id: ANSWER_ID, file_id: 3 },
      }),
    );
    await waitFor(() => expect(shown).toBe('templates/index.html'));
    expect(savedPaths()).toEqual(['app.py', 'templates/index.html']);
    expect(await screen.findByText('File deleted successfully')).toBeVisible();
    expect(toast.success).toHaveBeenCalled();
  });

  it('lets students create folders, but not delete them', async () => {
    await renderTree();

    expect(screen.getByRole('button', { name: 'New folder' })).toBeVisible();
    expect(
      screen.queryByLabelText('Delete folder templates'),
    ).not.toBeInTheDocument();
  });

  it('hides delete from anyone but the student, and once the answer is submitted', async () => {
    loadSubmission('attempting', false);
    const { unmount } = render(<Harness />);
    await screen.findByRole('tree');
    expect(screen.queryByLabelText('Delete app.py')).not.toBeInTheDocument();
    unmount();

    loadSubmission('submitted', true);
    await renderTree();
    expect(screen.queryByLabelText('Delete app.py')).not.toBeInTheDocument();
  });
});
