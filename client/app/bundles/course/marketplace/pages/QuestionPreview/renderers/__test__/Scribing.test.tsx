import { render, screen, waitFor } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import Scribing from '../Scribing';

const base = {
  id: 3,
  title: 'Label the diagram',
  defaultTitle: 'Question 1',
  description: '<p>Annotate</p>',
  staffOnlyComments: '',
  maximumGrade: 4,
  type: 'Scribing',
  displayType: 'Scribing',
} as const;

it('renders the background image when imageUrl is present', async () => {
  const question: QuestionPreviewData = {
    ...base,
    detail: { imageUrl: 'https://example.test/diagram.png' },
  };
  const { container } = render(<Scribing question={question} />);

  await waitFor(() =>
    expect(container.querySelector('img')).toBeInTheDocument(),
  );
  expect(container.querySelector('img')).toHaveAttribute(
    'src',
    'https://example.test/diagram.png',
  );
});

it('renders an empty-state note when imageUrl is null', async () => {
  const question: QuestionPreviewData = { ...base, detail: { imageUrl: null } };
  render(<Scribing question={question} />);

  // No image → "not previewable" empty state (match `noPreviewImage`).
  expect(await screen.findByText(/preview/i)).toBeVisible();
});
