export const getIdFromUnknown = (id?: string | null): number | undefined =>
  parseInt(id ?? '', 10) || undefined;

export const getMailtoURLWithBody = (
  email: string,
  subject: string,
  body: string,
): string => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
};
