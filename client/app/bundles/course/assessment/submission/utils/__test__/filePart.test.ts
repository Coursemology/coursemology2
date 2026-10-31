import ProgrammingAPI from 'api/course/Assessment/Submission/Answer/Programming';

import { formatAnswer } from '../../actions/utils';
import { questionTypes } from '../../constants';
import { asFilePart } from '../filePart';

const textOf = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.readAsText(file);
  });

describe('asFilePart', () => {
  it('keeps the line endings of text, whichever they are', async () => {
    const part = asFilePart('a = 1\r\nb = 2\nc = 3\r\n', 'app.py');

    expect(part).toBeInstanceOf(File);
    expect(part.name).toBe('app.py');
    expect(await textOf(part)).toBe('a = 1\r\nb = 2\nc = 3\r\n');
  });

  it('sends a file as it is', () => {
    const file = new File(['x'], 'app.py');

    expect(asFilePart(file, 'other.py')).toBe(file);
  });
});

describe('formatAnswer', () => {
  it("sends a programming answer's content as file parts", async () => {
    const answer = formatAnswer(
      {
        id: 7,
        questionType: questionTypes.Programming,
        files_attributes: [
          { id: 1, filename: 'app.py', content: 'a = 1\r\n' },
          { id: 2, filename: 'lib.py', content: 'b = 2\n' },
        ],
      },
      0,
    );

    const contents = await Promise.all(
      answer.files_attributes.map((file: { content: File }) =>
        textOf(file.content),
      ),
    );
    expect(contents).toEqual(['a = 1\r\n', 'b = 2\n']);
  });
});

describe('ProgrammingAPI#createProgrammingFiles', () => {
  it("sends every file's content as a file part, the saved files' too", async () => {
    const api = new ProgrammingAPI();
    const post = jest
      .spyOn(api.client, 'post')
      .mockResolvedValue({ data: {} } as never);
    const upload = new File(['new\r\n'], 'new.py');

    await api.createProgrammingFiles(7, {
      answer: {
        id: 7,
        files_attributes: [
          { id: 1, filename: 'app.py', content: 'saved\n' },
          { filename: 'new.py', content: upload },
        ],
      },
    });

    const data = post.mock.calls[0][1] as FormData;
    const parts = data.getAll('answer[files_attributes][][content]');
    expect(parts.every((part) => part instanceof File)).toBe(true);
    expect(
      await Promise.all(parts.map((part) => textOf(part as File))),
    ).toEqual(['saved\n', 'new\r\n']);
    expect(parts[1]).toBe(upload);
  });
});
