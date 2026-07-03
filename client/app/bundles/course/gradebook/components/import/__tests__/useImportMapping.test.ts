import { act, renderHook, waitFor } from 'test-utils';

import { previewImport } from '../../../operations';
import useImportMapping from '../useImportMapping';

jest.mock('../../../operations', () => ({
  previewImport: jest.fn(
    () => async (): Promise<Record<string, unknown>> => ({
      ok: true,
      unresolved: [],
      malformed: [],
      outOfRange: [],
      sample: [],
      conflictRows: [],
      reassignments: [],
      totalRows: 1,
      columnOrder: ['Midterm'],
    }),
  ),
}));

const mockPreviewImport = previewImport as jest.Mock;

const preloadedState = {
  gradebook: {
    categories: [],
    tabs: [],
    assessments: [
      { id: 1, title: 'Final', tabId: 1, maxGrade: 100, external: true },
    ],
    students: [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@x.com',
        externalId: 'S1',
        level: 0,
        totalXp: 0,
        levelContribution: null,
      },
      {
        id: 2,
        name: 'Bob',
        email: 'bob@x.com',
        externalId: 'S2',
        level: 0,
        totalXp: 0,
        levelContribution: null,
      },
    ],
    submissions: [],
    gamificationEnabled: false,
    weightedViewEnabled: false,
    canManageWeights: true,
    courseMaxLevel: 0,
    levelContribution: {
      enabled: false,
      formula: '',
      weight: 0,
      show: false,
      clamp: true,
    },
    capTotal: false,
  },
};

const by = (
  result: ReturnType<typeof useImportMapping>,
  header: string,
): ReturnType<typeof useImportMapping>['columns'][number] | undefined =>
  result.columns.find((c) => c.header === header);

beforeEach(() => {
  jest.useFakeTimers({ legacyFakeTimers: false });
  mockPreviewImport.mockClear();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

it('uses the first column as the identifier and lists the rest as columns', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile(
      'External ID,Name,Midterm,Final\nS1,Alice,80,90\n',
    );
  });

  expect(result.current.identifierColumn).toBe('External ID');
  expect(result.current.columns.map((c) => c.header)).toEqual([
    'Name',
    'Midterm',
    'Final',
  ]);
  expect(result.current.uploadBlock).toBeNull();
});

it('auto-detects existing / create / ignore defaults without regrouping', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile(
      'External ID,Name,Midterm,Final\nS1,Alice,80,90\n',
    );
  });

  expect(by(result.current, 'Final')).toMatchObject({
    action: 'existing',
    existingTarget: 'Final',
  });
  expect(by(result.current, 'Midterm')).toMatchObject({
    action: 'create',
    newTitle: 'Midterm',
  });
  expect(by(result.current, 'Name')).toMatchObject({ action: 'ignore' });
});

it('reports a structural upload block when the first column is not the identifier', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('Name,Midterm\nAlice,80\n');
  });

  expect(result.current.uploadBlock).toMatchObject({
    kind: 'identifierNotFirst',
  });
});

it('keeps a create column incomplete (not error) until it has a title', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Midterm\nS1,80\n');
  });
  act(() => {
    result.current.setCreateTitle('Midterm', '');
  });

  expect(by(result.current, 'Midterm')?.status).toBe('incomplete');
  expect(result.current.canPreview).toBe(false);
});

it('keeps an existing column incomplete until a component is chosen', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Quiz 1\nS1,80\n');
  });
  act(() => {
    result.current.setColumnAction('Quiz 1', 'existing');
  });

  expect(by(result.current, 'Quiz 1')).toMatchObject({
    action: 'existing',
    existingTarget: '',
    status: 'incomplete',
  });
  expect(result.current.canPreview).toBe(false);
});

it('persists create-mode edits across a round trip through another mode', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Quiz 1\nS1,80\n');
  });
  act(() => {
    result.current.setCreateTitle('Quiz 1', 'Quiz One');
    result.current.setCreateMaxGrade('Quiz 1', 25);
  });
  act(() => {
    result.current.setColumnAction('Quiz 1', 'ignore');
  });
  act(() => {
    result.current.setColumnAction('Quiz 1', 'create');
  });

  expect(by(result.current, 'Quiz 1')).toMatchObject({
    newTitle: 'Quiz One',
    newMaxGrade: 25,
  });
});

it('flags a create title that collides with an existing assessment', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Score\nS1,80\n');
  });
  act(() => {
    result.current.setCreateTitle('Score', 'Final');
  });

  expect(by(result.current, 'Score')?.error).toBe('titleCollision');
  expect(result.current.canPreview).toBe(false);
});

it('flags a non-numeric cell in an imported column', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Midterm\nS1,80\nS2,absnt\n');
  });

  expect(by(result.current, 'Midterm')?.error).toBe('nonNumeric');
  expect(by(result.current, 'Midterm')?.badCells).toEqual([
    { row: 2, value: 'absnt' },
  ]);
  expect(result.current.canPreview).toBe(false);
});

it('is not previewable until at least one column is imported', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Name\nS1,Alice\n');
  });

  expect(result.current.canPreview).toBe(false);
  expect(result.current.preview).toBeNull();
});

it('runs the debounced preview and populates preview once it resolves', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Midterm\nS1,80\n');
  });

  expect(result.current.canPreview).toBe(true);
  expect(mockPreviewImport).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(400);
  });

  await waitFor(() => expect(result.current.preview).not.toBeNull());
  expect(mockPreviewImport).toHaveBeenCalledTimes(1);
});

it('cleans up a pending preview timer on unmount', async () => {
  const { result, unmount } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Midterm\nS1,80\n');
  });
  act(() => {
    jest.advanceTimersByTime(399);
  });
  unmount();
  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(mockPreviewImport).not.toHaveBeenCalled();
});

it('blocks duplicate CSV headers that PapaParse would silently rename', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Midterm,Midterm\nS1,80,90\n');
  });
  expect(result.current.uploadBlock).toMatchObject({
    kind: 'duplicateHeaders',
    headers: ['Midterm'],
  });
});

it('blocks the upload when a CSV identifier is not a student in the course', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile('External ID,Midterm\nS1,80\nS999,90\n');
  });
  expect(result.current.uploadBlock).toEqual({
    kind: 'unknownIdentifiers',
    ids: ['S999'],
  });
  expect(result.current.canPreview).toBe(false);
});

it('buildRequest resolves target per action and excludes ignored columns', async () => {
  const { result } = await renderHook(() => useImportMapping(), {
    preloadedState,
  });
  act(() => {
    result.current.parseFile(
      'External ID,Name,Midterm,Final\nS1,Alice,80,90\n',
    );
  });
  act(() => {
    result.current.setCreateMaxGrade('Midterm', 50);
    result.current.setCreateWeight('Midterm', 10);
  });

  const request = result.current.buildRequest();
  expect(request.identifierColumn).toBe('External ID');
  expect(request.mappings).toEqual([
    {
      header: 'Midterm',
      action: 'create',
      target: 'Midterm',
      maxGrade: 50,
      weight: 10,
    },
    { header: 'Final', action: 'existing', target: 'Final' },
  ]);
});
