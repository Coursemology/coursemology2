import {
  buildTemplateCsv,
  identifierHeader,
} from '../components/import/buildTemplate';

describe('identifierHeader', () => {
  it('maps mode to the concrete header', () => {
    expect(identifierHeader('external_id')).toBe('External ID');
    expect(identifierHeader('email')).toBe('Email');
  });
});

describe('buildTemplateCsv', () => {
  const components = [{ name: 'Midterm', weightage: 30, maximumGrade: 50 }];

  it('uses the External ID header in external_id mode', () => {
    expect(buildTemplateCsv(components, 'external_id')).toBe(
      'External ID,Midterm\n',
    );
  });

  it('uses the Email header in email mode', () => {
    expect(buildTemplateCsv(components, 'email')).toBe('Email,Midterm\n');
  });

  it('quotes a component name containing a comma', () => {
    const csv = buildTemplateCsv(
      [{ name: 'Lab, week 1', weightage: 10, maximumGrade: 20 }],
      'external_id',
    );
    expect(csv.split('\n')[0]).toBe('External ID,"Lab, week 1"');
  });

  it('returns "External ID\\n" for empty components array in external_id mode', () => {
    expect(buildTemplateCsv([], 'external_id')).toBe('External ID\n');
  });

  it('quotes a component name containing a double-quote', () => {
    const csv = buildTemplateCsv(
      [{ name: 'My "Best" Quiz', weightage: 10, maximumGrade: 20 }],
      'external_id',
    );
    expect(csv.split('\n')[0]).toBe('External ID,"My ""Best"" Quiz"');
  });

  it('quotes a component name containing a newline', () => {
    const csv = buildTemplateCsv(
      [{ name: 'Lab\nWeek1', weightage: 10, maximumGrade: 20 }],
      'external_id',
    );
    // The quoted cell spans two lines; verify the full header row content.
    expect(csv.startsWith('External ID,"Lab\nWeek1"')).toBe(true);
  });

  it('always ends with exactly one newline', () => {
    const csv = buildTemplateCsv(
      [{ name: 'A', weightage: 0, maximumGrade: 100 }],
      'external_id',
    );
    expect(csv.endsWith('\n')).toBe(true);
    expect(csv.split('\n')).toHaveLength(2); // header line + empty string after trailing \n
  });

  it('emits one column per component, in input order', () => {
    const csv = buildTemplateCsv(
      [
        { name: 'Midterm', weightage: 30, maximumGrade: 50 },
        { name: 'Final', weightage: 50, maximumGrade: 100 },
        { name: 'Lab', weightage: 20, maximumGrade: 20 },
      ],
      'external_id',
    );
    expect(csv).toBe('External ID,Midterm,Final,Lab\n');
  });

  it('returns "Email\\n" for empty components array in email mode', () => {
    expect(buildTemplateCsv([], 'email')).toBe('Email\n');
  });
});
