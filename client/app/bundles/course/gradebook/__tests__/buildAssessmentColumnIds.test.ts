import {
  buildAssessmentColumnId,
  parseAssessmentColumnId,
} from '../components/buildAssessmentColumnIds';

describe('assessment column ids', () => {
  it('round-trips a positive (regular) assessment id', () => {
    expect(parseAssessmentColumnId(buildAssessmentColumnId(100))).toBe(100);
  });

  it('round-trips a negative (external) assessment id', () => {
    expect(parseAssessmentColumnId(buildAssessmentColumnId(-5))).toBe(-5);
  });

  it('returns null for a non-assessment column id', () => {
    expect(parseAssessmentColumnId('name')).toBeNull();
    expect(parseAssessmentColumnId('totalXp')).toBeNull();
  });

  it('round-trips a zero id (falsy but valid)', () => {
    expect(parseAssessmentColumnId(buildAssessmentColumnId(0))).toBe(0);
  });

  it('returns null for a malformed or unanchored asn- column id', () => {
    expect(parseAssessmentColumnId('asn-')).toBeNull();
    expect(parseAssessmentColumnId('asn-abc')).toBeNull();
    expect(parseAssessmentColumnId('asn-1.5')).toBeNull();
    expect(parseAssessmentColumnId('asn-12x')).toBeNull();
    expect(parseAssessmentColumnId('xasn-12')).toBeNull();
  });
});
