/**
 * The state of a file in draft mode: saved before, newly added, marked for deletion, or a saved file
 * an upload will replace. Draft mode shows the last three with badges; immediate mode has only saved
 * files.
 */
export type FileTreeEntryState = 'saved' | 'draft' | 'marked' | 'replaced';

export interface FileTreeEntry {
  /** Relative to the files' folder, such as `templates/index.html`. */
  path: string;
  /** In bytes. The size column shows it when given. */
  size?: number;
  state?: FileTreeEntryState;
}

/** A file the user added, and the path it will be saved under. */
export interface FileTreeUpload {
  path: string;
  file: File;
  /**
   * The path of the file this upload replaces: one at the same path, ignoring case. The upload's
   * own path is the one kept.
   */
  replaces?: string;
}

interface FileTreeManagerBaseProps {
  files: FileTreeEntry[];

  /** Clicking a file calls `onSelect`; the row of `selectedPath` is highlighted. */
  selectable?: boolean;
  selectedPath?: string;
  onSelect?: (path: string) => void;

  /** Shows a download action, which calls `onDownload`. */
  downloadable?: boolean;
  onDownload?: (path: string) => void;

  /** Shows delete on file rows. */
  filesDeleteable?: boolean;
  /** Shows delete on folder rows, which deletes every file in the folder. */
  foldersDeleteable?: boolean;

  /** Shows ADD FILES and UPLOAD FOLDER, and accepts files dropped on the tree. */
  uploadable?: boolean;
  /** Shows NEW FOLDER. An empty folder lasts only until the files are saved. */
  canCreateFolder?: boolean;

  disabled?: boolean;
  /** Drops the outer border, for use inside an accordion. */
  headless?: boolean;
  /**
   * For a narrow sidebar: no size column or column headings, shorter rows, and icon buttons in the
   * toolbar. Sizes stay in the footer and in each name's tooltip.
   */
  compact?: boolean;
  /**
   * Fills the height of its container, which must have one: the rows scroll, and the toolbar and
   * footer stay in place.
   */
  fillHeight?: boolean;
}

/**
 * Changes stay with the caller until it saves them, as in the question form. Deleting marks a saved
 * file or drops a draft, as the caller decides, and can be undone.
 */
export interface DraftFileTreeManagerProps extends FileTreeManagerBaseProps {
  commit: 'draft';
  /** Lets the user rename files that are not saved yet. */
  renamable?: boolean;
  onAdd?: (uploads: FileTreeUpload[]) => void;
  onDelete?: (paths: string[]) => void;
  onRestore?: (paths: string[]) => void;
  onRename?: (from: string, to: string) => void;
}

/**
 * Each change is saved as it is made, as in a student's answer. The callbacks return a promise; a
 * rejection's message is shown in the tree.
 */
export interface ImmediateFileTreeManagerProps
  extends FileTreeManagerBaseProps {
  commit: 'immediate';
  /** Saved files cannot be renamed: there is no API for it. */
  renamable?: false;
  onAdd?: (uploads: FileTreeUpload[]) => Promise<void>;
  onDelete?: (paths: string[]) => Promise<void>;
}

export type FileTreeManagerProps =
  | DraftFileTreeManagerProps
  | ImmediateFileTreeManagerProps;
