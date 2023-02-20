import { useState } from 'react';
import { toast } from 'react-toastify';
import { East } from '@mui/icons-material';
import { Alert, Chip, Typography } from '@mui/material';
import { McqData } from 'types/course/assessment/assessments';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

import { convertMcqMrq } from '../../../actions';
import translations from '../../../translations';

interface ConvertMcqMrqPromptProps {
  for: McqData;
  onClose: () => void;
  onConvertComplete: (data: McqData) => void;
  open: boolean;
}

const ConvertMcqMrqPrompt = (props: ConvertMcqMrqPromptProps): JSX.Element => {
  const { for: question } = props;
  const { t } = useTranslation();
  const [converting, setConverting] = useState(false);

  const convert = (unsubmit: boolean, convertUrl?: string) => () => {
    if (!convertUrl)
      throw new Error(
        `Encountered convert URL for MCQ/MRQ with ID ${
          question.id
        } is ${convertUrl?.toString()}.`,
      );

    setConverting(true);

    toast
      .promise(convertMcqMrq(convertUrl), {
        pending: unsubmit
          ? t(translations.unsubmittingAndChangingQuestionType)
          : t(translations.changingQuestionType),
        success: unsubmit
          ? t(translations.questionTypeChangedUnsubmitted)
          : t(translations.questionTypeChanged),
        error: {
          render: ({ data }) => {
            // TODO: Remove when actions.js is written in TypeScript
            const error = (data as Error)?.message;
            return error || t(translations.errorChangingQuestionType);
          },
        },
      })
      .then((data: Partial<McqData>) => {
        props.onConvertComplete({ ...question, ...data });
        props.onClose();
      })
      .finally(() => setConverting(false));
  };

  return (
    <Prompt
      contentClassName="space-y-4"
      disabled={converting}
      onClose={props.onClose}
      open={props.open}
      {...(question.hasAnswers
        ? {
            onClickPrimary: convert(true, question.unsubmitAndConvertUrl),
            onClickSecondary: convert(false, question.convertUrl),
            primaryLabel: t(translations.unsubmitAndChange),
            secondaryLabel: t(translations.changeAnyway),
            title: t(translations.headsUpExistingSubmissions),
          }
        : {
            onClickPrimary: convert(false, question.convertUrl),
            primaryLabel:
              question.mcqMrqType === 'mcq'
                ? t(translations.changeToMrq)
                : t(translations.changeToMcq),
            title: t(translations.sureChangingQuestionType),
          })}
    >
      <PromptText>
        {question.mcqMrqType === 'mcq'
          ? t(translations.changingThisToMrq)
          : t(translations.changingThisToMcq)}
      </PromptText>

      <PromptText className="italic">
        {question.title ? question.title : question.defaultTitle}
      </PromptText>

      <div className="flex space-x-4">
        <Chip
          className="opacity-70"
          color="info"
          label={question.type}
          size="small"
          variant="outlined"
        />

        <East className="text-yellow-500" />

        <Chip
          color="info"
          label={
            question.mcqMrqType === 'mcq'
              ? t(translations.mrq)
              : t(translations.mcq)
          }
          size="small"
          variant="outlined"
        />
      </div>

      {question.hasAnswers && (
        <Alert
          classes={{ message: 'space-y-5' }}
          className="!mt-8"
          severity="warning"
        >
          <Typography variant="body2">
            <strong>{t(translations.thereAreExistingSubmissions)}</strong>
            &nbsp;{t(translations.changingQuestionTypeWarning)}
          </Typography>

          <Typography variant="body2">
            {t(translations.changingQuestionTypeAlert)}
          </Typography>
        </Alert>
      )}
    </Prompt>
  );
};

export default ConvertMcqMrqPrompt;
