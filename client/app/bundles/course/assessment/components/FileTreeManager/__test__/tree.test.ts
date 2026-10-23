/* eslint-disable sonarjs/no-duplicate-string */
import { buildTree, FileTreeFolder, FileTreeNode, flatten } from '../tree';

interface TestFile {
  path: string;
  size: number;
}

const files = (...paths: string[]): TestFile[] =>
  paths.map((path) => ({ path, size: 1 }));

const build = (
  list: TestFile[],
  draftFolders: string[] = [],
): FileTreeFolder<TestFile> =>
  buildTree(list, (file) => file.path, draftFolders);

// Each row as `<depth><kind> <path>`, such as `1d templates/partials`, for readable assertions.
const describeRows = (rows: FileTreeNode<TestFile>[]): string[] =>
  rows.map(
    (row) => `${row.depth}${row.kind === 'folder' ? 'd' : 'f'} ${row.path}`,
  );

describe('buildTree', () => {
  it('keeps a flat list flat', () => {
    const root = build(files('b.py', 'a.py'));

    expect(describeRows(flatten(root, new Set()))).toEqual([
      '0f a.py',
      '0f b.py',
    ]);
  });

  it('nests files under their folders, creating each folder once', () => {
    const root = build(
      files(
        'templates/index.html',
        'app.py',
        'templates/partials/nav.html',
        'templates/base.html',
      ),
    );

    expect(describeRows(flatten(root, new Set()))).toEqual([
      '0d templates',
      '1d templates/partials',
      '2f templates/partials/nav.html',
      '1f templates/base.html',
      '1f templates/index.html',
      '0f app.py',
    ]);
  });

  it('sorts folders before files, then alphabetically ignoring case', () => {
    const root = build(files('b.py', 'Z/x.py', 'A.py', 'a/x.py', 'c.py'));

    expect(root.children.map((node) => node.name)).toEqual([
      'a',
      'Z',
      'A.py',
      'b.py',
      'c.py',
    ]);
  });

  it('orders names that differ only in case the same way every time', () => {
    const forward = build(files('readme', 'README'));
    const backward = build(files('README', 'readme'));

    expect(forward.children.map((node) => node.name)).toEqual(
      backward.children.map((node) => node.name),
    );
  });

  it('lists every file under each folder, at any depth', () => {
    const list = files(
      'templates/index.html',
      'templates/partials/nav.html',
      'app.py',
    );
    const root = build(list);
    const templates = root.children[0] as FileTreeFolder<TestFile>;
    const partials = templates.children[0] as FileTreeFolder<TestFile>;

    expect(root.files).toHaveLength(3);
    expect(templates.files.map((file) => file.path)).toEqual([
      'templates/index.html',
      'templates/partials/nav.html',
    ]);
    expect(partials.files.map((file) => file.path)).toEqual([
      'templates/partials/nav.html',
    ]);
  });

  it('adds draft folders, with every folder above them, even when they have no files', () => {
    const root = build(files('templates/index.html'), [
      'static/css',
      'templates',
    ]);

    expect(describeRows(flatten(root, new Set()))).toEqual([
      '0d static',
      '1d static/css',
      '0d templates',
      '1f templates/index.html',
    ]);
    expect((root.children[0] as FileTreeFolder<TestFile>).files).toEqual([]);
  });

  it('keeps a file and a folder with the same name apart, rather than failing', () => {
    const root = build(files('a', 'a/b.py'));

    expect(describeRows(flatten(root, new Set()))).toEqual([
      '0d a',
      '1f a/b.py',
      '0f a',
    ]);
  });

  it('returns an empty root for no files', () => {
    const root = build([]);

    expect(root).toMatchObject({
      path: '',
      depth: -1,
      children: [],
      files: [],
    });
  });
});

describe('flatten', () => {
  const root = build(
    files('templates/partials/nav.html', 'templates/index.html', 'app.py'),
  );

  it('leaves out what is inside a collapsed folder, but keeps the folder', () => {
    expect(describeRows(flatten(root, new Set(['templates'])))).toEqual([
      '0d templates',
      '0f app.py',
    ]);
  });

  it('keeps a nested folder collapsed only under its own path', () => {
    expect(
      describeRows(flatten(root, new Set(['templates/partials']))),
    ).toEqual([
      '0d templates',
      '1d templates/partials',
      '1f templates/index.html',
      '0f app.py',
    ]);
  });
});
