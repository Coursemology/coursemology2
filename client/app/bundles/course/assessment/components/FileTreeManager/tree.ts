import { basename, dirname, foldersOf } from './paths';

// Pure functions that turn a flat list of files with paths into the rows of a tree. The caller
// memoises them; the form and the answer keep their files as flat lists.

export interface FileTreeFile<T> {
  kind: 'file';
  path: string;
  name: string;
  /** 0 at the top level. */
  depth: number;
  file: T;
}

export interface FileTreeFolder<T> {
  kind: 'folder';
  /** `''` for the root. */
  path: string;
  name: string;
  /** -1 for the root, 0 at the top level. */
  depth: number;
  children: FileTreeNode<T>[];
  /** Every file under this folder, at any depth: for its count, its size, and deleting it. */
  files: T[];
}

export type FileTreeNode<T> = FileTreeFile<T> | FileTreeFolder<T>;

const depthOf = (path: string): number => path.split('/').length - 1;

// Alphabetical ignoring case, then by case so that the order is stable.
const compareNames = (a: string, b: string): number => {
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();
  if (lowerA !== lowerB) return lowerA < lowerB ? -1 : 1;
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

// Folders before files, each alphabetical ignoring case.
const compareNodes = <T>(a: FileTreeNode<T>, b: FileTreeNode<T>): number => {
  if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
  return compareNames(a.name, b.name);
};

const sortTree = <T>(folder: FileTreeFolder<T>): void => {
  folder.children.sort(compareNodes);
  folder.children.forEach((child) => {
    if (child.kind === 'folder') sortTree(child);
  });
};

/**
 * Builds the tree of a flat list of files.
 *
 * @param files The files, in any order.
 * @param pathOf Gives each file's path, such as `templates/index.html`.
 * @param draftFolders Folders the user created that may have no files yet, such as `static/css`.
 * @returns The root folder, whose path is `''`.
 */
export const buildTree = <T>(
  files: T[],
  pathOf: (file: T) => string,
  draftFolders: string[] = [],
): FileTreeFolder<T> => {
  const root: FileTreeFolder<T> = {
    kind: 'folder',
    path: '',
    name: '',
    depth: -1,
    children: [],
    files: [],
  };
  const folders = new Map<string, FileTreeFolder<T>>([['', root]]);

  const folderAt = (path: string): FileTreeFolder<T> => {
    const existing = folders.get(path);
    if (existing) return existing;

    const folder: FileTreeFolder<T> = {
      kind: 'folder',
      path,
      name: basename(path),
      depth: depthOf(path),
      children: [],
      files: [],
    };
    folderAt(dirname(path)).children.push(folder);
    folders.set(path, folder);
    return folder;
  };

  files.forEach((file) => {
    const path = pathOf(file);
    folderAt(dirname(path)).children.push({
      kind: 'file',
      path,
      name: basename(path),
      depth: depthOf(path),
      file,
    });
    root.files.push(file);
    foldersOf(path).forEach((folderPath) =>
      folderAt(folderPath).files.push(file),
    );
  });

  draftFolders.forEach((path) => folderAt(path));

  sortTree(root);
  return root;
};

/**
 * Lists the rows to show, top to bottom, leaving out what is inside collapsed folders. The root
 * itself is not a row.
 *
 * @param collapsed The paths of the collapsed folders.
 */
export const flatten = <T>(
  root: FileTreeFolder<T>,
  collapsed: ReadonlySet<string>,
): FileTreeNode<T>[] => {
  const rows: FileTreeNode<T>[] = [];

  const visit = (folder: FileTreeFolder<T>): void => {
    folder.children.forEach((child) => {
      rows.push(child);
      if (child.kind === 'folder' && !collapsed.has(child.path)) visit(child);
    });
  };

  visit(root);
  return rows;
};

/** The paths of the files in the order the tree shows them with every folder open. */
export const filePathsInTreeOrder = (paths: string[]): string[] =>
  flatten(
    buildTree(paths, (path) => path),
    new Set(),
  ).flatMap((node) => (node.kind === 'file' ? [node.path] : []));
