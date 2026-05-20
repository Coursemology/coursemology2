export const buildAssessmentColumnId = (asnId: number): string =>
  `asn-${asnId}`;

export const parseAssessmentColumnId = (colId: string): number | null => {
  const match = colId.match(/^asn-(\d+)$/);
  return match ? Number(match[1]) : null;
};
