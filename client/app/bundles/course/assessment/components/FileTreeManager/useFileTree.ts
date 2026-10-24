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
import { FileTreeEntry } from './types';

export type NameError = PathError | PathCollectionError | 'folderAlreadyExists';

export type RenameResult = { error: NameError } | { to: string };

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
  setFocusedKey: (key: string) => void;
  focusedRow?: FileTreeNode<FileTreeEntry>;
  /** Where new files and folders go: the focused folder, or the focused file's folder. */
  targetFolder: string;
  removeDraftFolder: (path: string) => void;
  /** The folder a new folder is being named in, or `null`. */
  creatingIn: string | null;
  startCreating: () => void;
  cancelCreating: () => void;
  createFolder: (raw: string) => NameError | null;
  /** The file being renamed, or `null`. */
  renamingPath: string | null;
  startRenaming: (path: string) => void;
  cancelRenaming: () => void;
  submitRename: (from: string, raw: string) => RenameResult;
}

/**
 * The tree's UI state: which folders are collapsed, which row is focused, the empty folders the user
 * made, and the row being named. The files themselves stay with the caller.
 */
const useFileTree = (files: FileTreeEntry[]): FileTree => {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [focusedKey, setFocusedKey] = useState<string>();
  const [draftFolders, setDraftFolders] = useState<string[]>([]);
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);

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
    const parent = folderOfRow(focusedRow);
    if (parent) expand(parent);
    setRenamingPath(null);
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

    const filePaths = new Set(files.map((file) => file.path.toLowerCase()));
    if ([...foldersOf(key), key].some((folder) => filePaths.has(folder)))
      return 'fileFolderClash';

    setDraftFolders((current) => [...current, path]);
    expand(path);
    setFocusedKey(`folder:${path}`);
    setCreatingIn(null);
    return null;
  };

  const startRenaming = (path: string): void => {
    setCreatingIn(null);
    setRenamingPath(path);
  };

  const cancelRenaming = (): void => setRenamingPath(null);

  /**
   * Checks the new name of a file, which stays in its folder, and ends the renaming when it is
   * valid. The caller then renames the file to `to`.
   */
  const submitRename = (from: string, raw: string): RenameResult => {
    const name = normalisePath(raw);
    if (!name || name.includes('/')) return { error: 'invalid' };

    const to = joinPath(dirname(from), name);
    if (to === from) {
      setRenamingPath(null);
      return { to };
    }

    const error =
      validatePath(to) ??
      validatePaths(
        [to],
        files.map((file) => file.path).filter((path) => path !== from),
      );
    if (error) return { error };

    if (focusedKey === `file:${from}`) setFocusedKey(`file:${to}`);
    setRenamingPath(null);
    return { to };
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
    targetFolder: folderOfRow(focusedRow),
    removeDraftFolder,
    creatingIn,
    startCreating,
    cancelCreating,
    createFolder,
    renamingPath,
    startRenaming,
    cancelRenaming,
    submitRename,
  };
};

export default useFileTree;
