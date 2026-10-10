import { render, screen } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import RubricBasedResponse from '../RubricBasedResponse';

const question: QuestionPreviewData = {
  id: 3,
  title: 'Essay',
  defaultTitle: 'Question 1',
  description: '<p>Write an essay</p>',
  staffOnlyComments: '',
  maximumGrade: 7,
  type: 'RubricBasedResponse',
  displayType: 'Rubric-Based Response',
  detail: {
    categories: [
      {
        name: 'Clarity',
        criteria: [{ grade: 5, explanation: '<p>Very clear</p>' }],
      },
      {
        name: 'Extra credit',
        criteria: [{ grade: 2, explanation: '<p>Nice touch</p>' }],
      },
    ],
  },
};

it('renders each category and its criteria', async () => {
  render(<RubricBasedResponse question={question} />);

  expect(await screen.findByText('Clarity')).toBeVisible();
  expect(screen.getByText('Extra credit')).toBeVisible();
  expect(screen.getByText('Very clear')).toBeVisible();
  expect(screen.getByText('Nice touch')).toBeVisible();
  // Categories now live under the reused "Rubric" section.
  expect(screen.getByText('Rubric')).toBeVisible();
});
