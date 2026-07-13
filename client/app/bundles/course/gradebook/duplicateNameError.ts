// A duplicate title fails the `uniqueness` validation on Course::ExternalAssessment,
// which the create/update controllers render as
// `{ errors: { base: '...has already been taken' } }`. Title is the only
// uniquely-validated field, so that phrase unambiguously means a name collision —
// surfaced with a dedicated toast instead of the generic save error. Shared by the
// Add and Edit external-assessment dialogs.
export const isDuplicateNameError = (error: unknown): boolean => {
  const base = (
    error as { response?: { data?: { errors?: { base?: string } } } }
  )?.response?.data?.errors?.base;
  return typeof base === 'string' && /has already been taken/i.test(base);
};
