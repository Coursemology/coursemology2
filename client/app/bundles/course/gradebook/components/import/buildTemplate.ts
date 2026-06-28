import type { IdentifierMode, ImportComponent } from 'types/course/gradebook';

const csvCell = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export const identifierHeader = (mode: IdentifierMode): string =>
  mode === 'email' ? 'Email' : 'External ID';

// Header-only template: per-mode identifier header + one column per component.
export const buildTemplateCsv = (
  components: ImportComponent[],
  mode: IdentifierMode,
): string => {
  const header = [identifierHeader(mode), ...components.map((c) => c.name)]
    .map(csvCell)
    .join(',');
  return `${header}\n`;
};

// Triggers a client-side download of the template.
export const downloadTemplate = (
  components: ImportComponent[],
  mode: IdentifierMode,
): void => {
  const blob = new Blob([buildTemplateCsv(components, mode)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'external_assessments_template.csv';
  link.click();
  URL.revokeObjectURL(url);
};

// Reads an uploaded File to text (raw CSV; the server parses authoritatively).
export const readFileText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(String(reader.result));
    reader.onerror = (): void => reject(reader.error);
    reader.readAsText(file);
  });
