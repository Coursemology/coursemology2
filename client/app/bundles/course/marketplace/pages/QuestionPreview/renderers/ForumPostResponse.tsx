import { Typography } from '@mui/material';

// Reuse the forum-post editor field labels (max posts, text response) from
// course/assessment/translations.
import translations from 'course/assessment/translations';
import Section from 'lib/components/core/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';

import { QuestionPreviewData } from '../../../types';

import { RendererProps } from './types';

type ForumPostDetail = Extract<
  QuestionPreviewData['detail'],
  { maxPosts: number }
>;

const ForumPostResponse = ({ question }: RendererProps): JSX.Element => {
  const { t } = useTranslation();
  const detail = question.detail as ForumPostDetail;
  return (
    <div data-testid="renderer-ForumPostResponse">
      <Section
        subtitle={t(translations.forumPostsRequirements)}
        title={t(translations.forumPosts)}
      >
        <Typography variant="body2">
          {t(translations.maxPosts)}: {detail.maxPosts}
        </Typography>
        <Typography variant="body2">
          {t(translations.textResponse)}: {detail.hasTextResponse ? '✅' : '❌'}
        </Typography>
      </Section>
    </div>
  );
};

export default ForumPostResponse;
