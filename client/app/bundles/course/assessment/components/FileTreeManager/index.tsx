import {
  ChangeEvent,
  ComponentProps,
  DragEvent,
  KeyboardEvent,
  ReactElement,
  useRef,
  useState,
} from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Add,
  CreateNewFolder,
  UnfoldLess,
  UnfoldMore,
} from '@mui/icons-material';
import {
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatReadableBytes } from 'utilities';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import EditableNameRow, { NAME_ERROR_MESSAGES } from './EditableNameRow';
import FileTreeRow, { isExpandable } from './FileTreeRow';
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

const TYPE_AHEAD_RESET_MS = 500;

const isMarked = (entry: FileTreeEntry): boolean => entry.state === 'marked';

const pathsOf = (node: Node): string[] =>
  node.kind === 'folder'
    ? node.files.map((entry) => entry.path)
    : [node.file.path];

interface ToolbarButtonProps {
  label: string;
  icon: ReactElement;
  onClick: () => void;
  compact?: boolean;
  disabled?: boolean;
  variant?: 'outlined' | 'text';
  color?: ComponentProps<typeof Button>['color'];
  /** Whether the full-size button shows its icon beside the label. */
  showIconWhenFull?: boolean;
}

// A labelled button, or in a compact tree an icon button whose label is its tooltip.
const ToolbarButton = (props: ToolbarButtonProps): JSX.Element => {
  const { label, icon, compact, color, showIconWhenFull = true } = props;

  if (compact)
    return (
      <Tooltip title={label}>
        {/* A disabled button fires no events, so the tooltip needs a wrapper to listen to. */}
        <span>
          <IconButton
            aria-label={label}
            color={color === 'inherit' ? 'default' : color}
            disabled={props.disabled}
            onClick={props.onClick}
            size="small"
          >
            {icon}
          </IconButton>
        </span>
      </Tooltip>
    );

  return (
    <Button
      color={color}
      disabled={props.disabled}
      onClick={props.onClick}
      size="small"
      startIcon={showIconWhenFull ? icon : undefined}
      variant={props.variant ?? 'text'}
    >
      {label}
    </Button>
  );
};

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

  const addFiles = (picked: File[], folder: string): void => {
    if (!canUpload || !picked.length) return;

    const existing = files.map((file) => file.path);
    const accepted: FileTreeUpload[] = [];
    const rejections: RejectedUpload[] = [];

    picked.forEach((file) => {
      const path = pathOfFile(file, folder);
      const error =
        validatePath(path) ??
        validatePaths(
          [path],
          [...existing, ...accepted.map((upload) => upload.path)],
        );
      if (error) rejections.push({ path, error });
      else accepted.push({ path, file });
    });

    if (rejections.length) toastRejections(rejections);
    if (!accepted.length) return;

    if (folder) tree.expand(folder);
    if (props.commit === 'draft') {
      props.onAdd?.(accepted);
    } else {
      const { onAdd } = props;
      if (onAdd)
        runImmediately(
          accepted.map((upload) => upload.path),
          () => onAdd(accepted),
        );
    }
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
      .filter(isMarked)
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
  const draftCount = files.filter((file) => file.state === 'draft').length;
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
        />,
      );
    }

    if (node.kind === 'folder' && tree.creatingIn === node.path)
      elements.push(newFolderRow(node.depth + 1));

    return elements;
  };

  const hasRows = tree.rows.length > 0 || tree.creatingIn !== null;
  const hasEmptyFolder = tree.rows.some(
    (row) => row.kind === 'folder' && row.files.length === 0,
  );

  return (
    <section
      className={`${compact ? 'space-y-2' : 'space-y-4'} ${
        fillHeight ? 'flex h-full flex-col' : ''
      }`}
    >
      {(props.uploadable ||
        props.canCreateFolder ||
        tree.hasOpenableFolders) && (
        <div
          className={`flex flex-none flex-wrap items-center justify-between ${
            compact ? 'gap-1' : 'gap-3'
          }`}
        >
          <div
            className={`flex flex-wrap items-center ${
              compact ? 'gap-1' : 'gap-3'
            }`}
          >
            {props.uploadable && (
              <>
                <ToolbarButton
                  compact={compact}
                  disabled={!canUpload}
                  icon={<Add />}
                  label={t(translations.addFiles)}
                  onClick={(): void => fileInput.current?.click()}
                  variant="outlined"
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
                compact={compact}
                disabled={locked}
                icon={<CreateNewFolder />}
                label={t(translations.newFolder)}
                onClick={tree.startCreating}
                variant="outlined"
              />
            )}
          </div>

          {tree.hasOpenableFolders && (
            <ToolbarButton
              color="info"
              compact={compact}
              icon={tree.anyExpanded ? <UnfoldLess /> : <UnfoldMore />}
              label={
                tree.anyExpanded
                  ? t(translations.collapseAll)
                  : t(translations.expandAll)
              }
              onClick={tree.toggleAll}
              showIconWhenFull={false}
            />
          )}
        </div>
      )}

      <div
        {...getRootProps({
          onDragOver: (event: DragEvent<HTMLElement>) =>
            setDropFolder(folderAtEvent(event.target) ?? ''),
        })}
        className={`overflow-hidden ${
          fillHeight ? 'flex min-h-0 flex-1 flex-col' : ''
        } ${
          props.headless
            ? ''
            : 'rounded-md border border-solid border-neutral-200'
        } ${
          isDragActive && canUpload && dropFolder === ''
            ? 'ring-2 ring-primary'
            : ''
        }`}
      >
        {busy && <LinearProgress />}

        {hasRows && !compact && (
          <div className="flex h-8 items-center border-0 border-b border-solid border-neutral-200 bg-neutral-50 pl-4 pr-2">
            <Typography
              className="flex-auto font-semibold uppercase tracking-wider"
              color="text.secondary"
              variant="caption"
            >
              {t(translations.name)}
            </Typography>
            <Typography
              className="w-36 flex-none text-right font-semibold uppercase tracking-wider"
              color="text.secondary"
              variant="caption"
            >
              {t(translations.size)}
            </Typography>
            <span className="min-w-20 flex-none" />
          </div>
        )}

        {/* When the tree fills its container's height, the rows scroll and the footer stays put. */}
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

          {!hasRows && (
            <Typography
              className="px-4 py-6 text-center"
              color="text.secondary"
              variant="body2"
            >
              {t(translations.noFiles)}
            </Typography>
          )}
        </div>

        {/* A caption is inline, so the footer band renders it as a div. */}
        {files.length > 0 && (
          <Typography
            className="flex-none border-0 border-t border-solid border-neutral-200 bg-neutral-50 px-4 py-3"
            color="text.secondary"
            component="div"
            variant="caption"
          >
            {summary.join(' · ')}
          </Typography>
        )}
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
        onClickPrimary={confirmDelete}
        onClose={(): void => setConfirmingDelete(null)}
        open={confirmingDelete !== null}
        primaryColor="error"
        primaryLabel={t(translations.delete)}
        title={t(translations.deleteConfirmationTitle)}
      >
        <PromptText>
          {t(translations.deleteConfirmation, {
            path: confirmingDelete?.path ?? '',
          })}
        </PromptText>
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
