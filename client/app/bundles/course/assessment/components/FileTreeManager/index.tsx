import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useRef,
  useState,
} from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CreateNewFolder,
  NoteAdd,
  UnfoldLess,
  UnfoldMore,
} from '@mui/icons-material';
import { IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';
import { formatReadableBytes } from 'utilities';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';
import tableTranslations from 'lib/translations/table';

import EditableNameRow, { NAME_ERROR_MESSAGES } from './EditableNameRow';
import FileTreeRow, { isExpandable, RowLead } from './FileTreeRow';
import {
  dirname,
  isFromDroppedFolder,
  pathOfFile,
  validatePath,
  validatePaths,
} from './paths';
import translations from './translations';
import { FileTreeNode } from './tree';
import { FileTreeEntry, FileTreeManagerProps, FileTreeUpload } from './types';
import useFileTree, { folderOfRow, NameError, rowKey } from './useFileTree';

type Node = FileTreeNode<FileTreeEntry>;

interface RejectedUpload {
  path: string;
  error: NameError;
}

/** Uploads that wait for the user to confirm the files they replace, in immediate mode. */
interface PendingReplacement {
  uploads: FileTreeUpload[];
  folder: string;
  replaced: { path: string; from?: number; to: number }[];
}

const TYPE_AHEAD_RESET_MS = 500;

const isMarked = (entry: FileTreeEntry): boolean => entry.state === 'marked';

/** A marked file can be kept, and a replaced one can go back to the saved file. */
const isRestorable = (entry: FileTreeEntry): boolean =>
  entry.state === 'marked' || entry.state === 'replaced';

const pathsOf = (node: Node): string[] =>
  node.kind === 'folder'
    ? node.files.map((entry) => entry.path)
    : [node.file.path];

interface ToolbarButtonProps {
  label: string;
  icon: ReactElement;
  onClick: () => void;
  disabled?: boolean;
}

// An icon button whose label is its tooltip.
const ToolbarButton = (props: ToolbarButtonProps): JSX.Element => (
  <Tooltip title={props.label}>
    {/* A disabled button fires no events, so the tooltip needs a wrapper to listen to. */}
    <span>
      <IconButton
        aria-label={props.label}
        disabled={props.disabled}
        onClick={props.onClick}
        size="small"
      >
        {props.icon}
      </IconButton>
    </span>
  </Tooltip>
);

/**
 * A file tree for the files of a programming question or answer. What the user can do is set by the
 * feature flags, and `commit` sets whether changes wait for the caller to save them or are saved as
 * they are made.
 */
const FileTreeManager = (props: FileTreeManagerProps): JSX.Element => {
  const { files, disabled } = props;
  const { t } = useTranslation();
  const tree = useFileTree(files);

  const [busy, setBusy] = useState(false);
  const [pendingPaths, setPendingPaths] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [confirmingDelete, setConfirmingDelete] = useState<Node | null>(null);
  const [pendingReplacement, setPendingReplacement] =
    useState<PendingReplacement | null>(null);
  const [dropFolder, setDropFolder] = useState<string | null>(null);

  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const fileInput = useRef<HTMLInputElement>(null);
  const typeAhead = useRef({ text: '', at: 0 });

  const isDraft = props.commit === 'draft';
  const compact = Boolean(props.compact);
  const fillHeight = Boolean(props.fillHeight);
  const locked = disabled || busy;
  const canUpload = Boolean(props.uploadable) && !locked;
  const canRename = props.commit === 'draft' && Boolean(props.renamable);
  // Whether there is anything to add, so that the folder things go into is worth showing.
  const canAddHere = Boolean(props.uploadable || props.canCreateFolder);

  // The first row is the tree's tab stop until the user focuses another.
  const tabbableKey =
    tree.focusedRow !== undefined
      ? tree.focusedKey
      : tree.rows[0] && rowKey(tree.rows[0]);

  const runImmediately = async (
    paths: string[],
    action: () => Promise<void>,
  ): Promise<void> => {
    setBusy(true);
    setPendingPaths(new Set(paths));
    try {
      await action();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : t(translations.saveFailed),
      );
    } finally {
      setBusy(false);
      setPendingPaths(new Set());
    }
  };

  // One toast lists every upload that was turned away, each with its reason. The toast's text is
  // a paragraph, so each line is a block span rather than a list.
  const toastRejections = (rejections: RejectedUpload[]): void => {
    toast.error(
      <>
        {t(translations.someFilesNotAdded, { count: rejections.length })}
        {rejections.map(({ path, error }, index) => (
          // Two rejected uploads can share a path.
          // eslint-disable-next-line react/no-array-index-key
          <span key={`${index}:${path}`} className="block break-all">
            {path} — {t(NAME_ERROR_MESSAGES[error])}
          </span>
        ))}
      </>,
    );
  };

  const commitUploads = (uploads: FileTreeUpload[], folder: string): void => {
    if (folder) tree.expand(folder);
    if (props.commit === 'draft') {
      props.onAdd?.(uploads);
      return;
    }

    const { onAdd } = props;
    if (onAdd)
      runImmediately(
        uploads.map((upload) => upload.replaces ?? upload.path),
        () => onAdd(uploads),
      );
  };

  // An upload at the path of a file in the tree, ignoring case, replaces that file under the
  // upload's path. A new file not saved yet is replaced as it is. A saved file is too in draft mode,
  // where the save confirms it; in immediate mode the user confirms first.
  const addFiles = (picked: File[], folder: string): void => {
    if (!canUpload || !picked.length) return;

    const entries = new Map(
      files.map((entry) => [entry.path.toLowerCase(), entry]),
    );
    const accepted: FileTreeUpload[] = [];
    const replaced: PendingReplacement['replaced'] = [];
    const rejections: RejectedUpload[] = [];

    picked.forEach((file) => {
      const path = pathOfFile(file, folder);
      const key = path.toLowerCase();
      const existing = entries.get(key);
      const error =
        validatePath(path) ??
        (accepted.some((upload) => upload.path.toLowerCase() === key)
          ? 'duplicate'
          : null) ??
        (existing
          ? null
          : validatePaths(
              [path],
              [
                ...files.map((entry) => entry.path),
                ...accepted.map((upload) => upload.path),
              ],
            ));
      if (error) {
        rejections.push({ path, error });
        return;
      }

      accepted.push({ path, file, replaces: existing?.path });
      const saved =
        existing && existing.state !== 'draft' && existing.state !== 'replaced';
      if (saved)
        replaced.push({
          path: existing.path,
          from: existing.size,
          to: file.size,
        });
    });

    if (rejections.length) toastRejections(rejections);
    if (!accepted.length) return;

    if (props.commit === 'immediate' && replaced.length) {
      setPendingReplacement({ uploads: accepted, folder, replaced });
      return;
    }

    commitUploads(accepted, folder);
  };

  const confirmReplacement = (): void => {
    const pending = pendingReplacement;
    setPendingReplacement(null);
    if (pending) commitUploads(pending.uploads, pending.folder);
  };

  const handlePicked = (event: ChangeEvent<HTMLInputElement>): void => {
    addFiles(Array.from(event.target.files ?? []), tree.targetFolder);
    event.target.value = '';
  };

  const deleteNode = (node: Node): void => {
    if (locked) return;

    if (node.kind === 'folder' && node.files.length === 0) {
      tree.removeDraftFolder(node.path);
      return;
    }

    if (props.commit === 'draft') {
      const paths = (node.kind === 'folder' ? node.files : [node.file])
        .filter((entry) => !isMarked(entry))
        .map((entry) => entry.path);
      if (paths.length) props.onDelete?.(paths);
      return;
    }

    setConfirmingDelete(node);
  };

  const restoreNode = (node: Node): void => {
    if (locked || props.commit !== 'draft') return;

    const paths = (node.kind === 'folder' ? node.files : [node.file])
      .filter(isRestorable)
      .map((entry) => entry.path);
    if (paths.length) props.onRestore?.(paths);
  };

  const confirmDelete = (): void => {
    const node = confirmingDelete;
    setConfirmingDelete(null);
    if (!node || props.commit !== 'immediate' || !props.onDelete) return;

    const { onDelete } = props;
    const paths = pathsOf(node);
    runImmediately(paths, () => onDelete(paths));
  };

  const canDeleteNode = (node: Node): boolean => {
    if (node.kind === 'file') return Boolean(props.filesDeleteable);
    if (node.files.length === 0) return Boolean(props.canCreateFolder);
    return Boolean(props.foldersDeleteable);
  };

  const isNodeMarked = (node: Node): boolean => {
    const entries = node.kind === 'folder' ? node.files : [node.file];
    return entries.length > 0 && entries.every(isMarked);
  };

  const focusRow = (node: Node | undefined): void => {
    if (!node) return;
    const key = rowKey(node);
    tree.setFocusedKey(key);
    rowRefs.current.get(key)?.focus();
  };

  const activate = (node: Node): void => {
    tree.setFocusedKey(rowKey(node));
    if (node.kind === 'folder') {
      if (isExpandable(node)) tree.toggle(node.path);
    } else if (props.selectable) props.onSelect?.(node.path);
  };

  const moveByTypeAhead = (key: string, from: number): void => {
    const now = Date.now();
    const state = typeAhead.current;
    state.text = now - state.at > TYPE_AHEAD_RESET_MS ? key : state.text + key;
    state.at = now;

    const query = state.text.toLowerCase();
    const ordered = [
      ...tree.rows.slice(from + 1),
      ...tree.rows.slice(0, from + 1),
    ];
    // A repeated first letter steps through the rows that start with it.
    const start =
      state.text.length === 1 ? ordered : [tree.rows[from], ...ordered];
    focusRow(start.find((row) => row?.name.toLowerCase().startsWith(query)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const index = tree.rows.findIndex((row) => rowKey(row) === tabbableKey);
    const node = tree.rows[index];
    if (!node) return;

    const isFolder = node.kind === 'folder';
    // An empty folder neither opens nor closes; the arrows move past it as past a file.
    const expandable = isExpandable(node);
    const expanded = expandable && !tree.isCollapsed(node.path);
    let handled = true;

    switch (event.key) {
      case 'ArrowDown':
        focusRow(tree.rows[index + 1]);
        break;
      case 'ArrowUp':
        focusRow(tree.rows[index - 1]);
        break;
      case 'Home':
        focusRow(tree.rows[0]);
        break;
      case 'End':
        focusRow(tree.rows[tree.rows.length - 1]);
        break;
      case 'ArrowRight':
        if (expandable && !expanded) tree.expand(node.path);
        else if (expanded && tree.rows[index + 1]?.depth > node.depth)
          focusRow(tree.rows[index + 1]);
        break;
      case 'ArrowLeft':
        if (expanded) tree.collapse(node.path);
        else
          focusRow(
            tree.rows.find(
              (row) => row.kind === 'folder' && row.path === dirname(node.path),
            ),
          );
        break;
      case 'Enter':
        if (isFolder) {
          if (expandable) tree.toggle(node.path);
        } else if (canRename && node.file.state === 'draft' && !locked)
          tree.startRenaming(node.path);
        else if (props.selectable) props.onSelect?.(node.path);
        break;
      case ' ':
        if (!isFolder && props.selectable) props.onSelect?.(node.path);
        else handled = false;
        break;
      case 'Escape':
        // As a click off the rows does, for those who can't click.
        tree.targetTopLevel();
        break;
      case 'Delete':
      case 'Backspace':
        if (!canDeleteNode(node)) handled = false;
        else if (isNodeMarked(node)) restoreNode(node);
        else deleteNode(node);
        break;
      default:
        if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        )
          moveByTypeAhead(event.key, index);
        else handled = false;
    }

    if (handled) event.preventDefault();
  };

  const folderAtEvent = (target: EventTarget | null): string | null => {
    const element = target instanceof Element ? target : null;
    const row = element?.closest('[data-drop-folder]');
    return row ? row.getAttribute('data-drop-folder') ?? '' : null;
  };

  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    disabled: !canUpload,
    onDrop: (accepted, _rejections, event) => {
      // A dropped folder could hold any number of files, so only loose files are taken.
      const loose = accepted.filter((file) => !isFromDroppedFolder(file));
      if (loose.length < accepted.length)
        toast.error(t(translations.foldersNotUploaded));

      // Files dropped on a row go to its folder; files dropped anywhere else go to the top level.
      addFiles(loose, folderAtEvent(event?.target ?? null) ?? '');
      setDropFolder(null);
    },
    onDragLeave: () => setDropFolder(null),
  });

  const liveFiles = files.filter((file) => !isMarked(file));
  const draftCount = files.filter(
    (file) => file.state === 'draft' || file.state === 'replaced',
  ).length;
  const markedCount = files.length - liveFiles.length;
  const summary = [
    t(translations.filesSummary, {
      count: liveFiles.length,
      size: formatReadableBytes(
        liveFiles.reduce((sum, file) => sum + (file.size ?? 0), 0),
      ),
    }),
  ];
  if (isDraft && draftCount)
    summary.push(t(translations.toUploadSummary, { count: draftCount }));
  if (isDraft && markedCount)
    summary.push(t(translations.toDeleteSummary, { count: markedCount }));

  const newFolderRow = (depth: number): JSX.Element => (
    <EditableNameRow
      key="new-folder"
      depth={depth}
      kind="folder"
      label={t(translations.newFolderName)}
      onCancel={tree.cancelCreating}
      onSubmit={tree.createFolder}
    />
  );

  const renderNode = (node: Node): JSX.Element[] => {
    const key = rowKey(node);
    const elements: JSX.Element[] = [];

    if (node.kind === 'file' && tree.renamingPath === node.path) {
      elements.push(
        <EditableNameRow
          key={`rename:${node.path}`}
          depth={node.depth}
          initialName={node.name}
          kind="file"
          label={t(translations.newName, { name: node.name })}
          onCancel={tree.cancelRenaming}
          onSubmit={(name): NameError | null => {
            const result = tree.submitRename(node.path, name);
            if ('error' in result) return result.error;
            if (result.to !== node.path && props.commit === 'draft')
              props.onRename?.(node.path, result.to);
            return null;
          }}
        />,
      );
    } else {
      elements.push(
        <FileTreeRow
          key={key}
          ref={(element): void => {
            if (element) rowRefs.current.set(key, element);
            else rowRefs.current.delete(key);
          }}
          canDelete={canDeleteNode(node)}
          canDownload={Boolean(props.downloadable)}
          canRename={canRename}
          compact={compact}
          disabled={locked}
          dropTarget={
            canUpload && dropFolder === folderOfRow(node) && dropFolder !== ''
          }
          expanded={node.kind === 'folder' && !tree.isCollapsed(node.path)}
          focused={key === tabbableKey}
          node={node}
          onClick={(): void => activate(node)}
          onDelete={(): void => deleteNode(node)}
          onDownload={(): void => props.onDownload?.(node.path)}
          onFocus={(): void => tree.setFocusedKey(key)}
          onRename={(): void => tree.startRenaming(node.path)}
          onRestore={isDraft ? (): void => restoreNode(node) : undefined}
          onToggle={(): void => tree.toggle(node.path)}
          pending={pathsOf(node).some((path) => pendingPaths.has(path))}
          selectable={props.selectable}
          selected={node.kind === 'file' && node.path === props.selectedPath}
          target={canAddHere && node.path === tree.targetFolder}
        />,
      );
    }

    if (node.kind === 'folder' && tree.creatingIn === node.path)
      elements.push(newFolderRow(node.depth + 1));

    return elements;
  };

  const hasEmptyFolder = tree.rows.some(
    (row) => row.kind === 'folder' && row.files.length === 0,
  );

  // The compact tree adjoins the editor: above it on a narrow screen, and to its left from `md` up,
  // so the corners that meet the editor stay square.
  let frame = '';
  if (!props.headless)
    frame = `border border-solid border-neutral-200 ${
      compact
        ? 'rounded-t-md md:rounded-bl-md md:rounded-tr-none'
        : 'rounded-md'
    }`;

  return (
    <section
      className={`${compact ? 'space-y-2' : 'space-y-4'} ${
        fillHeight ? 'flex h-full flex-col' : ''
      }`}
    >
      <div
        {...getRootProps({
          // A click off the rows and the buttons makes the top level the target, as a drop there
          // does.
          onClick: (event: MouseEvent<HTMLElement>) => {
            const element =
              event.target instanceof Element ? event.target : null;
            if (!element?.closest('[data-drop-folder], button, input'))
              tree.targetTopLevel();
          },
          onDragOver: (event: DragEvent<HTMLElement>) =>
            setDropFolder(folderAtEvent(event.target) ?? ''),
        })}
        className={`overflow-hidden ${
          fillHeight ? 'flex min-h-0 flex-1 flex-col' : ''
        } ${frame} ${
          isDragActive && canUpload && dropFolder === ''
            ? 'ring-2 ring-primary'
            : ''
        }`}
      >
        <div className="flex flex-none items-center gap-y-1 border-0 border-b border-solid border-neutral-200 bg-neutral-50 px-2 py-1">
          <div className="flex flex-wrap items-center">
            {props.uploadable && (
              <>
                <ToolbarButton
                  disabled={!canUpload}
                  icon={<NoteAdd fontSize="small" />}
                  label={t(translations.addFiles)}
                  onClick={(): void => fileInput.current?.click()}
                />
                <input
                  ref={fileInput}
                  className="hidden"
                  data-testid="file-tree-add-files"
                  multiple
                  onChange={handlePicked}
                  type="file"
                />
              </>
            )}

            {props.canCreateFolder && (
              <ToolbarButton
                disabled={locked}
                icon={<CreateNewFolder fontSize="small" />}
                label={t(translations.newFolder)}
                onClick={tree.startCreating}
              />
            )}

            {tree.hasOpenableFolders && (
              <ToolbarButton
                icon={
                  tree.anyExpanded ? (
                    <UnfoldLess fontSize="small" />
                  ) : (
                    <UnfoldMore fontSize="small" />
                  )
                }
                label={
                  tree.anyExpanded
                    ? t(translations.collapseAll)
                    : t(translations.expandAll)
                }
                onClick={tree.toggleAll}
              />
            )}
          </div>

          {/* A caption is inline, so it renders as a div to take the end of the band. */}
          {files.length > 0 && (
            <Typography
              className="ml-auto"
              color="text.secondary"
              component="div"
              variant="caption"
            >
              {summary.join(' · ')}
            </Typography>
          )}
        </div>

        {busy && <LinearProgress className="flex-none" />}

        {!compact && (
          <div className="flex py-1 flex-none items-center border-0 border-b border-solid border-neutral-200 pr-2 bg-neutral-50">
            {/* The headings line up with the icons and sizes of the rows below. */}
            <RowLead depth={0} />
            <Typography className="flex-auto font-medium" variant="body2">
              {t(tableTranslations.name)}
            </Typography>
            <Typography className="w-48 flex-none font-medium" variant="body2">
              {t(translations.size)}
            </Typography>
            <span className="min-w-20 flex-none" />
          </div>
        )}

        {/* When the tree fills its container's height, the rows scroll and the header stays put. */}
        <div className={fillHeight ? 'min-h-0 flex-1 overflow-y-auto' : ''}>
          <div
            aria-label={t(translations.files)}
            onKeyDown={handleKeyDown}
            role="tree"
            // Focusable but not a tab stop: the tab stop is the focused row inside.
            tabIndex={-1}
          >
            {tree.creatingIn === '' && newFolderRow(0)}
            {tree.rows.flatMap(renderNode)}
          </div>

          {tree.rows.length === 0 && tree.creatingIn === null && (
            <Typography
              className="px-4 py-6 text-center"
              color="text.secondary"
              variant="body2"
            >
              {t(translations.noFiles)}
            </Typography>
          )}
        </div>
      </div>

      {hasEmptyFolder && (
        <Typography
          className="flex-none"
          color="text.secondary"
          component="div"
          variant="caption"
        >
          {t(translations.emptyFolderHint)}
        </Typography>
      )}

      <Prompt
        cancelColor="secondary"
        onClickPrimary={confirmDelete}
        onClose={(): void => setConfirmingDelete(null)}
        open={confirmingDelete !== null}
        primaryColor="error"
        primaryLabel={t(formTranslations.delete)}
        title={
          confirmingDelete?.kind === 'folder'
            ? t(translations.deleteFolder, { name: confirmingDelete.name })
            : t(translations.deleteFile, { name: confirmingDelete?.name ?? '' })
        }
      >
        <PromptText>
          {t(translations.deleteConfirmation, {
            path: confirmingDelete?.path ?? '',
          })}
        </PromptText>
      </Prompt>

      <Prompt
        cancelColor="secondary"
        onClickPrimary={confirmReplacement}
        onClose={(): void => setPendingReplacement(null)}
        open={pendingReplacement !== null}
        primaryLabel={t(translations.replace)}
        title={t(translations.replaceConfirmationTitle, {
          count: pendingReplacement?.replaced.length ?? 0,
        })}
      >
        <PromptText>
          {t(translations.replaceConfirmation, {
            count: pendingReplacement?.replaced.length ?? 0,
          })}
        </PromptText>
        <ul className="mb-0 mt-3 pl-8">
          {pendingReplacement?.replaced.map(({ path, from, to }) => (
            <Typography
              key={path}
              className="break-all"
              component="li"
              variant="body2"
            >
              {t(translations.replacedFile, {
                path,
                from: from === undefined ? '?' : formatReadableBytes(from),
                to: formatReadableBytes(to),
              })}
            </Typography>
          ))}
        </ul>
      </Prompt>
    </section>
  );
};

export default FileTreeManager;
export type {
  DraftFileTreeManagerProps,
  FileTreeEntry,
  FileTreeManagerProps,
  FileTreeUpload,
  ImmediateFileTreeManagerProps,
} from './types';
