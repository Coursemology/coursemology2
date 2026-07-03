import type { ImportPreviewRequest } from 'types/course/gradebook';

test('ImportPreviewRequest uses identifierColumn + mappings; create carries maxGrade/weight', () => {
  const req: ImportPreviewRequest = {
    identifierMode: 'email',
    identifierColumn: 'Email',
    csvData: '',
    mappings: [
      {
        header: 'Midterm',
        action: 'create',
        target: 'Midterm',
        maxGrade: 100,
        weight: 0,
      },
    ],
  };
  expect(req.mappings[0].action).toBe('create');
  expect(req.mappings[0].maxGrade).toBe(100);
});
