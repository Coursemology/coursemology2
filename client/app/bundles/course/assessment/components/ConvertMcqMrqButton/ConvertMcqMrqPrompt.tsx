import { useState } from 'react';
import { East } from '@mui/icons-material';
import { Alert, Chip, Typography } from '@mui/material';
import { McqMrqListData } from 'types/course/assessment/question/multiple-responses';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { convertMcqMrq } from '../../operations/questions';
import translations from '../../translations';

export interface ConvertMcqMrqData {
  mcqMrqType: McqMrqListData['mcqMrqType'];
  convertUrl: McqMrqListData['convertUrl'];
  hasAnswers?: McqMrqListData['hasAnswers'];
  unsubmitAndConvertUrl?: McqMrqListData['unsubmitAndConvertUrl'];
  type: McqMrqListData['type'];
  title?: McqMrqListData['title'];
  id?: McqMrqListData['id'];
}

interface ConvertMcqMrqPromptProps {
  for: ConvertMcqMrqData;
  onClose: () => void;
  onConvertComplete: (data: McqMrqListData) => void;
  open: boolean;
}

const ConvertMcqMrqPrompt = (props: ConvertMcqMrqPromptProps): JSX.Element => {
  const { for: question } = props;
  const { t } = useTranslation();
  const [converting, setConverting] = useState(false);

  const convert = (unsubmit: boolean, convertUrl?: string) => () => {
    if (!convertUrl)
      throw new Error(
        `Encountered convert URL for MCQ/MRQ ${
          question.id ? `with ID ${question.id} is` : ''
        } ${convertUrl?.toString()}.`,
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
      })
      .then((data) => {
        props.onConvertComplete({ ...question, ...data });
        props.onClose();
      })
      .catch((error) => {
        const message = (error as Error)?.message;
        toast.error(message || t(translations.errorChangingQuestionType));
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
      {question.title && (
        <>
          <PromptText>
            {question.mcqMrqType === 'mcq'
              ? t(translations.changingThisToMrq)
              : t(translations.changingThisToMcq)}
          </PromptText>

          <PromptText className="italic">{question.title}</PromptText>
        </>
      )}

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
