import { useParams } from 'react-router-dom';
import { EditNote } from '@mui/icons-material';
import { Chip, TextField, Typography } from '@mui/material';

import assessmentTranslations from 'course/assessment/translations';
import Page from 'lib/components/core/layouts/Page';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchQuestion } from '../../operations';
import { QuestionPreviewData } from '../../types';

import ForumPostResponse from './renderers/ForumPostResponse';
import MultipleResponse from './renderers/MultipleResponse';
import Programming from './renderers/Programming';
import RubricBasedResponse from './renderers/RubricBasedResponse';
import Scribing from './renderers/Scribing';
import TextResponse from './renderers/TextResponse';
import { RendererProps } from './renderers/types';
import VoiceResponse from './renderers/VoiceResponse';

const RENDERERS: Record<string, (p: RendererProps) => JSX.Element | null> = {
  MultipleResponse,
  Programming,
  TextResponse,
  RubricBasedResponse,
  ForumPostResponse,
  VoiceResponse,
  Scribing,
};

const QuestionPreview = (): JSX.Element => {
  const { t } = useTranslation();
  const { listingId, questionId } = useParams();
  return (
    <Preload
      render={<div />}
      while={(): Promise<QuestionPreviewData> =>
        fetchQuestion(Number(listingId), Number(questionId))
      }
    >
      {(question): JSX.Element => {
        const Renderer = RENDERERS[question.type];
        return (
          <Page>
            <Section title={t(assessmentTranslations.questionDetails)}>
              <TextField
                fullWidth
                InputProps={{ readOnly: true }}
                label={t(assessmentTranslations.title)}
                value={question.title}
                variant="filled"
              />
              {question.displayType && (
                <Chip
                  className="mt-2"
                  color="info"
                  label={question.displayType}
                  size="small"
                  variant="outlined"
                />
              )}
              {question.description && (
                <Subsection title={t(assessmentTranslations.description)}>
                  <UserHTMLText html={question.description} />
                </Subsection>
              )}
              {question.staffOnlyComments && (
                <Subsection
                  startIcon={<EditNote fontSize="small" />}
                  subtitle={t(assessmentTranslations.staffOnlyCommentsHint)}
                  title={t(assessmentTranslations.staffOnlyComments)}
                >
                  <UserHTMLText html={question.staffOnlyComments} />
                </Subsection>
              )}
            </Section>

            <Section title={t(assessmentTranslations.grading)}>
              <div>
                <Typography color="text.secondary" variant="body2">
                  {t(assessmentTranslations.maximumGrade)}
                </Typography>
                <Typography>{question.maximumGrade}</Typography>
              </div>
            </Section>

            {Renderer ? <Renderer question={question} /> : null}
          </Page>
        );
      }}
    </Preload>
  );
};

export default QuestionPreview;
