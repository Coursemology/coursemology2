import { forwardRef, MouseEvent, ReactNode } from 'react';
import {
  ChevronRight,
  Delete,
  Download,
  Edit,
  ExpandMore,
  Folder,
  InsertDriveFile,
  Undo,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import { formatReadableBytes } from 'utilities';

import useTranslation from 'lib/hooks/useTranslation';

import { dirname } from './paths';
import translations from './translations';
import { FileTreeNode } from './tree';
import { FileTreeEntry } from './types';
import { folderOfRow } from './useFileTree';

/** Past this depth the indent stops growing, and the name shows its folder instead. */
export const MAX_INDENTED_DEPTH = 6;

// One level is as wide as the disclosure slot (`w-7`), so a child's disclosure sits under its
// parent's icon.
const INDENT_REM = 1.75;

export const indentOf = (depth: number): string =>
  `${Math.min(depth, MAX_INDENTED_DEPTH) * INDENT_REM}rem`;

/**
 * The space before a row's icon: its indent, then a slot as wide as the disclosure button, which
 * rows without one keep empty so that every icon and name at a depth lines up.
 */
export const RowLead = (props: {
  depth: number;
  children?: ReactNode;
}): JSX.Element => (
  <>
    <div className="flex-none" style={{ width: indentOf(props.depth) }} />
    <span className="ml-2 flex h-7 w-7 flex-none items-center justify-center">
      {props.children}
    </span>
  </>
);

/** A folder can only be opened when it holds something: a file, or a folder of its own. */
export const isExpandable = (node: FileTreeNode<FileTreeEntry>): boolean =>
  node.kind === 'folder' && node.children.length > 0;

const isMarked = (entry: FileTreeEntry): boolean => entry.state === 'marked';

const totalSize = (entries: FileTreeEntry[]): number =>
  entries.reduce((sum, entry) => sum + (entry.size ?? 0), 0);

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}

// The tree is one tab stop, so its buttons are reached by mouse, and by keys on the focused row.
const ActionButton = (props: ActionButtonProps): JSX.Element => (
  <button
    aria-label={props.label}
    className={`inline-flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-transparent hover:bg-neutral-100 disabled:cursor-default disabled:opacity-40 ${props.className ?? ''}`}
    disabled={props.disabled}
    onClick={(event: MouseEvent): void => {
      event.stopPropagation();
      props.onClick();
    }}
    tabIndex={-1}
    title={props.label}
    type="button"
  >
    {props.children}
  </button>
);

const Badge = (props: {
  tone: 'new' | 'marked';
  children: string;
}): JSX.Element => (
  <Typography
    className={`ml-2 flex-none rounded-sm border border-solid px-1.5 font-semibold uppercase leading-normal tracking-wider ${
      props.tone === 'new'
        ? 'border-lime-600 bg-lime-50 text-lime-800'
        : 'border-red-200 bg-red-50 text-red-700'
    }`}
    component="span"
    variant="caption"
  >
    {props.children}
  </Typography>
);

export interface FileTreeRowProps {
  node: FileTreeNode<FileTreeEntry>;
  focused: boolean;
  expanded?: boolean;
  selected?: boolean;
  selectable?: boolean;
  dropTarget?: boolean;
  pending?: boolean;
  disabled?: boolean;
  canDelete?: boolean;
  canRename?: boolean;
  canDownload?: boolean;
  /** Leaves out the size column, for a narrow sidebar. */
  compact?: boolean;
  onFocus: () => void;
  onClick: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onRename?: () => void;
  onDownload?: () => void;
}

const FileTreeRow = forwardRef<HTMLDivElement, FileTreeRowProps>(
  (props, ref): JSX.Element => {
    const { node, focused, selected, disabled, pending, compact } = props;
    const { t } = useTranslation();

    const isFolder = node.kind === 'folder';
    const expandable = isExpandable(node);
    const expanded = expandable && Boolean(props.expanded);
    const entries = isFolder ? node.files : [node.file];
    const marked = entries.length > 0 && entries.every(isMarked);
    const draft = !isFolder && node.file.state === 'draft';

    let meta: string;
    if (isFolder) {
      const shown = marked
        ? entries
        : entries.filter((entry) => !isMarked(entry));
      meta = shown.length
        ? t(translations.folderSummary, {
            count: shown.length,
            size: formatReadableBytes(totalSize(shown)),
          })
        : t(translations.emptyFolder);
    } else {
      meta =
        node.file.size === undefined ? '' : formatReadableBytes(node.file.size);
    }

    const name = node.name;
    const prefix =
      node.depth > MAX_INDENTED_DEPTH ? `${dirname(node.path)}/` : '';

    let background = 'bg-white';
    if (marked) background = 'bg-neutral-100';
    else if (selected) background = 'bg-cyan-50';
    else if (draft) background = 'bg-lime-50';

    const labelParts = [name];
    if (draft) labelParts.push(t(translations.newBadge));
    if (marked) labelParts.push(t(translations.toDeleteBadge));

    const deleteLabel = isFolder
      ? t(translations.deleteFolder, { name })
      : t(translations.deleteFile, { name });
    const restoreLabel = isFolder
      ? t(translations.restoreFolder, { name })
      : t(translations.restoreFile, { name });

    const Icon = isFolder ? Folder : InsertDriveFile;

    return (
      <div
        ref={ref}
        aria-busy={pending || undefined}
        aria-expanded={expandable ? expanded : undefined}
        aria-label={labelParts.join(', ')}
        aria-level={node.depth + 1}
        aria-selected={props.selectable ? Boolean(selected) : undefined}
        className={`flex cursor-pointer select-none items-center border-0 border-b border-solid border-neutral-100 py-2 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${background} ${
          props.dropTarget ? 'ring-2 ring-inset ring-primary' : ''
        } ${pending ? 'opacity-50' : ''}`}
        data-drop-folder={folderOfRow(node)}
        onClick={props.onClick}
        onFocus={props.onFocus}
        role="treeitem"
        tabIndex={focused ? 0 : -1}
      >
        <RowLead depth={node.depth}>
          {expandable && (
            <button
              aria-label={
                expanded
                  ? t(translations.collapseFolder, { name })
                  : t(translations.expandFolder, { name })
              }
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-neutral-600 hover:bg-neutral-100"
              onClick={(event): void => {
                event.stopPropagation();
                props.onToggle?.();
              }}
              tabIndex={-1}
              type="button"
            >
              {expanded ? (
                <ExpandMore fontSize="small" />
              ) : (
                <ChevronRight fontSize="small" />
              )}
            </button>
          )}
        </RowLead>

        <Icon className="mr-2 flex-none text-neutral-500" fontSize="small" />

        <Typography
          className={`min-w-0 flex-initial ${
            isFolder ? 'font-medium' : 'font-normal'
          } ${marked ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}
          component="span"
          noWrap
          // Without the size column, the size is in the tooltip.
          title={compact && meta ? `${node.path} · ${meta}` : node.path}
          variant="body2"
        >
          {prefix && <span className="text-neutral-500">{prefix}</span>}
          {name}
        </Typography>

        {draft && <Badge tone="new">{t(translations.newBadge)}</Badge>}
        {marked && <Badge tone="marked">{t(translations.toDeleteBadge)}</Badge>}

        <span className="flex-auto" />

        {!compact && (
          <Typography
            className={`w-36 flex-none text-right tabular-nums ${
              marked ? 'line-through' : ''
            }`}
            color="text.secondary"
            component="span"
            noWrap
            variant="body2"
          >
            {meta}
          </Typography>
        )}

        <span
          className={`flex ${
            compact ? 'min-w-0' : 'min-w-20'
          } flex-none items-center justify-end`}
        >
          {props.canRename && draft && (
            <ActionButton
              className="text-neutral-600"
              disabled={disabled}
              label={t(translations.renameFile, { name })}
              onClick={(): void => props.onRename?.()}
            >
              <Edit fontSize="small" />
            </ActionButton>
          )}

          {props.canDownload && !isFolder && (
            <ActionButton
              className="text-neutral-600"
              disabled={disabled}
              label={t(translations.downloadFile, { name })}
              onClick={(): void => props.onDownload?.()}
            >
              <Download fontSize="small" />
            </ActionButton>
          )}

          {props.canDelete && !marked && (
            <ActionButton
              className="text-red-700"
              disabled={disabled || pending}
              label={deleteLabel}
              onClick={(): void => props.onDelete?.()}
            >
              <Delete fontSize="small" />
            </ActionButton>
          )}

          {props.canDelete && marked && props.onRestore && (
            <ActionButton
              className="text-info"
              disabled={disabled}
              label={restoreLabel}
              onClick={(): void => props.onRestore?.()}
            >
              <Undo fontSize="small" />
            </ActionButton>
          )}
        </span>
      </div>
    );
  },
);

FileTreeRow.displayName = 'FileTreeRow';

export default FileTreeRow;
