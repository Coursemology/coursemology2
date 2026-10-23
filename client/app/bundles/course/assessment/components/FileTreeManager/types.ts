/**
 * The state of a file in draft mode: saved before, newly added, or marked for deletion. Draft mode
 * shows the last two with badges; immediate mode has only saved files.
 */
export type FileTreeEntryState = 'saved' | 'draft' | 'marked';

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
