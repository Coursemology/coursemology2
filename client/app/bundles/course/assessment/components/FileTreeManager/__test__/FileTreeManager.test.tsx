/* eslint-disable sonarjs/no-duplicate-string */
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen, waitFor, within } from 'test-utils';

import {
  DraftFileTreeManagerProps,
  FileTreeEntry,
  ImmediateFileTreeManagerProps,
} from '../types';
import FileTreeManager from '..';

// A row's delete button, which is labelled "Delete" alone: the row says what it deletes.
const rowNamed = (name: string): HTMLElement =>
  screen.getByRole('treeitem', {
    name: (label) => label === name || label.startsWith(`${name}, `),
  });
const deleteButtonOf = (name: string): HTMLElement =>
  within(rowNamed(name)).getByRole('button', { name: 'Delete' });
const queryDeleteButtonOf = (name: string): HTMLElement | null =>
  within(rowNamed(name)).queryByRole('button', { name: 'Delete' });
// A row's rename button, labelled "Rename" alone for the same reason.
const renameButtonOf = (name: string): HTMLElement =>
  within(rowNamed(name)).getByRole('button', { name: 'Rename' });
const queryRenameButtonOf = (name: string): HTMLElement | null =>
  within(rowNamed(name)).queryByRole('button', { name: 'Rename' });
// The confirmation's Delete button, as opposed to the rows'.
const confirmDeleteButton = async (): Promise<HTMLElement> =>
  within(await screen.findByRole('dialog')).getByRole('button', {
    name: 'Delete',
  });

const entry = (
  path: string,
  state: FileTreeEntry['state'] = 'saved',
  size = 10,
): FileTreeEntry => ({ path, state, size });

const SAVED = [
  entry('app.py'),
  entry('templates/index.html'),
  entry('templates/partials/nav.html'),
];

type DraftOptions = Partial<
  Omit<DraftFileTreeManagerProps, 'commit' | 'files'>
>;

// A file in the harness: a replacement remembers the saved file it replaces, as the form does.
type HarnessEntry = FileTreeEntry & { original?: FileTreeEntry };

// Holds the files as the question form would: deleting marks a saved file and drops a draft, and an
// upload replaces the file at its path.
const DraftHarness = (
  props: DraftOptions & { initial: FileTreeEntry[] },
): JSX.Element => {
  const { initial, ...flags } = props;
  const [files, setFiles] = useState<HarnessEntry[]>(initial);

  return (
    <FileTreeManager
      commit="draft"
      files={files}
      onAdd={(uploads): void =>
        setFiles((current) => {
          const next = [...current];
          uploads.forEach(({ path, file, replaces }) => {
            const index = next.findIndex(
              (candidate) => candidate.path === replaces,
            );
            if (index < 0) {
              next.push(entry(path, 'draft', file.size));
              return;
            }
            const existing = next[index];
            next[index] =
              existing.state === 'draft'
                ? entry(path, 'draft', file.size)
                : {
                    ...entry(path, 'replaced', file.size),
                    original: existing.original ?? {
                      ...existing,
                      state: 'saved',
                    },
                  };
          });
          return next;
        })
      }
      onDelete={(paths): void =>
        setFiles((current) =>
          current.flatMap((file) => {
            if (!paths.includes(file.path)) return [file];
            if (file.original) return [{ ...file.original, state: 'marked' }];
            return file.state === 'draft' ? [] : [{ ...file, state: 'marked' }];
          }),
        )
      }
      onMove={(moves): void =>
        setFiles((current) =>
          current.map((file) => {
            const move = moves.find(({ from }) => from === file.path);
            if (!move || file.state === 'marked') return file;
            if (file.state === 'draft' || file.state === 'replaced')
              return { ...file, path: move.to };

            // A saved file remembers its saved path, and is saved again if it gets it back.
            const saved = file.previousPath ?? file.path;
            return move.to === saved
              ? {
                  ...file,
                  path: saved,
                  state: 'saved',
                  previousPath: undefined,
                }
              : {
                  ...file,
                  path: move.to,
                  state: 'moved',
                  previousPath: saved,
                };
          }),
        )
      }
      onRestore={(paths): void =>
        setFiles((current) =>
          current.map((file) => {
            if (!paths.includes(file.path)) return file;
            if (file.original) return file.original;
            return {
              ...file,
              path: file.previousPath ?? file.path,
              state: 'saved',
              previousPath: undefined,
            };
          }),
        )
      }
      {...flags}
    />
  );
};

const renderDraft = async (
  options: DraftOptions & { initial?: FileTreeEntry[] } = {},
): Promise<HTMLElement> => {
  const { initial = SAVED, ...flags } = options;
  render(<DraftHarness initial={initial} {...flags} />);
  return screen.findByRole('tree');
};

const renderImmediate = async (
  props: Partial<ImmediateFileTreeManagerProps> = {},
): Promise<HTMLElement> => {
  render(<FileTreeManager commit="immediate" files={SAVED} {...props} />);
  return screen.findByRole('tree');
};

const row = (name: RegExp | string): HTMLElement =>
  screen.getByRole('treeitem', { name });

const rowNames = (): string[] =>
  screen
    .getAllByRole('treeitem')
    .map((item) => item.getAttribute('aria-label') ?? '');

const upload = (input: HTMLElement, ...files: File[]): void => {
  fireEvent.change(input, { target: { files } });
};

// Drags a row over another element and drops it there. Returns whether the tree allowed the drop,
// by the drop effect it set; a browser drops nothing where it is `none`, but it is dropped here
// anyway, so the tree must ignore it too.
const drag = (source: HTMLElement, target: HTMLElement): boolean => {
  const dataTransfer = {
    setData: jest.fn(),
    types: [],
    effectAllowed: 'all',
    // As a browser starts a drag that may only move, so a target that can't take it must say so.
    dropEffect: 'move',
  };
  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  const allowed = dataTransfer.dropEffect === 'move';
  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(source, { dataTransfer });
  return allowed;
};

// Off the rows, where a drop goes to the top level.
const offTheRows = (): HTMLElement => screen.getByRole('tree').parentElement!;

describe('FileTreeManager', () => {
  describe('the tree', () => {
    it('shows folders before files, nested by path, with tree semantics', async () => {
      await renderDraft();

      expect(rowNames()).toEqual([
        'templates',
        'partials',
        'nav.html',
        'index.html',
        'app.py',
      ]);
      expect(row('templates')).toHaveAttribute('aria-level', '1');
      expect(row('templates')).toHaveAttribute('aria-expanded', 'true');
      expect(row('nav.html')).toHaveAttribute('aria-level', '3');
      expect(row('nav.html')).not.toHaveAttribute('aria-expanded');
    });

    it('is one tab stop', async () => {
      await renderDraft();

      const tabbable = screen
        .getAllByRole('treeitem')
        .filter((item) => item.tabIndex === 0);
      expect(tabbable).toEqual([row('templates')]);
    });

    it('collapses and expands a folder, and collapses all at once', async () => {
      const user = userEvent.setup();
      await renderDraft();

      await user.click(screen.getByLabelText('Collapse templates'));
      expect(rowNames()).toEqual(['templates', 'app.py']);

      await user.click(screen.getByLabelText('Expand templates'));
      await user.click(screen.getByRole('button', { name: 'Collapse all' }));
      expect(rowNames()).toEqual(['templates', 'app.py']);
    });

    it('summarises each folder and the whole tree', async () => {
      await renderDraft();

      expect(
        within(row('templates')).getByText('2 files · 20 bytes'),
      ).toBeVisible();
      expect(screen.getByText('3 files · 30 bytes')).toBeVisible();
    });
  });

  describe('feature flags', () => {
    it('shows no actions when every flag is off', async () => {
      await renderImmediate();

      expect(
        screen.queryByRole('button', { name: 'Add files' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'New folder' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/^Delete/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/^Download/)).not.toBeInTheDocument();
    });

    it('fits a sidebar when compact: no size column, and icon buttons with the same names', async () => {
      await renderImmediate({
        compact: true,
        uploadable: true,
        canCreateFolder: true,
      });

      expect(screen.queryByText('Size')).not.toBeInTheDocument();
      expect(screen.queryByText('10 bytes')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add files' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'New folder' })).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Collapse all' }),
      ).toBeVisible();
      expect(screen.getByTitle('app.py · 10 bytes')).toBeInTheDocument();
      expect(screen.getByText('3 files · 30 bytes')).toBeVisible();
    });

    it('shows delete on files only, or on folders only', async () => {
      const { unmount } = render(
        <FileTreeManager commit="immediate" files={SAVED} filesDeleteable />,
      );
      await screen.findByRole('tree');
      expect(deleteButtonOf('app.py')).toBeInTheDocument();
      expect(queryDeleteButtonOf('templates')).not.toBeInTheDocument();
      unmount();

      await renderImmediate({ foldersDeleteable: true });
      expect(deleteButtonOf('templates')).toBeInTheDocument();
      expect(queryDeleteButtonOf('app.py')).not.toBeInTheDocument();
    });

    it('selects a file when selectable', async () => {
      const onSelect = jest.fn();
      const user = userEvent.setup();
      await renderImmediate({
        selectable: true,
        selectedPath: 'app.py',
        onSelect,
      });

      expect(row('app.py')).toHaveAttribute('aria-selected', 'true');
      await user.click(row('index.html'));
      expect(onSelect).toHaveBeenCalledWith('templates/index.html');
    });

    it('downloads a file when downloadable', async () => {
      const onDownload = jest.fn();
      const user = userEvent.setup();
      await renderImmediate({ downloadable: true, onDownload });

      await user.click(screen.getByLabelText('Download nav.html'));
      expect(onDownload).toHaveBeenCalledWith('templates/partials/nav.html');
    });
  });

  describe('in draft mode', () => {
    it('adds files under the focused folder, badged as new', async () => {
      const user = userEvent.setup();
      await renderDraft({ uploadable: true });

      await user.click(row('partials'));
      upload(
        screen.getByTestId('file-tree-add-files'),
        new File(['x'], 'footer.html'),
      );

      expect(
        await screen.findByRole('treeitem', { name: 'footer.html, New' }),
      ).toHaveAttribute('aria-level', '3');
      expect(
        screen.getByText('4 files · 31 bytes · 1 to upload'),
      ).toBeVisible();
    });

    describe('when every file is in a folder', () => {
      const NESTED = [entry('templates/index.html')];

      // The folder new files go into is shown by its bold name.
      const isTarget = (name: string): boolean =>
        within(row(name)).getByText(name).classList.contains('font-bold');

      it('adds to the top level again after a click off the rows', async () => {
        const user = userEvent.setup();
        await renderDraft({ initial: NESTED, uploadable: true });

        await user.click(row('index.html'));
        expect(isTarget('templates')).toBe(true);

        await user.click(screen.getByText('Name'));
        expect(isTarget('templates')).toBe(false);

        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'app.py'),
        );
        expect(
          await screen.findByRole('treeitem', { name: 'app.py, New' }),
        ).toHaveAttribute('aria-level', '1');
      });

      it('adds to the top level again after Escape', async () => {
        const user = userEvent.setup();
        await renderDraft({
          initial: NESTED,
          uploadable: true,
          canCreateFolder: true,
        });

        await user.click(row('index.html'));
        await user.keyboard('{Escape}');
        expect(isTarget('templates')).toBe(false);
        expect(row('index.html')).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'New folder' }));
        await user.type(
          screen.getByLabelText('New folder name'),
          'static{Enter}',
        );
        expect(row('static')).toHaveAttribute('aria-level', '1');
      });

      it('keeps the folder when a button is clicked, and targets it again once a row in it is', async () => {
        const user = userEvent.setup();
        await renderDraft({ initial: NESTED, uploadable: true });

        await user.click(row('templates'));
        // Clicking the folder closed it.
        await user.click(screen.getByRole('button', { name: 'Expand all' }));
        expect(isTarget('templates')).toBe(true);

        await user.click(screen.getByText('Name'));
        await user.click(row('templates'));
        expect(isTarget('templates')).toBe(true);

        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'base.html'),
        );
        expect(
          await screen.findByRole('treeitem', { name: 'base.html, New' }),
        ).toHaveAttribute('aria-level', '2');
      });

      it('shows no target folder when nothing can be added', async () => {
        const user = userEvent.setup();
        await renderDraft({ initial: NESTED });

        await user.click(row('index.html'));
        expect(isTarget('templates')).toBe(false);
      });
    });

    it('rejects a file name the rules do not allow, rather than changing it', async () => {
      await renderDraft({ uploadable: true });

      upload(
        screen.getByTestId('file-tree-add-files'),
        new File(['x'], ' main.py'),
        new File(['x'], 'a\\b.py'),
      );

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(' main.py');
      expect(alert).toHaveTextContent('a\\b.py');
      expect(
        screen.queryByRole('treeitem', { name: /main\.py|b\.py/ }),
      ).not.toBeInTheDocument();
    });

    it('offers no folder upload, since a folder could hold any number of files', async () => {
      await renderDraft({ uploadable: true });

      expect(
        screen.queryByRole('button', { name: 'Upload folder' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('file-tree-upload-folder')).toBeNull();
    });

    it('takes the loose files of a drop, and turns away the files of a dropped folder', async () => {
      await renderDraft({ uploadable: true });

      const loose = new File(['x'], 'loose.py');
      const inFolder = new File(['x'], 'index.html');
      // What react-dropzone gives a file it found inside a dropped folder.
      Object.defineProperty(inFolder, 'path', { value: './site/index.html' });
      fireEvent.drop(screen.getByRole('tree').parentElement!, {
        dataTransfer: { files: [loose, inFolder], types: ['Files'] },
      });

      expect(
        await screen.findByText(/Folders cannot be uploaded/),
      ).toBeVisible();
      expect(
        await screen.findByRole('treeitem', { name: 'loose.py, New' }),
      ).toBeVisible();
      expect(
        screen.queryByRole('treeitem', { name: /index.html, New/ }),
      ).not.toBeInTheDocument();
    });

    describe('replacing files', () => {
      it('replaces a saved file without asking, and undoes it', async () => {
        const user = userEvent.setup();
        await renderDraft({ uploadable: true, filesDeleteable: true });

        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'app.py'),
        );

        expect(
          await screen.findByRole('treeitem', { name: 'app.py, To replace' }),
        ).toBeVisible();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(
          screen.getByText('3 files · 21 bytes · 1 to upload'),
        ).toBeVisible();

        await user.click(screen.getByLabelText('Restore app.py'));
        expect(row('app.py')).toBeVisible();
        expect(screen.getByText('3 files · 30 bytes')).toBeVisible();
      });

      it('replaces a saved file marked for deletion', async () => {
        await renderDraft({
          uploadable: true,
          filesDeleteable: true,
          initial: [entry('app.py', 'marked')],
        });

        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'app.py'),
        );

        expect(
          await screen.findByRole('treeitem', { name: 'app.py, To replace' }),
        ).toBeVisible();
      });

      it('replaces a new file as a new file', async () => {
        await renderDraft({
          uploadable: true,
          initial: [entry('app.py', 'draft')],
        });

        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['xyz'], 'app.py'),
        );

        expect(
          await screen.findByRole('treeitem', { name: 'app.py, New' }),
        ).toBeVisible();
        expect(screen.getAllByRole('treeitem')).toHaveLength(1);
        expect(
          screen.getByText('1 file · 3 bytes · 1 to upload'),
        ).toBeVisible();
      });

      it('takes the name of an upload that differs only in case', async () => {
        await renderDraft({ uploadable: true });

        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'App.py'),
        );

        expect(
          await screen.findByRole('treeitem', { name: 'App.py, To replace' }),
        ).toBeVisible();
        expect(
          screen.queryByRole('treeitem', { name: /^app\.py/ }),
        ).not.toBeInTheDocument();
      });

      it('still rejects a file with the name of a folder, and the same name twice', async () => {
        await renderDraft({ uploadable: true });

        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'templates'),
          new File(['x'], 'ok.py'),
          new File(['x'], 'ok.py'),
        );

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(
          'templates — A file and a folder cannot have the same name.',
        );
        expect(alert).toHaveTextContent(
          'ok.py — A file or folder with this name already exists here.',
        );
        expect(row('ok.py, New')).toBeVisible();
      });
    });

    it('marks a file for deletion and restores it', async () => {
      const user = userEvent.setup();
      await renderDraft({ filesDeleteable: true });

      await user.click(deleteButtonOf('app.py'));
      expect(row('app.py, To delete')).toBeVisible();
      expect(
        screen.getByText('2 files · 20 bytes · 1 to delete'),
      ).toBeVisible();

      await user.click(screen.getByLabelText('Restore app.py'));
      expect(row('app.py')).toBeVisible();
    });

    it('marks every file in a folder, and restores them in one step', async () => {
      const user = userEvent.setup();
      await renderDraft({ foldersDeleteable: true });

      await user.click(deleteButtonOf('templates'));
      expect(row('index.html, To delete')).toBeVisible();
      expect(row('nav.html, To delete')).toBeVisible();
      expect(row('templates, To delete')).toBeVisible();

      await user.click(screen.getByLabelText('Restore folder templates'));
      expect(row('index.html')).toBeVisible();
      expect(row('nav.html')).toBeVisible();
    });

    const renameTo = async (
      user: ReturnType<typeof userEvent.setup>,
      name: string,
      newName: string,
    ): Promise<void> => {
      const field = screen.getByLabelText(`New name for ${name}`);
      await user.clear(field);
      await user.type(field, `${newName}{Enter}`);
    };

    it('renames a draft file in place', async () => {
      const user = userEvent.setup();
      await renderDraft({
        movable: true,
        initial: [entry('a.py', 'draft'), entry('b.py')],
      });

      await user.click(renameButtonOf('a.py'));
      await renameTo(user, 'a.py', 'main.py');

      expect(row('main.py, New')).toBeVisible();
    });

    it('shows a moved saved file as moved until saved, and undoes it', async () => {
      const user = userEvent.setup();
      await renderDraft({ movable: true, initial: [entry('b.py')] });

      await user.click(renameButtonOf('b.py'));
      await renameTo(user, 'b.py', 'c.py');

      expect(row('c.py, Moved')).toBeVisible();
      expect(within(row('c.py, Moved')).getByText('c.py')).toHaveAttribute(
        'title',
        'c.py, moved from b.py',
      );
      expect(screen.getByText('1 file · 10 bytes · 1 to move')).toBeVisible();

      await user.click(screen.getByLabelText('Restore c.py'));
      expect(row('b.py')).toBeVisible();
    });

    it('makes a moved file saved again when it gets its saved name back', async () => {
      const user = userEvent.setup();
      await renderDraft({ movable: true, initial: [entry('b.py')] });

      await user.click(renameButtonOf('b.py'));
      await renameTo(user, 'b.py', 'c.py');
      await user.click(renameButtonOf('c.py'));
      await renameTo(user, 'c.py', 'b.py');

      expect(row('b.py')).toBeVisible();
    });

    it('renames a file when its name is clicked', async () => {
      const user = userEvent.setup();
      await renderDraft({ movable: true, initial: [entry('b.py')] });

      await user.click(within(row('b.py')).getByText('b.py'));
      expect(screen.getByLabelText('New name for b.py')).toHaveFocus();
    });

    it('does not rename a file to be deleted or replaced', async () => {
      await renderDraft({
        movable: true,
        filesDeleteable: true,
        initial: [entry('a.py', 'marked'), entry('b.py', 'replaced')],
      });

      expect(queryRenameButtonOf('a.py')).not.toBeInTheDocument();
      expect(queryRenameButtonOf('b.py')).not.toBeInTheDocument();
    });

    it('renames a folder and every file in it', async () => {
      const user = userEvent.setup();
      await renderDraft({ movable: true });

      await user.click(renameButtonOf('templates'));
      await renameTo(user, 'templates', 'views');

      expect(row('views')).toHaveAttribute('aria-level', '1');
      expect(row('index.html, Moved')).toHaveAttribute('aria-level', '2');
      expect(row('partials')).toHaveAttribute('aria-level', '2');
      expect(row('nav.html, Moved')).toHaveAttribute('aria-level', '3');
      expect(
        screen.queryByRole('treeitem', { name: 'templates' }),
      ).not.toBeInTheDocument();
    });

    it('refuses to move onto an existing folder or file, even one to be deleted', async () => {
      const user = userEvent.setup();
      await renderDraft({
        movable: true,
        initial: [...SAVED, entry('static/app.css'), entry('old.py', 'marked')],
      });

      await user.click(renameButtonOf('templates'));
      await renameTo(user, 'templates', 'Static');
      expect(screen.getByRole('alert')).toHaveTextContent(
        'This folder already exists.',
      );
      await renameTo(user, 'templates', 'app.py');
      expect(screen.getByRole('alert')).toHaveTextContent(
        'A file and a folder cannot have the same name.',
      );
      await user.keyboard('{Escape}');

      await user.click(renameButtonOf('app.py'));
      await renameTo(user, 'app.py', 'old.py');
      expect(screen.getByRole('alert')).toHaveTextContent(
        'A file or folder with this name already exists here.',
      );
    });

    it('renames the focused row with F2', async () => {
      const user = userEvent.setup();
      await renderDraft({ movable: true });

      await user.click(row('templates'));
      await user.keyboard('{F2}');

      expect(screen.getByLabelText('New name for templates')).toHaveFocus();
    });

    it('does not rename a draft file by its name while the tree is disabled', async () => {
      const user = userEvent.setup();
      await renderDraft({
        movable: true,
        disabled: true,
        initial: [entry('a.py', 'draft')],
      });

      await user.click(within(row('a.py, New')).getByText('a.py'));
      expect(
        screen.queryByLabelText('New name for a.py'),
      ).not.toBeInTheDocument();
    });

    it('keeps the rename open when the new name is taken', async () => {
      const user = userEvent.setup();
      await renderDraft({
        movable: true,
        initial: [entry('a.py', 'draft'), entry('b.py')],
      });

      await user.click(renameButtonOf('a.py'));
      const field = screen.getByLabelText('New name for a.py');
      await user.clear(field);
      await user.type(field, 'B.py{Enter}');

      expect(screen.getByRole('alert')).toHaveTextContent(
        'A file or folder with this name already exists here.',
      );
      expect(field).toBeInTheDocument();
    });

    describe('the saved path of a moved file, which stays reserved until the form is saved', () => {
      const reservedMessage =
        'A file was moved from here. Save your changes, or undo the move, before reusing this name.';

      it('turns away an upload there, so that Undo can put the file back', async () => {
        const user = userEvent.setup();
        await renderDraft({
          movable: true,
          uploadable: true,
          initial: [entry('a.csv')],
        });

        await user.click(renameButtonOf('a.csv'));
        await renameTo(user, 'a.csv', 'b.csv');
        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'A.csv'),
        );

        expect(
          await screen.findByText(/A file was moved from here/),
        ).toBeVisible();
        expect(rowNames()).toEqual(['b.csv, Moved']);

        await user.click(screen.getByLabelText('Restore b.csv'));
        expect(rowNames()).toEqual(['a.csv']);
      });

      it('refuses to move another file there, which the server would refuse', async () => {
        const user = userEvent.setup();
        await renderDraft({
          movable: true,
          initial: [entry('a.csv'), entry('b.csv')],
        });

        await user.click(renameButtonOf('a.csv'));
        await renameTo(user, 'a.csv', 'c.csv');
        await user.click(renameButtonOf('b.csv'));
        await renameTo(user, 'b.csv', 'a.csv');

        expect(screen.getByRole('alert')).toHaveTextContent(reservedMessage);
      });

      it('refuses a new folder there', async () => {
        const user = userEvent.setup();
        await renderDraft({
          movable: true,
          canCreateFolder: true,
          initial: [entry('lib')],
        });

        await user.click(renameButtonOf('lib'));
        await renameTo(user, 'lib', 'lib.py');
        await user.click(screen.getByRole('button', { name: 'New folder' }));
        await user.type(screen.getByLabelText('New folder name'), 'lib{Enter}');

        expect(screen.getByRole('alert')).toHaveTextContent(reservedMessage);
      });

      it('lets the moved file itself be replaced there', async () => {
        const user = userEvent.setup();
        await renderDraft({
          movable: true,
          uploadable: true,
          filesDeleteable: true,
          initial: [entry('a.csv')],
        });

        await user.click(renameButtonOf('a.csv'));
        await renameTo(user, 'a.csv', 'A.csv');
        upload(
          screen.getByTestId('file-tree-add-files'),
          new File(['x'], 'a.csv'),
        );

        expect(
          await screen.findByRole('treeitem', { name: /To replace/ }),
        ).toBeVisible();
      });
    });
  });

  describe('moving by dragging', () => {
    it('moves a saved file into the folder of the row it is dropped on', async () => {
      await renderDraft({ movable: true });

      expect(drag(row('app.py'), row('nav.html'))).toBe(true);

      expect(row('app.py, Moved')).toHaveAttribute('aria-level', '3');
      expect(within(row('app.py, Moved')).getByText('app.py')).toHaveAttribute(
        'title',
        'templates/partials/app.py, moved from app.py',
      );
    });

    it('moves a folder and every file in it to the top level, off the rows', async () => {
      await renderDraft({ movable: true });

      expect(drag(row('partials'), offTheRows())).toBe(true);

      expect(row('partials')).toHaveAttribute('aria-level', '1');
      expect(row('nav.html, Moved')).toHaveAttribute('aria-level', '2');
    });

    it('does not take a row into the folder it is in, or a folder into itself', async () => {
      await renderDraft({ movable: true });

      expect(drag(row('index.html'), row('templates'))).toBe(false);
      expect(drag(row('templates'), row('nav.html'))).toBe(false);
      expect(drag(row('app.py'), offTheRows())).toBe(false);
      expect(rowNames()).toEqual([
        'templates',
        'partials',
        'nav.html',
        'index.html',
        'app.py',
      ]);
    });

    it('refuses to move onto the path of another file, even one to be deleted', async () => {
      await renderDraft({
        movable: true,
        initial: [...SAVED, entry('templates/app.py', 'marked')],
      });

      drag(row('app.py'), row('templates'));

      expect(await screen.findByText('app.py was not moved:')).toBeVisible();
      expect(
        screen.getByText(
          'A file or folder with this name already exists here.',
        ),
      ).toBeVisible();
      expect(row('app.py')).toHaveAttribute('aria-level', '1');
    });

    it('drags only rows that can be moved', async () => {
      await renderDraft({
        movable: true,
        filesDeleteable: true,
        initial: [
          entry('a.py', 'marked'),
          entry('b.py', 'replaced'),
          entry('c.py'),
        ],
      });

      expect(rowNamed('a.py')).not.toHaveAttribute('draggable');
      expect(rowNamed('b.py')).not.toHaveAttribute('draggable');
      expect(rowNamed('c.py')).toHaveAttribute('draggable', 'true');
    });

    it('refuses a row dragged from another tree', async () => {
      const onMove = jest.fn();
      render(
        <>
          <FileTreeManager
            commit="draft"
            files={[entry('a.py')]}
            movable
            onMove={onMove}
          />
          <FileTreeManager
            commit="draft"
            files={[entry('lib/b.py')]}
            movable
            onMove={onMove}
            uploadable
          />
        </>,
      );
      const [, other] = await screen.findAllByRole('tree');

      expect(
        drag(row('a.py'), within(other).getByRole('treeitem', { name: 'lib' })),
      ).toBe(false);
      expect(onMove).not.toHaveBeenCalled();
    });

    it('drags nothing when rows cannot be moved', async () => {
      await renderDraft();

      expect(row('app.py')).not.toHaveAttribute('draggable');
      expect(row('templates')).not.toHaveAttribute('draggable');
    });
  });

  describe('new folders', () => {
    const createFolder = async (name: string): Promise<void> => {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'New folder' }));
      await user.type(
        screen.getByLabelText('New folder name'),
        `${name}{Enter}`,
      );
    };

    it('creates a chain of folders under the focused folder', async () => {
      const user = userEvent.setup();
      await renderDraft({ canCreateFolder: true });

      await user.click(row('partials'));
      await createFolder('icons/svg');

      expect(row('icons')).toHaveAttribute('aria-level', '3');
      expect(row('svg')).toHaveAttribute('aria-level', '4');
      expect(
        screen.getByText('Empty folders will not be saved.'),
      ).toBeVisible();
    });

    it('rejects an invalid name', async () => {
      await renderDraft({ canCreateFolder: true });

      await createFolder('bad:name');

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Names cannot contain',
      );
    });

    it('rejects a folder that exists already', async () => {
      await renderDraft({ canCreateFolder: true });

      await createFolder('Templates');

      expect(screen.getByRole('alert')).toHaveTextContent(
        'This folder already exists.',
      );
    });

    it('rejects a folder with the name of a file', async () => {
      await renderDraft({ canCreateFolder: true });

      await createFolder('app.py');

      expect(screen.getByRole('alert')).toHaveTextContent(
        'A file and a folder cannot have the same name.',
      );
    });

    it('says the path is too long when the folders are too deep', async () => {
      await renderDraft({ canCreateFolder: true });

      await createFolder(Array(69).fill('a').join('/'));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'File path too long.',
      );
    });

    it('cancels with Escape', async () => {
      const user = userEvent.setup();
      await renderDraft({ canCreateFolder: true });

      await user.click(screen.getByRole('button', { name: 'New folder' }));
      await user.type(screen.getByLabelText('New folder name'), 'x{Escape}');

      expect(
        screen.queryByLabelText('New folder name'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('treeitem', { name: 'x' }),
      ).not.toBeInTheDocument();
    });

    it('cannot open or close an empty folder, but can a folder holding only a folder', async () => {
      const user = userEvent.setup();
      await renderDraft({ canCreateFolder: true });

      await createFolder('outer/inner');

      expect(row('inner')).not.toHaveAttribute('aria-expanded');
      expect(screen.queryByLabelText('Collapse inner')).not.toBeInTheDocument();
      expect(row('outer')).toHaveAttribute('aria-expanded', 'true');

      await user.click(row('inner'));
      await user.keyboard('{Enter}{ArrowRight}');
      expect(row('inner')).not.toHaveAttribute('aria-expanded');
    });

    it('removes an empty folder when it is deleted', async () => {
      const user = userEvent.setup();
      await renderDraft({ canCreateFolder: true });

      await createFolder('empty');
      await user.click(deleteButtonOf('empty'));

      expect(
        screen.queryByRole('treeitem', { name: 'empty' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('in immediate mode', () => {
    it('renames a folder in one call with every file in it', async () => {
      const user = userEvent.setup();
      const onMove = jest.fn(() => Promise.resolve());
      await renderImmediate({ movable: true, onMove });

      await user.click(row('templates'));
      await user.keyboard('{F2}');
      const field = screen.getByLabelText('New name for templates');
      await user.clear(field);
      await user.type(field, 'views{Enter}');

      expect(onMove).toHaveBeenCalledTimes(1);
      expect(onMove).toHaveBeenCalledWith([
        { from: 'templates/index.html', to: 'views/index.html' },
        { from: 'templates/partials/nav.html', to: 'views/partials/nav.html' },
      ]);
    });

    it('moves a dragged folder in one call with every file in it', async () => {
      const onMove = jest.fn(() => Promise.resolve());
      await renderImmediate({ movable: true, onMove });

      drag(row('partials'), offTheRows());

      expect(onMove).toHaveBeenCalledTimes(1);
      expect(onMove).toHaveBeenCalledWith([
        { from: 'templates/partials/nav.html', to: 'partials/nav.html' },
      ]);
    });

    it('opens a file when its name is clicked, rather than renaming it', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      await renderImmediate({ movable: true, selectable: true, onSelect });

      await user.click(within(row('app.py')).getByText('app.py'));

      expect(onSelect).toHaveBeenCalledWith('app.py');
      expect(
        screen.queryByLabelText('New name for app.py'),
      ).not.toBeInTheDocument();
    });

    it('asks before replacing saved files, listing their sizes before and after', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn(() => Promise.resolve());
      await renderImmediate({ uploadable: true, onAdd });

      const replacement = new File(['xyz'], 'index.html');
      const added = new File(['x'], 'new.py');
      await user.click(row('templates'));
      upload(screen.getByTestId('file-tree-add-files'), replacement, added);

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveTextContent('Replace file?');
      expect(dialog).toHaveTextContent(
        'Are you sure you want to replace this file?',
      );
      expect(within(dialog).getByRole('listitem')).toHaveTextContent(
        'templates/index.html, 10 bytes → 3 bytes',
      );
      expect(onAdd).not.toHaveBeenCalled();

      await user.click(within(dialog).getByRole('button', { name: 'Replace' }));

      expect(onAdd).toHaveBeenCalledWith([
        {
          path: 'templates/index.html',
          file: replacement,
          replaces: 'templates/index.html',
        },
        { path: 'templates/new.py', file: added, replaces: undefined },
      ]);
    });

    it('adds nothing when the replacement is cancelled', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn(() => Promise.resolve());
      await renderImmediate({ uploadable: true, onAdd });

      upload(
        screen.getByTestId('file-tree-add-files'),
        new File(['x'], 'App.py'),
        new File(['x'], 'other.py'),
      );
      const dialog = await screen.findByRole('dialog');
      const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
      // As in the other confirmations on the submission page, such as finalising.
      expect(cancel).toHaveClass('MuiButton-colorSecondary');
      await user.click(cancel);

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('asks before deleting, and shows the row as pending until the save settles', async () => {
      let finish: () => void = () => {};
      const onDelete = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
      const user = userEvent.setup();
      await renderImmediate({ filesDeleteable: true, onDelete });

      await user.click(deleteButtonOf('app.py'));
      expect(await screen.findByRole('dialog')).toHaveTextContent(
        'Delete app.py',
      );
      await user.click(await confirmDeleteButton());
      // The closing dialog hides the rest of the page until it has gone.
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );

      expect(onDelete).toHaveBeenCalledWith(['app.py']);
      expect(row('app.py')).toHaveAttribute('aria-busy', 'true');

      await act(async () => finish());
      await waitFor(() =>
        expect(row('app.py')).not.toHaveAttribute('aria-busy'),
      );
    });

    it('shows why a save failed', async () => {
      const onAdd = jest.fn(() =>
        Promise.reject(new Error('Answer too large.')),
      );
      await renderImmediate({ uploadable: true, onAdd });

      upload(
        screen.getByTestId('file-tree-add-files'),
        new File(['x'], 'b.py'),
      );

      expect(await screen.findByText('Answer too large.')).toBeVisible();
      expect(onAdd).toHaveBeenCalledWith([
        expect.objectContaining({ path: 'b.py' }),
      ]);
    });
  });

  describe('keyboard', () => {
    it('moves through rows with the arrow keys, and opens and closes folders', async () => {
      const user = userEvent.setup();
      await renderDraft();

      await user.click(row('app.py'));
      await user.keyboard('{ArrowUp}');
      expect(row('index.html')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(row('templates')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(row('templates')).toHaveAttribute('aria-expanded', 'false');

      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(row('partials')).toHaveFocus();
    });

    it('toggles a folder with Enter, and selects a file with Enter', async () => {
      const onSelect = jest.fn();
      const user = userEvent.setup();
      await renderDraft({ selectable: true, onSelect });

      await user.click(row('app.py'));
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledWith('app.py');

      await user.keyboard('{Home}{Enter}');
      expect(row('templates')).toHaveAttribute('aria-expanded', 'false');

      await user.keyboard('{Enter}');
      expect(row('templates')).toHaveAttribute('aria-expanded', 'true');
    });

    it('marks and restores the focused row with Delete', async () => {
      const user = userEvent.setup();
      await renderDraft({ filesDeleteable: true });

      await user.click(row('app.py'));
      await user.keyboard('{Delete}');
      expect(row('app.py, To delete')).toBeVisible();

      await user.keyboard('{Delete}');
      expect(row('app.py')).toBeVisible();
    });

    it('jumps to a row by typing its name', async () => {
      const user = userEvent.setup();
      await renderDraft();

      await user.click(row('templates'));
      await user.keyboard('ap');
      expect(row('app.py')).toHaveFocus();
    });
  });
});
