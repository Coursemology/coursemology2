import { FC, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import {
  RubricAnswerGradingContextData,
  RubricGradingContextData,
} from 'types/course/rubrics';

import assessmentTranslations from 'course/assessment/translations';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Subsection from 'lib/components/core/layouts/Subsection';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import { useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { fetchAnswerGradingContexts } from './operations/answers';
import ContextHeading from './ContextHeading';
import translations from './translations';

interface Props {
  open: boolean;
  onClose: () => void;
  gradingContexts: RubricGradingContextData[];
  answerId?: number;
}

// Read-only counterpart of MockAnswerPrompt for a real student answer: the answer text and each grading
// context are shown as-is, the latter resolved from the actual submission. No name field, no save.
const ViewAnswerPrompt: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { open, onClose, gradingContexts, answerId } = props;

  const answer = useAppSelector((state) =>
    answerId !== undefined
      ? state.assessments.question.rubrics.answers[answerId]
      : undefined,
  );

  // null while the resolved contexts are still loading for the current answer. Each entry is self-contained
  // (heading fields + resolved content), so we render it directly without pairing against another list.
  const [resolvedContexts, setResolvedContexts] = useState<
    RubricAnswerGradingContextData[] | null
  >(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!open || answerId === undefined) return;
    setResolvedContexts(null);
    setHasError(false);
    fetchAnswerGradingContexts(answerId)
      .then(setResolvedContexts)
      .catch(() => {
        // Leave the error behind (renders an inline message instead of an endless loader).
        setHasError(true);
        toast.error(t(translations.loadAnswerContextsFailure));
      });
  }, [open, answerId]);

  const renderGradingContexts = (): JSX.Element | JSX.Element[] => {
    if (hasError) {
      return (
        <Typography color="error" variant="body2">
          {t(translations.loadAnswerContextsFailure)}
        </Typography>
      );
    }
    if (resolvedContexts === null) return <LoadingIndicator />;

    return resolvedContexts.map((context) => (
      <div key={context.id} className="space-y-1">
        <ContextHeading {...context} />
        <div className="min-h-24 whitespace-pre-wrap rounded font-mono border border-solid border-neutral-400 p-2 text-[13px]">
          {context.content || (
            <span className="italic text-neutral-500">
              {t(translations.emptyGradingContext)}
            </span>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Prompt
      cancelLabel={t(formTranslations.close)}
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={t(translations.answerByStudent, { name: answer?.title ?? '' })}
    >
      <div className="space-y-6">
        <Subsection title={t(translations.answer)}>
          <UserHTMLText
            className="whitespace-normal rounded border border-solid border-neutral-400 p-2 text-[13px]"
            html={answer?.answerText ?? ''}
          />
        </Subsection>

        {gradingContexts.length > 0 && (
          <Subsection title={t(assessmentTranslations.gradingContext)}>
            {renderGradingContexts()}
          </Subsection>
        )}
      </div>
    </Prompt>
  );
};

export default ViewAnswerPrompt;
