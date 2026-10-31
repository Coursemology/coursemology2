import { useState } from 'react';
import {
  FieldValues,
  FormProvider,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { dispatch } from 'store';
import { act, fireEvent, render, screen } from 'test-utils';
import {
  ProgrammingAnswerData,
  ProgrammingContent,
} from 'types/course/assessment/submission/answer/programming';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { formatAnswer } from '../../../actions/utils';
import actionTypes from '../../../constants';
import { convertAnswerDataToInitialValue } from '../../../utils/answers';
import ProgrammingImportEditor from '../ProgrammingImportEditor';

// Only the editor mode is read; the rest of the question is irrelevant here.
const QUESTION = {
  editorMode: 'python',
} as unknown as SubmissionQuestionData<'Programming'>;

jest.mock(
  'lib/components/core/fields/EditorField',
  () =>
    // eslint-disable-next-line react/display-name
    ({
      name,
      value,
      onChange,
    }: {
      name: string;
      value: string;
      onChange: (value: string) => void;
    }): JSX.Element => (
      <textarea
        data-testid="editor"
        name={name}
        onChange={(e): void => onChange(e.target.value)}
        value={value}
      />
    ),
);

// As sent: each file's content is a file part, so its line endings arrive as they are.
interface SavedPayload {
  files_attributes: { id: number; filename: string; content: File }[];
}

const ANSWER_ID = 7;
const B_CONTENT = 'content of B';
const FILE_A: ProgrammingContent = {
  id: 1,
  filename: 'A.py',
  content: 'content of A',
};
const FILE_B: ProgrammingContent = {
  id: 2,
  filename: 'B.py',
  content: B_CONTENT,
};

const answerData = (files: ProgrammingContent[]): ProgrammingAnswerData =>
  ({
    questionType: 'Programming',
    fields: { id: ANSWER_ID, files_attributes: files },
  }) as unknown as ProgrammingAnswerData;

let form: UseFormReturn<FieldValues>;
let savedPayloads: SavedPayload[];

const Harness = (): JSX.Element => {
  const methods = useForm<FieldValues>({
    defaultValues: {
      [ANSWER_ID]: convertAnswerDataToInitialValue(
        answerData([FILE_A, FILE_B]),
      ),
    },
  });
  form = methods;
  const [displayFileName, setDisplayFileName] = useState('A.py');

  return (
    <FormProvider {...methods}>
      <ProgrammingImportEditor
        answerId={ANSWER_ID}
        displayFileName={displayFileName}
        editorRef={{ current: null }}
        isSavingAnswer={false}
        question={QUESTION}
        readOnly={false}
        saveAnswerAndUpdateClientVersion={(answerId: number): void => {
          savedPayloads.push(formatAnswer(methods.getValues()[answerId], 0));
        }}
        setDisplayFileName={setDisplayFileName}
      />
    </FormProvider>
  );
};

const editor = (): HTMLTextAreaElement =>
  screen.getByTestId<HTMLTextAreaElement>('editor');

const type = (text: string): void => {
  fireEvent.change(editor(), { target: { value: text } });
};

// What the post-save reset does, with the server listing the files in a different order.
const receiveSavedAnswer = (files: ProgrammingContent[]): void => {
  act(() => {
    form.resetField(`${ANSWER_ID}`, {
      defaultValue: convertAnswerDataToInitialValue(answerData(files)),
    });
  });
};

const formContents = (): Record<string, string> =>
  Object.fromEntries(
    (form.getValues()[ANSWER_ID].files_attributes as ProgrammingContent[]).map(
      (file) => [file.filename, file.content],
    ),
  );

const textOf = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.readAsText(file);
  });

const payloadContents = async (
  payload: SavedPayload,
): Promise<Record<number, string>> =>
  Object.fromEntries(
    await Promise.all(
      payload.files_attributes.map(
        async (file) => [file.id, await textOf(file.content)] as const,
      ),
    ),
  );

beforeEach(() => {
  savedPayloads = [];
  dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: {
      submission: { workflowState: 'attempting', isCreator: true },
      assessment: {},
      annotations: [],
      posts: [],
      questions: [],
      topics: [],
      answers: [],
    },
  });
});

describe('<ProgrammingImportEditor /> when an autosave returns the files reordered', () => {
  it('keeps showing and editing the selected file after switching files before the save returns', async () => {
    render(<Harness />);
    expect(await screen.findByTestId('editor')).toHaveValue('content of A');

    type('A edited');
    fireEvent.click(screen.getByText('B.py'));
    expect(editor()).toHaveValue(B_CONTENT);

    receiveSavedAnswer([FILE_B, { ...FILE_A, content: 'A edited' }]);
    expect(editor()).toHaveValue(B_CONTENT);

    type('B edited');
    expect(formContents()).toEqual({ 'A.py': 'A edited', 'B.py': 'B edited' });
  });

  it('keeps showing and editing the selected file when the save returns while it is open', async () => {
    render(<Harness />);
    await screen.findByTestId('editor');

    type('A edited');
    receiveSavedAnswer([FILE_B, { ...FILE_A, content: 'A edited' }]);
    expect(editor()).toHaveValue('A edited');

    type('A edited again');
    fireEvent.click(screen.getByText('B.py'));
    expect(editor()).toHaveValue(B_CONTENT);
    expect(formContents()).toEqual({
      'A.py': 'A edited again',
      'B.py': B_CONTENT,
    });
  });

  it('sends each edit to the server under the id of the file it was made in', async () => {
    render(<Harness />);
    await screen.findByTestId('editor');

    type('A edited');
    fireEvent.click(screen.getByText('B.py'));
    receiveSavedAnswer([FILE_B, { ...FILE_A, content: 'A edited' }]);
    // Typing adds to what the editor shows, so a wrong file shown here would be saved as B.
    type(`${editor().value}, typed in B`);

    expect(await Promise.all(savedPayloads.map(payloadContents))).toEqual([
      { [FILE_A.id]: 'A edited', [FILE_B.id]: B_CONTENT },
      { [FILE_A.id]: 'A edited', [FILE_B.id]: `${B_CONTENT}, typed in B` },
    ]);
  });
});
