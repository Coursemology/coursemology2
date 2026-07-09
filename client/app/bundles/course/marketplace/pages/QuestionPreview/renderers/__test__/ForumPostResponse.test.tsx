import { render, screen } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import ForumPostResponse from '../ForumPostResponse';

const question: QuestionPreviewData = {
  id: 3,
  title: 'Discuss',
  defaultTitle: 'Question 1',
  description: '<p>Post in the forum</p>',
  staffOnlyComments: '',
  maximumGrade: 3,
  type: 'ForumPostResponse',
  displayType: 'Forum Post Response',
  detail: { maxPosts: 3, hasTextResponse: true },
};

it('renders the required post count and the text-response requirement', async () => {
  render(<ForumPostResponse question={question} />);

  // maxPosts is interpolated into a line → match the number within it.
  expect(await screen.findByText(/3/)).toBeVisible();
  // hasTextResponse true → the text-response-required line shows.
  expect(screen.getByText(/text response/i)).toBeVisible();
  // Requirements now live under the reused "Additional Settings" section.
  expect(screen.getByText('Additional Settings')).toBeVisible();
});
