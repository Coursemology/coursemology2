// pages/QuestionPreview/renderers/__test__/TextResponse.test.tsx
import { render, screen } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import TextResponse from '../TextResponse';

const question: QuestionPreviewData = {
  id: 3,
  title: 'Explain recursion',
  defaultTitle: 'Question 1',
  description: '<p>In your own words</p>',
  staffOnlyComments: '',
  maximumGrade: 8,
  type: 'TextResponse',
  displayType: 'Text Response',
  detail: {
    hideText: false,
    isAttachmentRequired: true,
    maxAttachments: 2,
    maxAttachmentSize: null,
    isComprehension: false,
    solutions: [
      {
        solutionType: 'exact_match',
        solution: '<p>A function calling itself</p>',
        grade: 8,
        explanation: '<p>Model answer</p>',
      },
    ],
  },
};

it('renders solutions and, when attachments are allowed, the attachment line', async () => {
  render(<TextResponse question={question} />);

  expect(await screen.findByText('A function calling itself')).toBeVisible();
  expect(screen.getByText('Model answer')).toBeVisible();
  // maxAttachments > 0 → attachments-allowed line (match the chosen translation).
  expect(screen.getByText(/max number of attachments/i)).toBeVisible();
  // Content is grouped under the reused Attachment Settings / Solutions sections.
  expect(screen.getByText('Attachment Settings')).toBeVisible();
  expect(screen.getByText('Solutions')).toBeVisible();
});
