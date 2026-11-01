import { useCallback, useMemo, useState } from 'react';

import {
  dirname,
  foldersOf,
  joinPath,
  normalisePath,
  PathCollectionError,
  PathError,
  validateFolderPath,
  validatePath,
  validatePaths,
} from './paths';
import { buildTree, FileTreeFolder, FileTreeNode, flatten } from './tree';
import { FileTreeEntry, FileTreeMove } from './types';

export type NameError =
  | PathError
  | PathCollectionError
  | 'folderAlreadyExists'
  | 'reserved';

export type MoveResult = { error: NameError } | { moves: FileTreeMove[] };

/** A row to move: a file, or a folder and everything in it. */
export interface MoveTarget {
  kind: 'file' | 'folder';
  path: string;
}

/** A file and a folder can share a path while it is still being checked, so rows are keyed by both. */
export const rowKey = (node: FileTreeNode<FileTreeEntry>): string =>
  `${node.kind}:${node.path}`;

/** The folder that new files and folders go into when this row is focused. */
export const folderOfRow = (
  node: FileTreeNode<FileTreeEntry> | undefined,
): string => {
  if (!node) return '';
  return node.kind === 'folder' ? node.path : dirname(node.path);
};

const collectFolders = (
  folder: FileTreeFolder<FileTreeEntry>,
  into: FileTreeFolder<FileTreeEntry>[] = [],
): FileTreeFolder<FileTreeEntry>[] => {
  folder.children.forEach((child) => {
    if (child.kind !== 'folder') return;
    into.push(child);
    collectFolders(child, into);
  });
  return into;
};

const isInFolder = (path: string, folder: string): boolean =>
  path === folder || path.startsWith(`${folder}/`);

/**
 * The file a path is reserved for, ignoring case: a moved file keeps the path it was saved under
 * until the changes are saved. Nothing else may take it, so that Undo can always put the file back,
 * and so that the save isn't refused: the server checks moves against the files as they were saved.
 */
export const reservedFor = (
  files: FileTreeEntry[],
  path: string,
): FileTreeEntry | undefined => {
  const key = path.toLowerCase();
  return files.find((file) => file.previousPath?.toLowerCase() === key);
};

/** The saved paths that moved files keep, for checking new paths against as other files' paths. */
export const reservedPaths = (files: FileTreeEntry[]): string[] =>
  files.flatMap((file) => (file.previousPath ? [file.previousPath] : []));

export interface FileTree {
  root: FileTreeFolder<FileTreeEntry>;
  /** The visible rows, top to bottom. */
  rows: FileTreeNode<FileTreeEntry>[];
  isCollapsed: (path: string) => boolean;
  /** Expands the folder and every folder above it. */
  expand: (path: string) => void;
  collapse: (path: string) => void;
  toggle: (path: string) => void;
  anyExpanded: boolean;
  /** Whether any folder holds something, so that it can be opened and closed. */
  hasOpenableFolders: boolean;
  /** Collapses every folder, or expands them all when none is open. */
  toggleAll: () => void;
  focusedKey?: string;
  /** Focuses a row, which also makes its folder the target again. */
  setFocusedKey: (key: string) => void;
  focusedRow?: FileTreeNode<FileTreeEntry>;
  /**
   * Where new files and folders go: the focused folder, or the focused file's folder, until
   * `targetTopLevel` is called.
   */
  targetFolder: string;
  /** Makes the top level the target, until a row is focused again. */
  targetTopLevel: () => void;
  removeDraftFolder: (path: string) => void;
  /** The folder a new folder is being named in, or `null`. */
  creatingIn: string | null;
  startCreating: () => void;
  cancelCreating: () => void;
  createFolder: (raw: string) => NameError | null;
  /** The row being renamed, or `null`. */
  renaming: MoveTarget | null;
  startRenaming: (target: MoveTarget) => void;
  cancelRenaming: () => void;
  submitRename: (raw: string) => MoveResult;
}

/**
 * The tree's UI state: which folders are collapsed, which row is focused, the empty folders the user
 * made, and the row being named. The files themselves stay with the caller.
 */
const useFileTree = (files: FileTreeEntry[]): FileTree => {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [focusedKey, setFocusedKeyState] = useState<string>();
  // Every row is in a folder or is one, so the top level needs its own way to be the target.
  const [atTopLevel, setAtTopLevel] = useState(false);
  const [draftFolders, setDraftFolders] = useState<string[]>([]);
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<MoveTarget | null>(null);

  const root = useMemo(
    () => buildTree(files, (file) => file.path, draftFolders),
    [files, draftFolders],
  );
  const rows = useMemo(() => flatten(root, collapsed), [root, collapsed]);
  const folders = useMemo(() => collectFolders(root), [root]);
  const folderPaths = folders.map((folder) => folder.path);
  // Only a folder that holds something opens and closes, as in `isExpandable`.
  const openableFolderPaths = folders
    .filter((folder) => folder.children.length > 0)
    .map((folder) => folder.path);

  const focusedRow = rows.find((row) => rowKey(row) === focusedKey);
  const targetFolder = atTopLevel ? '' : folderOfRow(focusedRow);

  const setFocusedKey = (key: string): void => {
    setFocusedKeyState(key);
    setAtTopLevel(false);
  };

  const expand = useCallback((path: string): void => {
    setCollapsed((current) => {
      const toOpen = [...foldersOf(path), path];
      if (!toOpen.some((folder) => current.has(folder))) return current;
      const next = new Set(current);
      toOpen.forEach((folder) => next.delete(folder));
      return next;
    });
  }, []);

  const collapse = useCallback((path: string): void => {
    setCollapsed((current) => new Set(current).add(path));
  }, []);

  const toggle = (path: string): void =>
    collapsed.has(path) ? expand(path) : collapse(path);

  const anyExpanded = openableFolderPaths.some((path) => !collapsed.has(path));

  const toggleAll = (): void =>
    setCollapsed(anyExpanded ? new Set(openableFolderPaths) : new Set());

  const removeDraftFolder = (path: string): void =>
    setDraftFolders((current) =>
      current.filter((folder) => !isInFolder(folder, path)),
    );

  const startCreating = (): void => {
    const parent = targetFolder;
    if (parent) expand(parent);
    setRenaming(null);
    setCreatingIn(parent);
  };

  const cancelCreating = (): void => setCreatingIn(null);

  /**
   * Creates the folder the user typed under the folder they started from; `a/b/c` creates the
   * whole chain.
   *
   * @returns The rule the name breaks, or `null` once the folder is created.
   */
  const createFolder = (raw: string): NameError | null => {
    const name = normalisePath(raw);
    if (!name || creatingIn === null) return 'invalid';

    const path = joinPath(creatingIn, name);
    const pathError = validateFolderPath(path);
    if (pathError) return pathError;

    const key = path.toLowerCase();
    if (folderPaths.some((folder) => folder.toLowerCase() === key))
      return 'folderAlreadyExists';

    if (reservedFor(files, path)) return 'reserved';
    const filePaths = new Set(
      [...files.map((file) => file.path), ...reservedPaths(files)].map(
        (filePath) => filePath.toLowerCase(),
      ),
    );
    if ([...foldersOf(key), key].some((folder) => filePaths.has(folder)))
      return 'fileFolderClash';

    setDraftFolders((current) => [...current, path]);
    expand(path);
    setFocusedKey(`folder:${path}`);
    setCreatingIn(null);
    return null;
  };

  const startRenaming = (target: MoveTarget): void => {
    setCreatingIn(null);
    setRenaming(target);
  };

  const cancelRenaming = (): void => setRenaming(null);

  const movePath = (path: string, from: string, to: string): string =>
    isInFolder(path, from) ? to + path.slice(from.length) : path;

  /**
   * Checks the new name of the row being renamed, which stays in its folder, and ends the renaming
   * when it is valid. The caller then moves the files to their new paths: the file, or every file
   * in the folder. A name can't be the path of another file or folder, even one marked for deletion,
   * nor one reserved for another moved file. A moved file can go back to its own.
   */
  const submitRename = (raw: string): MoveResult => {
    if (!renaming) return { error: 'invalid' };
    const { kind, path: from } = renaming;
    const name = normalisePath(raw);
    if (!name || name.includes('/')) return { error: 'invalid' };

    const to = joinPath(dirname(from), name);
    if (to === from) {
      setRenaming(null);
      return { moves: [] };
    }

    const moved = files.filter((file) => isInFolder(file.path, from));
    const unmoved = files.filter((file) => !isInFolder(file.path, from));
    const others = [
      ...unmoved.map((file) => file.path),
      ...reservedPaths(unmoved),
    ];
    const moves = moved.map((file) => ({
      from: file.path,
      to: movePath(file.path, from, to),
    }));
    const takesReserved = moves.some((move) => {
      const owner = reservedFor(files, move.to);
      return owner !== undefined && owner.path !== move.from;
    });

    const key = to.toLowerCase();
    let error: NameError | null;
    if (kind === 'file') {
      error =
        validatePath(to) ??
        (takesReserved ? 'reserved' : null) ??
        validatePaths([to], others);
    } else {
      error =
        validateFolderPath(to) ??
        moves.map((move) => validatePath(move.to)).find(Boolean) ??
        (takesReserved ? 'reserved' : null) ??
        (folderPaths.some(
          (folder) => folder !== from && folder.toLowerCase() === key,
        )
          ? 'folderAlreadyExists'
          : null) ??
        (others.some((path) => path.toLowerCase() === key)
          ? 'fileFolderClash'
          : validatePaths(
              moves.map((move) => move.to),
              others,
            ));
    }
    if (error) return { error };

    if (kind === 'folder') {
      setDraftFolders((current) =>
        current.map((folder) => movePath(folder, from, to)),
      );
      setCollapsed(
        (current) =>
          new Set([...current].map((folder) => movePath(folder, from, to))),
      );
    }
    if (focusedKey === `${kind}:${from}`) setFocusedKeyState(`${kind}:${to}`);
    setRenaming(null);
    return { moves };
  };

  return {
    root,
    rows,
    isCollapsed: (path: string): boolean => collapsed.has(path),
    expand,
    collapse,
    toggle,
    anyExpanded,
    hasOpenableFolders: openableFolderPaths.length > 0,
    toggleAll,
    focusedKey,
    setFocusedKey,
    focusedRow,
    targetFolder,
    targetTopLevel: (): void => setAtTopLevel(true),
    removeDraftFolder,
    creatingIn,
    startCreating,
    cancelCreating,
    createFolder,
    renaming,
    startRenaming,
    cancelRenaming,
    submitRename,
  };
};

export default useFileTree;
