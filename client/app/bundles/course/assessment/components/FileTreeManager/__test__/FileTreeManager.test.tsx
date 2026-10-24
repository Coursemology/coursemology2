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

// Holds the files as the question form would: deleting marks a saved file and drops a draft.
const DraftHarness = (
  props: DraftOptions & { initial: FileTreeEntry[] },
): JSX.Element => {
  const { initial, ...flags } = props;
  const [files, setFiles] = useState(initial);

  return (
    <FileTreeManager
      commit="draft"
      files={files}
      onAdd={(uploads): void =>
        setFiles((current) => [
          ...current,
          ...uploads.map((upload) =>
            entry(upload.path, 'draft', upload.file.size),
          ),
        ])
      }
      onDelete={(paths): void =>
        setFiles((current) =>
          current.flatMap((file) => {
            if (!paths.includes(file.path)) return [file];
            return file.state === 'draft' ? [] : [{ ...file, state: 'marked' }];
          }),
        )
      }
      onRename={(from, to): void =>
        setFiles((current) =>
          current.map((file) =>
            file.path === from ? { ...file, path: to } : file,
          ),
        )
      }
      onRestore={(paths): void =>
        setFiles((current) =>
          current.map((file) =>
            paths.includes(file.path) ? { ...file, state: 'saved' } : file,
          ),
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

    it('rejects uploads that clash with existing files, and says why', async () => {
      await renderDraft({ uploadable: true });

      upload(
        screen.getByTestId('file-tree-add-files'),
        new File(['x'], 'App.py'),
        new File(['x'], 'ok.py'),
      );

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('App.py');
      expect(alert).toHaveTextContent(
        'A file or folder with this name already exists here.',
      );
      expect(row('ok.py, New')).toBeVisible();
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

    it('renames a draft file in place, but not a saved one', async () => {
      const user = userEvent.setup();
      await renderDraft({
        renamable: true,
        initial: [entry('a.py', 'draft'), entry('b.py')],
      });

      expect(screen.queryByLabelText('Rename b.py')).not.toBeInTheDocument();
      await user.click(screen.getByLabelText('Rename a.py'));
      const field = screen.getByLabelText('New name for a.py');
      await user.clear(field);
      await user.type(field, 'main.py{Enter}');

      expect(row('main.py, New')).toBeVisible();
    });

    it('renames a draft file when its name is clicked, but not a saved one', async () => {
      const user = userEvent.setup();
      await renderDraft({
        renamable: true,
        initial: [entry('a.py', 'draft'), entry('b.py')],
      });

      await user.click(within(row('b.py')).getByText('b.py'));
      expect(
        screen.queryByLabelText('New name for b.py'),
      ).not.toBeInTheDocument();

      await user.click(within(row('a.py, New')).getByText('a.py'));
      expect(screen.getByLabelText('New name for a.py')).toHaveFocus();
    });

    it('does not rename a draft file by its name while the tree is disabled', async () => {
      const user = userEvent.setup();
      await renderDraft({
        renamable: true,
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
        renamable: true,
        initial: [entry('a.py', 'draft'), entry('b.py')],
      });

      await user.click(screen.getByLabelText('Rename a.py'));
      const field = screen.getByLabelText('New name for a.py');
      await user.clear(field);
      await user.type(field, 'B.py{Enter}');

      expect(screen.getByRole('alert')).toHaveTextContent(
        'A file or folder with this name already exists here.',
      );
      expect(field).toBeInTheDocument();
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
