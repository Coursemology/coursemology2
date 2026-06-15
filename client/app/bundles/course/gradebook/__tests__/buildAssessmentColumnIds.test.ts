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
});
