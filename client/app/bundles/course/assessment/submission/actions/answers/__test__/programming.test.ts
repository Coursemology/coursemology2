import { ReactElement } from 'react';
import { AppDispatch, AppState } from 'store';
import { ProgrammingFilePostData } from 'types/course/assessment/submission/answer/programming';

import ProgrammingAPI from 'api/course/Assessment/Submission/Answer/Programming';
import toast from 'lib/hooks/toast';

import actionTypes from '../../../constants';
import translations from '../../../translations';
import { importProgrammingFiles, moveProgrammingFiles } from '../programming';

// Runs thunks inline, so the notification thunk's action is recorded too.
const dispatch = jest.fn((action) =>
  typeof action === 'function' ? action(dispatch) : action,
);
const resetField = jest.fn();

// The client version the browser holds for answer 7, as the last edit set it.
let heldVersion: number | undefined;
const getState = (): AppState =>
  ({
    assessments: {
      submission: { answers: { clientVersionByAnswerId: { 7: heldVersion } } },
    },
  }) as unknown as AppState;

const saved = (id: number, filename: string): ProgrammingFilePostData => ({
  id,
  filename,
  content: '',
});
// As `AnswerFilesTree` sends a file read from an upload.
const added = (
  filename: string,
): ProgrammingFilePostData & { staged: boolean } => ({
  filename,
  content: '',
  staged: true,
});

const upload = (
  files: ProgrammingFilePostData[],
  language = 'python',
): Promise<void> =>
  importProgrammingFiles(
    7,
    files,
    language,
    resetField,
  )(dispatch as unknown as AppDispatch, getState, {});

let create: jest.SpyInstance;

beforeEach(() => {
  dispatch.mockClear();
  heldVersion = undefined;
  create = jest
    .spyOn(ProgrammingAPI.prototype, 'createProgrammingFiles')
    .mockResolvedValue({ data: {} } as never);
});

afterEach(() => jest.restoreAllMocks());

describe('importProgrammingFiles', () => {
  it('saves new files in folders', async () => {
    await upload([saved(1, 'app.py'), added('templates/index.html')]);

    expect(create).toHaveBeenCalled();
  });

  it.each([
    [
      'differs from a saved file only in case',
      [saved(1, 'app.py'), added('App.py')],
    ],
    [
      'is the name of a saved folder',
      [saved(1, 'templates/a.html'), added('templates')],
    ],
    ['is not a valid path', [added('../app.py')]],
    ['is too long', [added('a'.repeat(101))]],
  ])('does not save a new file whose path %s', async (_reason, files) => {
    await upload(files);

    expect(create).not.toHaveBeenCalled();
  });

  it('leaves alone saved files that clash with each other', async () => {
    await upload([saved(1, 'Main.py'), saved(2, 'main.py'), added('other.py')]);

    expect(create).toHaveBeenCalled();
  });

  it('still accepts only Java files for Java', async () => {
    await upload([added('pkg/Main.java'), added('notes.txt')], 'java');

    expect(create).not.toHaveBeenCalled();
  });

  it('explains a binary file the server turned away, instead of showing its raw error', async () => {
    const shown = jest.spyOn(toast, 'error').mockImplementation(() => 0);
    create.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errors: { 'files.content': ['must be text'] },
          codes: ['binary'],
        },
      },
    });

    await upload([added('archive.zip')]);

    const [content] = shown.mock.calls[0];
    expect((content as ReactElement).props.id).toBe(
      translations.binaryFileUploadError.id,
    );
  });
});

describe('the client version of a file save', () => {
  const versionsSet = (): number[] =>
    dispatch.mock.calls
      .map(([action]) => action)
      .filter(
        (action) => action?.type === actionTypes.UPDATE_ANSWER_CLIENT_VERSION,
      )
      .map((action) => action.payload.answer.clientVersion);

  it('is sent, and held once saved, so that an autosave queued before it is not sent', async () => {
    heldVersion = 1;
    await upload([saved(1, 'app.py')]);

    const sent = create.mock.calls[0][1].answer.client_version;
    expect(sent).toBeGreaterThan(1);
    expect(versionsSet()).toEqual([sent]);
  });

  it('does not replace a newer version, from an edit made while the save was in flight', async () => {
    heldVersion = Number.MAX_SAFE_INTEGER;
    await upload([saved(1, 'app.py')]);

    expect(versionsSet()).toEqual([]);
  });

  it('is not held when the save fails', async () => {
    jest.spyOn(toast, 'error').mockImplementation(() => 0);
    create.mockRejectedValue({ response: { status: 400, data: {} } });
    await upload([saved(1, 'app.py')]);

    expect(versionsSet()).toEqual([]);
  });
});

describe('an edit made while a file save is in flight', () => {
  // The answer as the server returns it after an upload replaced b.py.
  const savedAnswer = {
    questionType: 'Programming',
    fields: {
      id: 7,
      files_attributes: [
        { id: 1, filename: 'app.py', content: 'app as sent' },
        { id: 2, filename: 'b.py', content: 'b from the upload' },
      ],
    },
  };
  const sent = [
    { id: 1, filename: 'app.py', content: 'app as sent' },
    {
      id: 2,
      filename: 'b.py',
      content: new File(['b from the upload'], 'b.py'),
      staged: true,
    },
  ];
  // The form as the student left it: app.py typed into during the save.
  const currentFiles = (): { id: number; content: string }[] => [
    { id: 1, content: 'app typed during the save' },
    { id: 2, content: 'old b' },
  ];

  const uploadWith = (onEditedWhileSaving: () => void): Promise<void> =>
    importProgrammingFiles(7, sent, 'python', resetField, {
      currentFiles,
      onEditedWhileSaving,
    })(dispatch as unknown as AppDispatch, getState, {});

  const resetTo = (): unknown =>
    resetField.mock.calls.find(([name]) => name === '7')?.[1].defaultValue;

  beforeEach(() => resetField.mockClear());

  it('keeps the edit in the files sent from the form, takes the replaced file from the server, and autosaves again', async () => {
    create.mockImplementation(async () => {
      heldVersion = Number.MAX_SAFE_INTEGER;
      return { data: savedAnswer };
    });
    const resave = jest.fn();
    await uploadWith(resave);

    expect(resetTo()).toMatchObject({
      files_attributes: [
        { id: 1, content: 'app typed during the save' },
        { id: 2, content: 'b from the upload' },
      ],
    });
    expect(resave).toHaveBeenCalledTimes(1);
  });

  it('takes every file from the server, and does not autosave again, when there was no edit', async () => {
    create.mockResolvedValue({ data: savedAnswer } as never);
    const resave = jest.fn();
    await uploadWith(resave);

    expect(resetTo()).toMatchObject({
      files_attributes: [
        { id: 1, content: 'app as sent' },
        { id: 2, content: 'b from the upload' },
      ],
    });
    expect(resave).not.toHaveBeenCalled();
  });
});

describe('moveProgrammingFiles', () => {
  const move = (
    files: { id: number; filename: string }[],
    language: string,
  ): Promise<void> =>
    moveProgrammingFiles(
      7,
      files,
      language,
      resetField,
    )(dispatch as unknown as AppDispatch, getState, {});

  it('holds Java files to the .java extension, as uploads are', async () => {
    const shown = jest.spyOn(toast, 'error').mockImplementation(() => 0);
    await move([{ id: 1, filename: 'Main.txt' }], 'java');

    expect(create).not.toHaveBeenCalled();
    const [content] = shown.mock.calls[0];
    expect((content as ReactElement).props.id).toBe(
      translations.invalidJavaFileMove.id,
    );
  });

  it('moves Java files that keep the extension, and any file for other languages', async () => {
    await move([{ id: 1, filename: 'pkg/Main.java' }], 'java');
    await move([{ id: 1, filename: 'notes.txt' }], 'python');

    expect(create).toHaveBeenCalledTimes(2);
  });
});
