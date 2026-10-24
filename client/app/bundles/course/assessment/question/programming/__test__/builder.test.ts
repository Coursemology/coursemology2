import {
  DataFile,
  ProgrammingFormRequestData,
  PythonMetadata,
} from 'types/course/assessment/question/programming';

import buildFormData from '../commons/builder';
import { DraftableDataFile, mark } from '../commons/draftFiles';

const saved = (filename: string): DraftableDataFile => ({
  filename,
  size: 1,
  hash: 'abc',
});

const draft = (filename: string, content = 'x'): DraftableDataFile => {
  const raw = new File([content], filename.split('/').pop() ?? filename);
  return { filename, size: raw.size, hash: '', raw };
};

const build = (metadata: Partial<PythonMetadata>): FormData =>
  buildFormData({
    question: { autograded: true, editOnline: true },
    testUi: {
      mode: 'python',
      metadata: {
        submitAsFile: true,
        submissionFiles: [],
        solutionFiles: [],
        dataFiles: [],
        testCases: { public: [], private: [], evaluation: [] },
        ...metadata,
      },
    },
  } as unknown as ProgrammingFormRequestData);

describe('buildFormData', () => {
  it('sends each new file with its path, in the same order', () => {
    const index = draft('templates/index.html');
    const app = draft('app.py');
    const data = build({ submissionFiles: [index, saved('base.py'), app] });

    expect(data.getAll('question_programming[submission_files][]')).toEqual([
      index.raw,
      app.raw,
    ]);
    expect(
      data.getAll('question_programming[submission_file_paths][]'),
    ).toEqual(['templates/index.html', 'app.py']);
  });

  it('sends an empty file like any other', () => {
    const empty = draft('pkg/__init__.py', '');
    const data = build({ dataFiles: [empty] });

    expect(data.getAll('question_programming[data_files][]')).toEqual([
      empty.raw,
    ]);
    expect(data.getAll('question_programming[data_file_paths][]')).toEqual([
      'pkg/__init__.py',
    ]);
  });

  it('sends nothing for a saved file that is kept', () => {
    const data = build({ dataFiles: [saved('data/a.csv')] });

    expect(data.getAll('question_programming[data_files][]')).toEqual([]);
    expect(data.getAll('question_programming[data_file_paths][]')).toEqual([]);
    expect(data.getAll('question_programming[data_files_to_delete][]')).toEqual(
      [],
    );
  });

  it('sends deletions as a list of paths, which keeps names with brackets whole', () => {
    const data = build({
      // The form holds marked files in the same list, though the type doesn't say so.
      dataFiles: [
        mark(saved('data/a[1].csv')),
        mark(saved('b.txt')),
      ] as unknown as DataFile[],
    });

    expect(data.getAll('question_programming[data_files_to_delete][]')).toEqual(
      ['data/a[1].csv', 'b.txt'],
    );
  });

  it('keeps the file types apart', () => {
    const data = build({
      submissionFiles: [draft('main.py')],
      solutionFiles: [draft('templates/index.html')],
      dataFiles: [draft('data/a.csv')],
    });

    expect(
      data.getAll('question_programming[submission_file_paths][]'),
    ).toEqual(['main.py']);
    expect(data.getAll('question_programming[solution_file_paths][]')).toEqual([
      'templates/index.html',
    ]);
    expect(data.getAll('question_programming[data_file_paths][]')).toEqual([
      'data/a.csv',
    ]);
  });
});
