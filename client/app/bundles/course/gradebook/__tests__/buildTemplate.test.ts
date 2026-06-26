import { buildTemplateCsv } from '../components/import/buildTemplate';

describe('buildTemplateCsv', () => {
  it('builds a header of Identifier + component names in order', () => {
    const csv = buildTemplateCsv([
      { name: 'Midterm', weightage: 30, maximumGrade: 50 },
      { name: 'Final', weightage: 50, maximumGrade: 100 },
    ]);
    expect(csv.split('\n')[0]).toBe('Identifier,Midterm,Final');
  });

  it('quotes a component name containing a comma', () => {
    const csv = buildTemplateCsv([
      { name: 'Lab, week 1', weightage: 10, maximumGrade: 20 },
    ]);
    expect(csv.split('\n')[0]).toBe('Identifier,"Lab, week 1"');
  });

  it('returns "Identifier\\n" for empty components array', () => {
    expect(buildTemplateCsv([])).toBe('Identifier\n');
  });

  it('quotes a component name containing a double-quote', () => {
    const csv = buildTemplateCsv([
      { name: 'My "Best" Quiz', weightage: 10, maximumGrade: 20 },
    ]);
    expect(csv.split('\n')[0]).toBe('Identifier,"My ""Best"" Quiz"');
  });

  it('quotes a component name containing a newline', () => {
    const csv = buildTemplateCsv([
      { name: 'Lab\nWeek1', weightage: 10, maximumGrade: 20 },
    ]);
    // The quoted cell spans two lines; verify the full header row content.
    expect(csv.startsWith('Identifier,"Lab\nWeek1"')).toBe(true);
  });

  it('always ends with exactly one newline', () => {
    const csv = buildTemplateCsv([
      { name: 'A', weightage: 0, maximumGrade: 100 },
    ]);
    expect(csv.endsWith('\n')).toBe(true);
    expect(csv.split('\n')).toHaveLength(2); // header line + empty string after trailing \n
  });
});
