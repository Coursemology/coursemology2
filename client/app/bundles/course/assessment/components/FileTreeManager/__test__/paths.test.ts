/* eslint-disable sonarjs/no-duplicate-string */
import {
  basename,
  byteLength,
  dirname,
  foldersOf,
  isFromDroppedFolder,
  normalisePath,
  pathOfFile,
  validatePath,
  validatePaths,
} from '../paths';

// The same cases as spec/libraries/course/assessment/programming_file_path_spec.rb, so keep the two
// tables in step.
const PATH_CASES: [string, ReturnType<typeof validatePath>][] = [
  ['main.py', null],
  ['templates/index.html', null],
  ['static/css/style.css', null],
  ['.gitignore', null],
  ['my file.py', null],
  ['données/café.txt', null],
  ['', 'invalid'],
  ['/main.py', 'invalid'],
  ['main.py/', 'invalid'],
  ['a//b.py', 'invalid'],
  ['./main.py', 'invalid'],
  ['../main.py', 'invalid'],
  ['a/../b.py', 'invalid'],
  ['a\\b.py', 'invalid'],
  ['a?.py', 'invalid'],
  ['a*.py', 'invalid'],
  ['a:b.py', 'invalid'],
  ['a|b.py', 'invalid'],
  ['a"b.py', 'invalid'],
  ['a<b>.py', 'invalid'],
  [' main.py', 'invalid'],
  ['main.py ', 'invalid'],
  ['my  file.py', 'invalid'],
  ['my\tfile.py', 'invalid'],
  ['main\u0000.py', 'invalid'],
  ['main.', 'invalid'],
  ['folder./main.py', 'invalid'],
  ['a'.repeat(100), null],
  ['a'.repeat(101), 'tooLong'],
  // Each of these characters is 3 bytes in UTF-8.
  ['字'.repeat(33), null],
  ['字'.repeat(34), 'tooLong'],
  [`${'d'.repeat(67)}/${'d'.repeat(68)}/main.py`, null],
  [`${'d'.repeat(68)}/${'d'.repeat(68)}/main.py`, 'tooLong'],
  [`${'a/'.repeat(68)}main.py`, null],
  [`${'a/'.repeat(69)}main.py`, 'tooLong'],
];

describe('validatePath', () => {
  it.each(PATH_CASES)('returns the error for %j', (path, expected) => {
    expect(validatePath(path)).toBe(expected);
  });

  it('rejects a path with a lone surrogate, which has no UTF-8 encoding', () => {
    expect(validatePath('caf\uD800.py')).toBe('invalid');
  });

  it('accepts a character outside the Basic Multilingual Plane', () => {
    expect(validatePath('😀.py')).toBeNull();
  });
});

describe('byteLength', () => {
  it.each([
    ['a', 1],
    ['é', 2],
    ['字', 3],
    ['😀', 4],
  ])('counts %j as %i bytes of UTF-8', (text, bytes) => {
    expect(byteLength(text)).toBe(bytes);
  });
});

describe('validatePaths', () => {
  it('accepts distinct paths', () => {
    expect(
      validatePaths(['main.py', 'templates/index.html', 'templates/base.html']),
    ).toBeNull();
  });

  it('rejects paths that differ only in case', () => {
    expect(validatePaths(['Main.py', 'main.py'])).toBe('duplicate');
  });

  it('rejects a file with the same path as a folder, in any case', () => {
    expect(validatePaths(['templates', 'templates/index.html'])).toBe(
      'fileFolderClash',
    );
    expect(validatePaths(['Templates', 'templates/index.html'])).toBe(
      'fileFolderClash',
    );
  });

  it('accepts folders that share a prefix with a file', () => {
    expect(validatePaths(['temp', 'templates/index.html'])).toBeNull();
  });

  describe('with existing files', () => {
    it('rejects a new path that matches an existing one in another case', () => {
      expect(validatePaths(['Main.py'], ['main.py'])).toBe('duplicate');
    });

    it('rejects a new file at the path of an existing folder', () => {
      expect(validatePaths(['templates'], ['templates/index.html'])).toBe(
        'fileFolderClash',
      );
    });

    it('rejects a new file inside an existing file', () => {
      expect(validatePaths(['main.py/x.py'], ['main.py'])).toBe(
        'fileFolderClash',
      );
    });

    it('ignores clashes among the existing paths alone', () => {
      expect(validatePaths(['other.py'], ['Main.py', 'main.py'])).toBeNull();
    });
  });
});

describe('normalisePath', () => {
  it.each([
    ['templates/index.html', 'templates/index.html'],
    ['  templates / index.html ', 'templates/index.html'],
    ['templates\\index.html', 'templates/index.html'],
    ['templates//index.html', 'templates/index.html'],
    ['/templates/index.html', 'templates/index.html'],
    ['./templates/index.html', 'templates/index.html'],
    ['templates/', 'templates'],
  ])('tidies %j to %j', (raw, expected) => {
    expect(normalisePath(raw)).toBe(expected);
  });

  it('leaves the rest for validatePath to reject', () => {
    expect(normalisePath('a/../b?.py')).toBe('a/../b?.py');
  });
});

describe('path parts', () => {
  it('splits a path into its folder and name', () => {
    expect(dirname('a/b/c.py')).toBe('a/b');
    expect(basename('a/b/c.py')).toBe('c.py');
    expect(dirname('c.py')).toBe('');
    expect(basename('c.py')).toBe('c.py');
  });

  it('lists the folders a path is in', () => {
    expect(foldersOf('a/b/c.py')).toEqual(['a', 'a/b']);
    expect(foldersOf('c.py')).toEqual([]);
  });
});

const fileWith = (
  name: string,
  extra: { webkitRelativePath?: string; path?: string } = {},
): File => {
  const file = new File([''], name);
  if (extra.webkitRelativePath !== undefined)
    Object.defineProperty(file, 'webkitRelativePath', {
      value: extra.webkitRelativePath,
    });
  if (extra.path !== undefined)
    Object.defineProperty(file, 'path', { value: extra.path });
  return file;
};

describe('pathOfFile', () => {
  it('uses the name of a single file', () => {
    expect(pathOfFile(fileWith('app.py'))).toBe('app.py');
  });

  it('puts the file under the folder it was added to', () => {
    expect(
      pathOfFile(fileWith('index.html', { path: './index.html' }), 'templates'),
    ).toBe('templates/index.html');
  });
});

describe('isFromDroppedFolder', () => {
  it('is false for a loose file, picked or dropped', () => {
    expect(isFromDroppedFolder(fileWith('app.py'))).toBe(false);
    expect(isFromDroppedFolder(fileWith('app.py', { path: './app.py' }))).toBe(
      false,
    );
    expect(isFromDroppedFolder(fileWith('app.py', { path: '/app.py' }))).toBe(
      false,
    );
  });

  it('is true for a file react-dropzone found inside a dropped folder', () => {
    expect(
      isFromDroppedFolder(
        fileWith('index.html', { path: './site/index.html' }),
      ),
    ).toBe(true);
    expect(
      isFromDroppedFolder(fileWith('index.html', { path: '/site/index.html' })),
    ).toBe(true);
  });

  it('is true for a file from a folder picker', () => {
    expect(
      isFromDroppedFolder(
        fileWith('index.html', { webkitRelativePath: 'site/index.html' }),
      ),
    ).toBe(true);
  });
});
