import { render, screen } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import Programming from '../Programming';

const question: QuestionPreviewData = {
  id: 3,
  title: 'Sorting in Python',
  defaultTitle: 'Question 1',
  description: '<p>Implement sort</p>',
  staffOnlyComments: '',
  maximumGrade: 10,
  type: 'Programming',
  displayType: 'Programming',
  detail: {
    languageName: 'Python 3.10',
    memoryLimit: 32,
    timeLimit: 10,
    templateFiles: [{ filename: 'main.py', content: 'print(1)' }],
    publicTestCases: [
      {
        identifier: 'pub_1',
        expression: 'sort([3,1,2])',
        expected: '[1,2,3]',
        hint: 'ascending',
      },
    ],
    privateTestCases: [
      {
        identifier: 'priv_1',
        expression: 'sort([])',
        expected: '[]',
        hint: '',
      },
    ],
    evaluationTestCases: [],
  },
};

it('renders the language, template file, and public/private test-case tables', async () => {
  render(<Programming question={question} />);

  expect(await screen.findByText('main.py')).toBeVisible();
  expect(screen.getByText('print(1)')).toBeVisible();
  expect(screen.getByText(/Python 3\.10/)).toBeVisible(); // interpolated into the summary line
  expect(screen.getByText('sort([3,1,2])')).toBeVisible(); // public bucket
  expect(screen.getByText('sort([])')).toBeVisible(); // private bucket
  // Content is grouped under the reused Templates / Test cases sections.
  expect(screen.getByText('Templates')).toBeVisible();
  expect(screen.getByText('Test cases')).toBeVisible();
});
