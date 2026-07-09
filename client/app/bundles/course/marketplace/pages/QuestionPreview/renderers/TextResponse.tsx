import { Chip, Typography } from '@mui/material';

// Reuse the text-response editor field labels (Attachment settings, Max attachments, Solutions,
// Grade, Explanation, Comprehension) from course/assessment/translations.
import translations from 'course/assessment/translations';
import Section from 'lib/components/core/layouts/Section';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import useTranslation from 'lib/hooks/useTranslation';

import { QuestionPreviewData } from '../../../types';

import { RendererProps } from './types';

type TextResponseDetail = Extract<
  QuestionPreviewData['detail'],
  { solutions: unknown }
>;

const TextResponse = ({ question }: RendererProps): JSX.Element => {
  const { t } = useTranslation();
  const detail = question.detail as TextResponseDetail;
  const showAttachments = detail.maxAttachments > 0;
  const showSolutions = detail.solutions.length > 0;
  // The comprehension marker rides at the top of the first rendered section so it stays inside the
  // lg=9 content column (a bare chip above the sections would misalign).
  const comprehensionChip = detail.isComprehension ? (
    <Chip
      color="info"
      label={t(translations.comprehension)}
      size="small"
      variant="outlined"
    />
  ) : null;
  return (
    <div data-testid="renderer-TextResponse">
      {showAttachments && (
        <Section title={t(translations.attachmentSettings)}>
          {comprehensionChip}
          <Typography variant="body2">
            {t(translations.maxAttachments)}: {detail.maxAttachments}
          </Typography>
        </Section>
      )}

      {showSolutions && (
        <Section title={t(translations.solutions)}>
          {!showAttachments && comprehensionChip}
          {detail.solutions.map((solution, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index}>
              <UserHTMLText html={solution.solution} />
              <Typography color="text.secondary" variant="body2">
                {t(translations.grade)}: {solution.grade}
              </Typography>
              {solution.explanation && (
                <UserHTMLText
                  className="text-neutral-500"
                  html={solution.explanation}
                />
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
};

export default TextResponse;
