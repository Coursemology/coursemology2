export const getIdFromUnknown = (id?: string | null): number | undefined =>
  parseInt(id ?? '', 10) || undefined;
