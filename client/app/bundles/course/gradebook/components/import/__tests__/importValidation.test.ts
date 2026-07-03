import {
  classifyColumns,
  type ColumnConfig,
  detectUploadBlock,
  unknownIdentifiers,
} from '../importValidation';

const EXTERNAL_ID = 'External ID';

const existing = [
  { name: 'Final', maximumGrade: 80, weight: 20 },
  { name: 'Other', maximumGrade: 50, weight: 5 },
];

const cfg = (over: Partial<ColumnConfig>): ColumnConfig => ({
  header: 'H',
  action: 'create',
  newTitle: 'H',
  newMaxGrade: 100,
  newWeight: 0,
  existingTarget: '',
  ...over,
});

describe('classifyColumns', () => {
  it('marks an ignore column ok', () => {
    const [c] = classifyColumns([cfg({ action: 'ignore' })], [], existing);
    expect(c.status).toBe('ok');
  });

  it('marks a create column with an empty title incomplete, not error', () => {
    const [c] = classifyColumns([cfg({ newTitle: '  ' })], [], existing);
    expect(c.status).toBe('incomplete');
    expect(c.error).toBeUndefined();
  });

  it('flags a create title colliding with an existing component', () => {
    const [c] = classifyColumns([cfg({ newTitle: 'final' })], [], existing);
    expect(c.status).toBe('error');
    expect(c.error).toBe('titleCollision');
  });

  it('flags two create columns sharing a title (case-insensitive)', () => {
    const [a, b] = classifyColumns(
      [
        cfg({ header: 'A', newTitle: 'Quiz' }),
        cfg({ header: 'B', newTitle: 'quiz' }),
      ],
      [],
      existing,
    );
    expect(a.error).toBe('duplicateTitle');
    expect(b.error).toBe('duplicateTitle');
  });

  it('marks an existing column with no target incomplete', () => {
    const [c] = classifyColumns(
      [cfg({ action: 'existing', existingTarget: '' })],
      [],
      existing,
    );
    expect(c.status).toBe('incomplete');
  });

  it('marks a mapped existing column ok', () => {
    const [c] = classifyColumns(
      [cfg({ action: 'existing', existingTarget: 'Final' })],
      [],
      existing,
    );
    expect(c.status).toBe('ok');
    expect(c.error).toBeUndefined();
  });

  it('flags non-numeric cells in an imported column and records the first bad cell', () => {
    const rows = [{ H: '80' }, { H: 'absnt' }];
    const [c] = classifyColumns([cfg({})], rows, existing);
    expect(c.error).toBe('nonNumeric');
    expect(c.badCells).toEqual([{ row: 2, value: 'absnt' }]);
  });

  it('treats blank / dash / N/A as no-grade, not bad', () => {
    const rows = [{ H: '-' }, { H: 'N/A' }, { H: '' }, { H: '80' }];
    const [c] = classifyColumns([cfg({})], rows, existing);
    expect(c.status).toBe('ok');
    expect(c.badCells).toEqual([]);
  });

  it('sets hasNumericData true when a column has at least one numeric cell', () => {
    const rows = [{ H: '-' }, { H: '80' }, { H: '' }];
    const [c] = classifyColumns([cfg({ action: 'ignore' })], rows, existing);
    expect(c.hasNumericData).toBe(true);
  });

  it('sets hasNumericData false for an all-blank / no-grade column', () => {
    const rows = [{ H: '' }, { H: '-' }, { H: 'N/A' }];
    const [c] = classifyColumns([cfg({ action: 'ignore' })], rows, existing);
    expect(c.hasNumericData).toBe(false);
  });

  it('sets hasNumericData false for an all-text column', () => {
    const rows = [{ H: 'John' }, { H: 'Mary' }];
    const [c] = classifyColumns([cfg({ action: 'ignore' })], rows, existing);
    expect(c.hasNumericData).toBe(false);
  });
});

describe('detectUploadBlock', () => {
  const rows = [{ [EXTERNAL_ID]: 'S1', Midterm: '80' }];
  const roster = [{ externalId: 'S1' }];

  it('blocks an unreadable file with no headers', () => {
    expect(detectUploadBlock([], [], 'external_id', roster)).toEqual({
      kind: 'unreadable',
    });
  });

  it('blocks duplicate headers (case-insensitive)', () => {
    expect(
      detectUploadBlock(
        [EXTERNAL_ID, 'Quiz', 'quiz'],
        rows,
        'external_id',
        roster,
      ),
    ).toMatchObject({ kind: 'duplicateHeaders' });
  });

  it('accepts the identifier column in any position, not just first', () => {
    expect(
      detectUploadBlock(
        ['Name', EXTERNAL_ID, 'Midterm'],
        rows,
        'external_id',
        roster,
      ),
    ).toBeNull();
  });

  it('blocks when no column matches the identifier for the chosen mode', () => {
    expect(
      detectUploadBlock(
        ['Name', 'Student ID', 'Midterm'],
        rows,
        'external_id',
        roster,
      ),
    ).toEqual({
      kind: 'identifierMissing',
      expected: EXTERNAL_ID,
    });
  });

  it('matches the identifier header by name case-insensitively', () => {
    expect(
      detectUploadBlock(
        ['external id', 'Midterm'],
        rows,
        'external_id',
        roster,
      ),
    ).toBeNull();
    expect(
      detectUploadBlock(['Email', 'Midterm'], rows, 'email', roster),
    ).toBeNull();
  });

  it('blocks a file with only the identifier column', () => {
    expect(
      detectUploadBlock([EXTERNAL_ID], rows, 'external_id', roster),
    ).toEqual({
      kind: 'noGradeColumns',
    });
  });

  it('blocks a file with headers but zero data rows', () => {
    expect(
      detectUploadBlock([EXTERNAL_ID, 'Midterm'], [], 'external_id', roster),
    ).toEqual({
      kind: 'noDataRows',
    });
    // a trailing all-empty parsed row does not count as data
    expect(
      detectUploadBlock(
        [EXTERNAL_ID, 'Midterm'],
        [{ [EXTERNAL_ID]: '', Midterm: '' }],
        'external_id',
        roster,
      ),
    ).toEqual({ kind: 'noDataRows' });
  });

  it('returns null for a well-formed file', () => {
    expect(
      detectUploadBlock([EXTERNAL_ID, 'Midterm'], rows, 'external_id', roster),
    ).toBeNull();
  });

  it('blocks CSV identifiers with no matching student in the course', () => {
    expect(
      detectUploadBlock(
        [EXTERNAL_ID, 'Midterm'],
        [
          { [EXTERNAL_ID]: 'S1', Midterm: '80' },
          { [EXTERNAL_ID]: 'S999', Midterm: '90' },
        ],
        'external_id',
        roster,
      ),
    ).toEqual({ kind: 'unknownIdentifiers', ids: ['S999'] });
  });
});

describe('unknownIdentifiers', () => {
  const roster = [
    { externalId: 'S1', email: 'a@x.com' },
    { externalId: 'S2', email: 'b@x.com' },
  ];

  it('returns identifiers not in the roster, de-duplicated, ignoring blanks', () => {
    const rows = [
      { ID: 'S1' },
      { ID: 'S999' },
      { ID: '' },
      { ID: 'S999' },
      { ID: 'S3' },
    ];
    expect(unknownIdentifiers(rows, 'ID', 'external_id', roster)).toEqual([
      'S999',
      'S3',
    ]);
  });

  it('matches emails case-insensitively', () => {
    const rows = [{ ID: 'A@X.COM' }, { ID: 'zzz@x.com' }];
    expect(unknownIdentifiers(rows, 'ID', 'email', roster)).toEqual([
      'zzz@x.com',
    ]);
  });

  it('reports an unknown email once across differing casings', () => {
    const rows = [{ ID: 'Ghost@x.com' }, { ID: 'ghost@x.com' }];
    expect(unknownIdentifiers(rows, 'ID', 'email', roster)).toEqual([
      'Ghost@x.com',
    ]);
  });
});
