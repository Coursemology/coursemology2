import { buildAssessmentColumnId } from '../components/buildAssessmentColumnIds';

describe('buildAssessmentColumnId', () => {
  it('returns the column id for an assessment', () => {
    expect(buildAssessmentColumnId(42)).toBe('asn-42');
  });

  it('works with id 1', () => {
    expect(buildAssessmentColumnId(1)).toBe('asn-1');
  });

  it('works with large ids', () => {
    expect(buildAssessmentColumnId(9999)).toBe('asn-9999');
  });
});
