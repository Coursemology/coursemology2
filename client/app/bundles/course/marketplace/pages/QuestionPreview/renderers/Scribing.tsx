import { Typography } from '@mui/material';

import Section from 'lib/components/core/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';

// The "cannot be previewed" empty state is marketplace-preview-specific (the cross-instance
// attachment-URL limitation); no assessment-editor label matches, so it lives in the local keys.
import translations from '../../../translations';
import { QuestionPreviewData } from '../../../types';

import { RendererProps } from './types';

type ScribingDetail = Extract<
  QuestionPreviewData['detail'],
  { imageUrl: string | null }
>;

const Scribing = ({ question }: RendererProps): JSX.Element => {
  const { t } = useTranslation();
  const detail = question.detail as ScribingDetail;
  // A scribing question has no field labels of its own — the background image (or its empty-state
  // note) is the whole content. Render it in a title-less Section so it still aligns under the lg=9
  // content column like every other section.
  return (
    <div data-testid="renderer-Scribing">
      <Section title="">
        {detail.imageUrl ? (
          <img
            alt={question.title}
            className="max-w-full"
            src={detail.imageUrl}
          />
        ) : (
          <Typography color="text.secondary" variant="body2">
            {t(translations.noPreviewImage)}
          </Typography>
        )}
      </Section>
    </div>
  );
};

export default Scribing;
