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
}

const renderTemplates = (options: RenderOptions = {}): void => {
  const {
    savedLanguageId = JAVA_ID,
    currentLanguageId = savedLanguageId,
    submitAsFile = false,
    hasSubmissions = false,
  } = options;

  const data = {
    question: { languageId: savedLanguageId, hasSubmissions },
    languages: [
      languageWith(JAVA_ID, 'Java 17', true),
      languageWith(PYTHON_ID, 'Python 3.10', false),
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
      await screen.findByRole('radio', { name: 'Code submission' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('radio', { name: 'File submission' }),
    ).toBeEnabled();
    expect(
      screen.getByText(
        'Upload code files as submission templates. Students can edit them online or upload their own code files to be tested.',
      ),
    ).toBeVisible();
    expect(screen.getAllByTestId('code-editor')).toHaveLength(2);
  });

  it('shows file uploads instead of code editors in file submission mode', async () => {
    renderTemplates({ submitAsFile: true });

    expect(
      await screen.findByRole('radio', { name: 'File submission' }),
    ).toBeChecked();
    expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument();
  });

  it('only shows code editors for a language without multiple file submission', async () => {
    renderTemplates({ savedLanguageId: PYTHON_ID });

    expect(await screen.findAllByTestId('code-editor')).toHaveLength(2);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('hides the choice after switching from a file submission question to a language without it', async () => {
    renderTemplates({ submitAsFile: true, currentLanguageId: PYTHON_ID });

    expect(await screen.findAllByTestId('code-editor')).toHaveLength(2);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('locks the choice once the question has submissions', async () => {
    renderTemplates({ hasSubmissions: true });

    expect(
      await screen.findByRole('radio', { name: 'Code submission' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('radio', { name: 'File submission' }),
    ).toBeDisabled();
  });
});
