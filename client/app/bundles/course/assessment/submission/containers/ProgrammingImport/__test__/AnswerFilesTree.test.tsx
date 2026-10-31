import { useState } from 'react';
import {
  FieldValues,
  FormProvider,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { dispatch } from 'store';
import { fireEvent, render, screen, waitFor, within } from 'test-utils';
import {
  ProgrammingAnswerData,
  ProgrammingContent,
  ProgrammingFilePostData,
} from 'types/course/assessment/submission/answer/programming';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import ProgrammingAPI from 'api/course/Assessment/Submission/Answer/Programming';
import toast from 'lib/hooks/toast';

import actionTypes from '../../../constants';
import { convertAnswerDataToInitialValue } from '../../../utils/answers';
import ProgrammingImportEditor from '../ProgrammingImportEditor';

// Only the editor mode is read; the rest of the question is irrelevant here.
const QUESTION = {
  editorMode: 'python',
} as unknown as SubmissionQuestionData<'Programming'>;

// A row's delete button, which is labelled "Delete" alone: the row says what it deletes.
const rowNamed = (name: string): HTMLElement =>
  screen.getByRole('treeitem', {
    name: (label) => label === name || label.startsWith(`${name}, `),
  });
const deleteButtonOf = (name: string): HTMLElement =>
  within(rowNamed(name)).getByRole('button', { name: 'Delete' });
const queryDeleteButtonOf = (name: string): HTMLElement | null =>
  within(rowNamed(name)).queryByRole('button', { name: 'Delete' });
// The confirmation's Delete button, as opposed to the rows'.
const confirmDeleteButton = async (): Promise<HTMLElement> =>
  within(await screen.findByRole('dialog')).getByRole('button', {
    name: 'Delete',
  });

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

const Harness = (props: {
  initiallyShown?: string;
  files?: ProgrammingContent[];
}): JSX.Element => {
  form = useForm<FieldValues>({
    defaultValues: {
      [ANSWER_ID]: convertAnswerDataToInitialValue(
        answerData(props.files ?? FILES),
      ),
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
        question={QUESTION}
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

const renderTree = async (
  initiallyShown?: string,
  files?: ProgrammingContent[],
): Promise<void> => {
  render(<Harness files={files} initiallyShown={initiallyShown} />);
  await screen.findByRole('tree');
};

const textOf = (content: string | File): Promise<string> =>
  typeof content === 'string'
    ? Promise.resolve(content)
    : new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (): void => resolve(reader.result as string);
        reader.readAsText(content);
      });

// Saves what was sent, giving each new file an id, as the server does.
const saveWhatIsSent = async (_answerId: number, payload): Promise<never> => {
  const sent = payload.answer.files_attributes as ProgrammingFilePostData[];
  const files = await Promise.all(
    sent.map(async (saved, index) => ({
      id: saved.id ?? 10 + index,
      filename: saved.filename,
      content: await textOf(saved.content),
    })),
  );
  return { data: answerData(files) } as never;
};

const addFiles = (...files: File[]): void => {
  fireEvent.change(screen.getByTestId('file-tree-add-files'), {
    target: { files },
  });
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

  it('saves an upload under the folder it was added to, sending the picked file itself', async () => {
    const create = jest
      .spyOn(ProgrammingAPI.prototype, 'createProgrammingFiles')
      .mockImplementation(saveWhatIsSent);
    const user = userEvent.setup();
    await renderTree();

    await user.click(screen.getByRole('treeitem', { name: 'templates' }));
    const nav = new File(['<nav>\r\n'], 'nav.html');
    addFiles(nav);

    await waitFor(() => expect(create).toHaveBeenCalled());
    const sent = create.mock.calls[0][1].answer.files_attributes;
    // The picked file, not text read from it, so its bytes are saved as they are.
    expect(sent).toContainEqual({
      id: undefined,
      filename: 'templates/nav.html',
      content: nav,
    });
    await waitFor(() => expect(savedPaths()).toContain('templates/nav.html'));
    // A green toast, not the snackbar: the test app renders both, so the text alone proves nothing.
    expect(toast.success).toHaveBeenCalled();
    expect(await screen.findByText('File uploaded successfully')).toBeVisible();
  });

  it('opens the first saved file only once an upload to an empty answer is saved', async () => {
    const create = jest
      .spyOn(ProgrammingAPI.prototype, 'createProgrammingFiles')
      .mockRejectedValueOnce({
        response: { status: 400, data: { errors: ['Upload refused'] } },
      })
      .mockImplementationOnce(saveWhatIsSent);
    await renderTree('', []);

    addFiles(new File(['print(1)'], 'main.py'));
    expect(await screen.findByText('Upload refused')).toBeVisible();
    // Nothing was saved, so nothing is shown.
    expect(shown).toBe('');

    addFiles(new File(['print(2)'], 'main.py'));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(shown).toBe('main.py'));
    expect(await screen.findByTestId('editor')).toHaveValue('print(2)');
  });

  it('saves an empty file as a file with no content', async () => {
    const create = jest
      .spyOn(ProgrammingAPI.prototype, 'createProgrammingFiles')
      .mockImplementation(saveWhatIsSent);
    await renderTree('', []);

    const init = new File([], '__init__.py');
    addFiles(init);

    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][1].answer.files_attributes).toEqual([
      { id: undefined, filename: '__init__.py', content: init },
    ]);
    await waitFor(() => expect(shown).toBe('__init__.py'));
    expect(screen.getByRole('treeitem', { name: '__init__.py' })).toBeVisible();
  });

  it('counts the files of an upload in its success message', async () => {
    jest
      .spyOn(ProgrammingAPI.prototype, 'createProgrammingFiles')
      .mockImplementation(saveWhatIsSent);
    await renderTree();

    addFiles(new File(['a'], 'a.py'), new File(['b'], 'b.py'));

    expect(
      await screen.findByText('Files uploaded successfully'),
    ).toBeVisible();
  });

  it('replaces the shown file after asking, under the new name when only its case differs', async () => {
    const create = jest
      .spyOn(ProgrammingAPI.prototype, 'createProgrammingFiles')
      .mockImplementation(saveWhatIsSent);
    const user = userEvent.setup();
    await renderTree();

    const replacement = new File(['print("new")'], 'App.py');
    addFiles(replacement);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('app.py, 17 bytes → 12 bytes');
    await user.click(within(dialog).getByRole('button', { name: 'Replace' }));

    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][1].answer.files_attributes).toContainEqual({
      id: 1,
      filename: 'App.py',
      content: replacement,
    });
    await waitFor(() => expect(shown).toBe('App.py'));
    expect(await screen.findByTestId('editor')).toHaveValue('print("new")');
    expect(await screen.findByText('File uploaded successfully')).toBeVisible();
  });

  it('replaces nothing when the replacement is cancelled', async () => {
    const create = jest.spyOn(
      ProgrammingAPI.prototype,
      'createProgrammingFiles',
    );
    const user = userEvent.setup();
    await renderTree();

    addFiles(new File(['x'], 'app.py'));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('deletes the shown file after asking, then shows the next file in the tree', async () => {
    const destroy = jest
      .spyOn(ProgrammingAPI.prototype, 'deleteProgrammingFile')
      .mockResolvedValue({ data: {} } as never);
    const user = userEvent.setup();
    await renderTree('templates/base.html');

    await user.click(deleteButtonOf('base.html'));
    await user.click(await confirmDeleteButton());

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
    expect(queryDeleteButtonOf('templates')).not.toBeInTheDocument();
  });

  it('hides delete from anyone but the student, and once the answer is submitted', async () => {
    loadSubmission('attempting', false);
    const { unmount } = render(<Harness />);
    await screen.findByRole('tree');
    expect(queryDeleteButtonOf('app.py')).not.toBeInTheDocument();
    unmount();

    loadSubmission('submitted', true);
    await renderTree();
    expect(queryDeleteButtonOf('app.py')).not.toBeInTheDocument();
  });
});
