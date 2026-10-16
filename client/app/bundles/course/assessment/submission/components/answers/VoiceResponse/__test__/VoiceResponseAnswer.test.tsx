import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { dispatch } from 'store';
import { act, fireEvent, render, screen, waitFor } from 'test-utils';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import toast from 'lib/hooks/toast';

import recorderHelper from '../../../../../utils/recorderHelper';
import VoiceResponseAnswer from '..';

jest.mock('../../../../../utils/recorderHelper');
jest.mock('lib/hooks/toast');

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

// Mirrors the helper's ownership of the take: owned from startRecord until stopRecord or cancelRecord is
// called, not until the stop completes. An automatic stop at the size limit calls stopRecord itself.
let ownsTake: boolean;

const deferred = <T,>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const captureStartOptions = (): {
  options: () => Parameters<typeof recorderHelper.startRecord>[0];
} => {
  let captured: Parameters<typeof recorderHelper.startRecord>[0];
  helper.startRecord.mockImplementationOnce(async (options) => {
    captured = options;
    ownsTake = true;
  });
  return { options: () => captured };
};

beforeEach(() => {
  dispatch({ type: 'PURGE_SUBMISSION_STORE' });
  ownsTake = false;
  helper.isRecordingSupported.mockReturnValue(true);
  helper.isRecording.mockImplementation(() => ownsTake);
  helper.startRecord.mockImplementation(async () => {
    ownsTake = true;
  });
  helper.stopRecord.mockImplementation(async () => {
    ownsTake = false;
    return recording;
  });
  helper.cancelRecord.mockImplementation(() => {
    ownsTake = false;
  });
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

  it('records up to the size limit, and saves a take stopped there', async () => {
    const start = captureStartOptions();
    render(<Harness />);
    fireEvent.click((await startButtons())[0]);
    await waitFor(() => expect(stopButtons()[0]).toBeEnabled());

    expect(start.options()?.maxBytes).toBe(15_000_000);
    ownsTake = false;
    act(() => start.options()?.onLimitReached?.(recording));

    expect(save).toHaveBeenCalledWith(answerIdOf(1));
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining('stopped automatically at the 15 MB size limit'),
    );
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: START })[0]).toBeEnabled(),
    );
  });

  describe('while a stop is completing', () => {
    it('ignores further Stop clicks, so only the completing stop releases the controls', async () => {
      const pendingStop = deferred<File>();
      helper.stopRecord.mockImplementationOnce(() => {
        ownsTake = false;
        return pendingStop.promise;
      });
      render(<Harness />);
      fireEvent.click((await startButtons())[0]);
      await waitFor(() => expect(stopButtons()[0]).toBeEnabled());

      fireEvent.click(stopButtons()[0]);
      fireEvent.click(stopButtons()[0]);
      await act(async () => {});

      expect(helper.stopRecord).toHaveBeenCalledTimes(1);
      (await startButtons()).forEach((button) => expect(button).toBeDisabled());

      await act(async () => pendingStop.resolve(recording));

      expect(save).toHaveBeenCalledTimes(1);
      (await startButtons()).forEach((button) => expect(button).toBeEnabled());
    });

    it('ignores Stop while an automatic stop at the size limit completes', async () => {
      const start = captureStartOptions();
      render(<Harness />);
      fireEvent.click((await startButtons())[0]);
      await waitFor(() => expect(stopButtons()[0]).toBeEnabled());

      ownsTake = false; // The automatic stop has begun, and is flushing the last chunk.
      fireEvent.click(stopButtons()[0]);
      await act(async () => {});

      expect(helper.stopRecord).not.toHaveBeenCalled();
      (await startButtons()).forEach((button) => expect(button).toBeDisabled());

      act(() => start.options()?.onLimitReached?.(recording));

      expect(save).toHaveBeenCalledTimes(1);
      (await startButtons()).forEach((button) => expect(button).toBeEnabled());
    });

    it('discards a manual stop that completes after its question unmounted', async () => {
      const pendingStop = deferred<File>();
      helper.stopRecord.mockImplementationOnce(() => {
        ownsTake = false;
        return pendingStop.promise;
      });
      render(<Harness />);
      fireEvent.click((await startButtons())[0]);
      await waitFor(() => expect(stopButtons()[0]).toBeEnabled());
      fireEvent.click(stopButtons()[0]);

      fireEvent.click(
        screen.getByRole('button', { name: 'Hide first question' }),
      );
      // The remaining question starts a take of its own before the first stop completes.
      fireEvent.click(await screen.findByRole('button', { name: START }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: STOP })).toBeEnabled(),
      );
      await act(async () => pendingStop.resolve(recording));

      expect(save).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: STOP })).toBeEnabled();
    });

    it('discards an automatic stop that completes after its question unmounted', async () => {
      const start = captureStartOptions();
      render(<Harness />);
      fireEvent.click((await startButtons())[0]);
      await waitFor(() => expect(stopButtons()[0]).toBeEnabled());
      ownsTake = false; // The automatic stop has begun, and is flushing the last chunk.

      fireEvent.click(
        screen.getByRole('button', { name: 'Hide first question' }),
      );
      // The remaining question starts a take of its own before the automatic stop completes.
      fireEvent.click(await screen.findByRole('button', { name: START }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: STOP })).toBeEnabled(),
      );
      act(() => start.options()?.onLimitReached?.(recording));

      expect(save).not.toHaveBeenCalled();
      expect(toast.info).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: STOP })).toBeEnabled();
    });
  });

  it('rejects an upload over the size limit, keeping the current answer', async () => {
    render(<Harness questionIds={[1]} />);
    await startButtons();
    const tooLarge = new File(['audio'], 'long.mp3', { type: 'audio/mpeg' });
    Object.defineProperty(tooLarge, 'size', { value: 15_000_001 });

    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [tooLarge] },
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('larger than the 15 MB limit'),
      ),
    );
    expect(save).not.toHaveBeenCalled();
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
