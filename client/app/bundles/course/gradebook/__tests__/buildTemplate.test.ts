import {
  exampleCsv,
  identifierHeader,
  templateDataUri,
} from '../components/import/buildTemplate';

describe('identifierHeader', () => {
  it('maps mode to the concrete header', () => {
    expect(identifierHeader('external_id')).toBe('External ID');
    expect(identifierHeader('email')).toBe('Email');
  });
});

describe('exampleCsv', () => {
  it('builds the External ID template with two assessment columns', () => {
    expect(exampleCsv('external_id')).toBe(
      'External ID,Assessment 1,Assessment 2\nA0123456,85,90\nA0123457,78,88',
    );
  });

  it('builds the Email template', () => {
    expect(exampleCsv('email')).toBe(
      'Email,Assessment 1,Assessment 2\ntest1@example.com,85,90\ntest2@example.com,78,88',
    );
  });
});

describe('templateDataUri', () => {
  it('encodes the CSV (plus a trailing newline) as a text/csv data URI', () => {
    const uri = templateDataUri('external_id');
    expect(uri.startsWith('data:text/csv;charset=utf-8,')).toBe(true);
    expect(
      decodeURIComponent(uri.replace('data:text/csv;charset=utf-8,', '')),
    ).toBe(`${exampleCsv('external_id')}\n`);
  });

  it('differs between identifier modes', () => {
    expect(templateDataUri('email')).not.toBe(templateDataUri('external_id'));
  });
});
