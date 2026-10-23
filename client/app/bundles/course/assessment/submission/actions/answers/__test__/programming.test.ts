import { ReactElement } from 'react';

import ProgrammingAPI from 'api/course/Assessment/Submission/Answer/Programming';
import toast from 'lib/hooks/toast';

import translations from '../../../translations';
import { importProgrammingFiles } from '../programming';

// Runs thunks inline, so the notification thunk's action is recorded too.
const dispatch = jest.fn((action) =>
  typeof action === 'function' ? action(dispatch) : action,
);
const resetField = jest.fn();

const saved = (id: number, filename: string): object => ({
  id,
  filename,
  content: '',
});
const added = (filename: string): object => ({
  filename,
  content: '',
  staged: true,
});

// The thunk returns the save's promise, though its JavaScript source gives TypeScript no type for it.
const upload = (files: object[], language = 'python'): unknown =>
  importProgrammingFiles(7, files, language, resetField)(dispatch);

let create: jest.SpyInstance;

beforeEach(() => {
  dispatch.mockClear();
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
