import type { ImportComponent } from 'types/course/gradebook';

const csvCell = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// Header-only template: Identifier + one column per component (dialog order).
export const buildTemplateCsv = (components: ImportComponent[]): string => {
  const header = ['Identifier', ...components.map((c) => c.name)]
    .map(csvCell)
    .join(',');
  return `${header}\n`;
};

// Triggers a client-side download of the template.
export const downloadTemplate = (components: ImportComponent[]): void => {
  const blob = new Blob([buildTemplateCsv(components)], {
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
