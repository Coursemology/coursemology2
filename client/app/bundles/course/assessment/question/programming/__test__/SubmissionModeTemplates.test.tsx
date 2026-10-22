import { FormProvider, useForm } from 'react-hook-form';
import { render, screen } from 'test-utils';
import {
  LanguageData,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import SubmissionModeTemplates from '../components/common/SubmissionModeTemplates';
import { ProgrammingFormDataProvider } from '../hooks/ProgrammingFormDataContext';

jest.mock(
  'lib/components/core/fields/EditorField',
  () =>
    // eslint-disable-next-line react/display-name
    ({ name }: { name: string }): JSX.Element => (
      <textarea data-testid="code-editor" name={name} />
    ),
);

const CODE_EDITOR = 'code-editor';
const CODE_SUBMISSION = 'Code submission';
const FILE_SUBMISSION = 'File submission';

const JAVA_ID = 9;
const PYTHON_ID = 18;

const languageWith = (
  id: number,
  name: string,
  multipleFileSubmission: boolean,
): LanguageData => ({
  id,
  name,
  disabled: false,
  editorMode: id === JAVA_ID ? 'java' : 'python',
  whitelists: {
    defaultEvaluator: true,
    codaveriEvaluator: true,
    multipleFileSubmission,
  },
  dependencies: [],
});

interface RenderOptions {
  savedLanguageId?: number;
  currentLanguageId?: number;
  submitAsFile?: boolean;
  hasSubmissions?: boolean;
  pythonSupportsFiles?: boolean;
}

const renderTemplates = (options: RenderOptions = {}): void => {
  const {
    savedLanguageId = JAVA_ID,
    currentLanguageId = savedLanguageId,
    submitAsFile = false,
    hasSubmissions = false,
    pythonSupportsFiles = false,
  } = options;

  const data = {
    question: { languageId: savedLanguageId, hasSubmissions },
    languages: [
      languageWith(JAVA_ID, 'Java 17', true),
      languageWith(PYTHON_ID, 'Python 3.10', pythonSupportsFiles),
    ],
  } as unknown as ProgrammingFormData;

  const Harness = (): JSX.Element => {
    const methods = useForm({
      defaultValues: {
        question: { languageId: currentLanguageId },
        testUi: {
          mode: 'java',
          metadata: {
            submitAsFile,
            submission: '',
            solution: '',
            submissionFiles: [],
            solutionFiles: [],
          },
        },
      } as unknown as ProgrammingFormData,
    });

    return (
      <ProgrammingFormDataProvider from={data}>
        <FormProvider {...methods}>
          <SubmissionModeTemplates language="java" />
        </FormProvider>
      </ProgrammingFormDataProvider>
    );
  };

  render(<Harness />);
};

describe('<SubmissionModeTemplates />', () => {
  it('offers code or file submission for a whitelisted language', async () => {
    renderTemplates();

    expect(
      await screen.findByRole('radio', { name: CODE_SUBMISSION }),
    ).toBeEnabled();
    expect(screen.getByRole('radio', { name: FILE_SUBMISSION })).toBeEnabled();
    expect(
      screen.getByText(
        'Upload code files as submission templates. Students can edit them online or upload their own code files to be tested.',
      ),
    ).toBeVisible();
    expect(screen.getAllByTestId(CODE_EDITOR)).toHaveLength(2);
  });

  it('shows file uploads instead of code editors in file submission mode', async () => {
    renderTemplates({ submitAsFile: true });

    expect(
      await screen.findByRole('radio', { name: FILE_SUBMISSION }),
    ).toBeChecked();
    expect(screen.queryByTestId(CODE_EDITOR)).not.toBeInTheDocument();
  });

  it('only shows code editors for a language without multiple file submission', async () => {
    renderTemplates({ savedLanguageId: PYTHON_ID });

    expect(await screen.findAllByTestId(CODE_EDITOR)).toHaveLength(2);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('hides the choice after switching from a file submission question to a language without it', async () => {
    renderTemplates({ submitAsFile: true, currentLanguageId: PYTHON_ID });

    expect(await screen.findAllByTestId(CODE_EDITOR)).toHaveLength(2);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('keeps file submission after switching to another language with it', async () => {
    renderTemplates({
      submitAsFile: true,
      currentLanguageId: PYTHON_ID,
      pythonSupportsFiles: true,
    });

    expect(
      await screen.findByRole('radio', { name: FILE_SUBMISSION }),
    ).toBeChecked();
    expect(screen.queryByTestId(CODE_EDITOR)).not.toBeInTheDocument();
  });

  it('locks the choice once the question has submissions', async () => {
    renderTemplates({ hasSubmissions: true });

    expect(
      await screen.findByRole('radio', { name: CODE_SUBMISSION }),
    ).toBeDisabled();
    expect(screen.getByRole('radio', { name: FILE_SUBMISSION })).toBeDisabled();
  });
});
