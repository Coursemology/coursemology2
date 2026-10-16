import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { dispatch } from 'store';
import { act, fireEvent, render, screen, waitFor } from 'test-utils';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import recorderHelper from '../../../../../utils/recorderHelper';
import VoiceResponseAnswer from '..';

jest.mock('../../../../../utils/recorderHelper');

const helper = jest.mocked(recorderHelper);
const save = jest.fn();
const recording = new File(['audio'], '1700000000.m4a', { type: 'audio/mp4' });

const START = 'Start Recording';
const STOP = 'Stop Recording';

const answerIdOf = (questionId: number): number => questionId + 100;

interface HarnessProps {
  questionIds?: number[];
  readOnly?: boolean;
  savedUrl?: string | null;
}

// Two voice questions in one form, as on a submission page. "Hide first question" unmounts the first
// while the second stays, as a tabbed assessment does when changing step.
const Harness = (props: HarnessProps): JSX.Element => {
  const { questionIds = [1, 2], readOnly = false, savedUrl = null } = props;
  const [hideFirst, setHideFirst] = useState(false);
  const methods = useForm({
    defaultValues: Object.fromEntries(
      questionIds.map((id) => [
        answerIdOf(id),
        { file: { url: savedUrl, name: savedUrl ? 'saved.wav' : '' } },
      ]),
    ),
  });

  return (
    <FormProvider {...methods}>
      <button onClick={(): void => setHideFirst(true)} type="button">
        Hide first question
      </button>
      {questionIds
        .filter((id, index) => !(hideFirst && index === 0))
        .map((id) => (
          <VoiceResponseAnswer
            key={id}
            answerId={answerIdOf(id)}
            question={{ id } as SubmissionQuestionData<'VoiceResponse'>}
            readOnly={readOnly}
            saveAnswerAndUpdateClientVersion={save}
          />
        ))}
    </FormProvider>
  );
};

const startButtons = (): Promise<HTMLElement[]> =>
  screen.findAllByRole('button', { name: START });

const stopButtons = (): HTMLElement[] =>
  screen.getAllByRole('button', { name: STOP });

beforeEach(() => {
  dispatch({ type: 'PURGE_SUBMISSION_STORE' });
  helper.isRecordingSupported.mockReturnValue(true);
  helper.startRecord.mockResolvedValue();
  helper.stopRecord.mockResolvedValue(recording);
  helper.getMicrophoneError.mockReturnValue(null);
  helper.subscribeToMicrophoneError.mockReturnValue(() => {});
  // jsdom implements neither.
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: () => 'blob:recording',
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: () => {},
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('<VoiceResponseAnswer />', () => {
  it('lets only one question record at a time, and only it can stop', async () => {
    render(<Harness />);

    fireEvent.click((await startButtons())[0]);

    await waitFor(() => expect(stopButtons()[0]).toBeEnabled());
    (await startButtons()).forEach((button) => expect(button).toBeDisabled());
    expect(stopButtons()[1]).toBeDisabled();
  });

  it('saves the recording when stopped, and previews it', async () => {
    render(<Harness />);
    fireEvent.click((await startButtons())[0]);
    await waitFor(() => expect(stopButtons()[0]).toBeEnabled());

    fireEvent.click(stopButtons()[0]);

    await waitFor(() => expect(save).toHaveBeenCalledWith(answerIdOf(1)));
    expect(save).toHaveBeenCalledTimes(1);
    expect(document.querySelector('audio')).toHaveAttribute(
      'src',
      'blob:recording',
    );
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: START })[0]).toBeEnabled(),
    );
  });

  it('discards the take when its question unmounts mid-recording, freeing the others', async () => {
    render(<Harness />);
    fireEvent.click((await startButtons())[0]);
    await waitFor(() => expect(stopButtons()[0]).toBeEnabled());

    fireEvent.click(
      screen.getByRole('button', { name: 'Hide first question' }),
    );

    expect(helper.cancelRecord).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: START })).toBeEnabled(),
    );
    expect(save).not.toHaveBeenCalled();
  });

  it('discards a take that starts after its question unmounted, e.g. while the mic prompt was open', async () => {
    let grantMicrophone!: () => void;
    helper.startRecord.mockReturnValue(
      new Promise((resolve) => {
        grantMicrophone = resolve;
      }),
    );
    render(<Harness />);
    fireEvent.click((await startButtons())[0]);

    fireEvent.click(
      screen.getByRole('button', { name: 'Hide first question' }),
    );
    await act(async () => grantMicrophone());

    expect(helper.cancelRecord).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: START })).toBeEnabled();
  });

  it('plays the saved file when nothing new was recorded', async () => {
    render(<Harness questionIds={[1]} savedUrl="https://example.com/a.wav" />);
    await startButtons();

    expect(document.querySelector('audio')).toHaveAttribute(
      'src',
      'https://example.com/a.wav',
    );
  });

  it('accepts the common audio formats for upload', async () => {
    render(<Harness questionIds={[1]} />);
    await startButtons();

    const accept = document
      .querySelector('input[type="file"]')
      ?.getAttribute('accept');
    ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.opus', '.webm', '.flac'].forEach(
      (extension) => expect(accept).toContain(extension),
    );
  });

  it('hides the upload and recording controls when read-only', async () => {
    render(
      <Harness
        questionIds={[1]}
        readOnly
        savedUrl="https://example.com/a.wav"
      />,
    );

    await waitFor(() =>
      expect(document.querySelector('audio')).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: START }),
    ).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it('explains a blocked microphone', async () => {
    helper.getMicrophoneError.mockReturnValue('NotAllowedError');

    render(<Harness questionIds={[1]} />);

    expect(
      await screen.findByText(/Microphone access is blocked/),
    ).toBeVisible();
  });

  it('offers upload only when the browser cannot record', async () => {
    helper.isRecordingSupported.mockReturnValue(false);

    render(<Harness questionIds={[1]} />);

    expect(
      await screen.findByText(/Your browser does not support recording/),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: START }),
    ).not.toBeInTheDocument();
  });
});
