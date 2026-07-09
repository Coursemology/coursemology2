import { render, screen, waitFor } from 'test-utils';

import { QuestionPreviewData } from '../../../../types';
import VoiceResponse from '../VoiceResponse';

const question: QuestionPreviewData = {
  id: 3,
  title: 'Read aloud',
  defaultTitle: 'Question 1',
  description: '<p>Record yourself</p>',
  staffOnlyComments: '',
  maximumGrade: 5,
  type: 'VoiceResponse',
  displayType: 'Voice Response',
  detail: {}, // voice carries no type-specific setup
};

it('contributes no type-specific section (prompt + grade live in the shell)', async () => {
  const { container } = render(<VoiceResponse question={question} />);

  // Wait out the I18nProvider's async loading spinner, then confirm the renderer itself added
  // nothing — voice questions are carried entirely by the shell's "Question details"/"Grading".
  // (`container` still holds provider chrome like the Toastify region, so assert on visible text.)
  await waitFor(() =>
    expect(screen.queryByTestId('CircularProgress')).not.toBeInTheDocument(),
  );
  expect(container.textContent).toBe('');
});
