import { defineMessages } from 'react-intl';
import { Alert, Card, CardContent, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import messagesTranslations from 'lib/translations/messages';

import { HistoryFetchStatus } from '../../reducers/history';
import { AnswerDetailsProps } from '../../types';

import FileUploadDetails from './FileUploadDetails';
import ForumPostResponseDetails from './ForumPostResponseDetails';
import MultipleChoiceDetails from './MultipleChoiceDetails';
import MultipleResponseDetails from './MultipleResponseDetails';
import ProgrammingAnswerDetails from './ProgrammingAnswerDetails';
import TextResponseDetails from './TextResponseDetails';

const translations = defineMessages({
  rendererNotImplemented: {
    id: 'course.assessment.submission.Answer.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
  pastAnswerTitle: {
    id: 'course.assessment.statistics.pastAnswerTitle',
    defaultMessage: 'Submitted At: {submittedAt}',
  },
});

const AnswerNotImplemented = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Card className="bg-yellow-100">
      <CardContent>{t(translations.rendererNotImplemented)}</CardContent>
    </Card>
  );
};

export const AnswerDetailsMapper = {
  MultipleChoice: (
    props: AnswerDetailsProps<'MultipleChoice'>,
  ): JSX.Element => <MultipleChoiceDetails {...props} />,
  MultipleResponse: (
    props: AnswerDetailsProps<'MultipleResponse'>,
  ): JSX.Element => <MultipleResponseDetails {...props} />,
  TextResponse: (props: AnswerDetailsProps<'TextResponse'>): JSX.Element => (
    <TextResponseDetails {...props} />
  ),
  FileUpload: (props: AnswerDetailsProps<'FileUpload'>): JSX.Element => (
    <FileUploadDetails {...props} />
  ),
  ForumPostResponse: (
    props: AnswerDetailsProps<'ForumPostResponse'>,
  ): JSX.Element => <ForumPostResponseDetails {...props} />,
  Programming: (props: AnswerDetailsProps<'Programming'>): JSX.Element => (
    <ProgrammingAnswerDetails {...props} />
  ),
  // TODO: define component for Voice Response, Scribing, Rubric Based Response
  RubricBasedResponse: (
    _props: AnswerDetailsProps<'RubricBasedResponse'>,
  ): JSX.Element => <AnswerNotImplemented />,
  VoiceResponse: (_props: AnswerDetailsProps<'VoiceResponse'>): JSX.Element => (
    <AnswerNotImplemented />
  ),
  Scribing: (_props: AnswerDetailsProps<'Scribing'>): JSX.Element => (
    <AnswerNotImplemented />
  ),
  Comprehension: (_props: AnswerDetailsProps<'Comprehension'>): JSX.Element => (
    <AnswerNotImplemented />
  ),
};

const FetchedAnswerDetails = <T extends keyof typeof QuestionType>(
  props: AnswerDetailsProps<T>,
): JSX.Element => {
  const Component = AnswerDetailsMapper[props.question.type];
  const { t } = useTranslation();
  // "Any" type is used here as the props are dynamically generated
  // depending on the different answer type and typescript
  // does not support union typing for the elements.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const componentProps = props as any;

  return (
    <div className="space-y-0">
      <Typography variant="body1">
        {t(translations.pastAnswerTitle, {
          submittedAt: formatLongDateTime(props.answer.createdAt),
        })}
      </Typography>
      <Component {...componentProps} />
    </div>
  );
};

type AnswerDetailsComponentProps<T extends keyof typeof QuestionType> = {
  status: HistoryFetchStatus;
} & Partial<AnswerDetailsProps<T>>;

const AnswerDetails = <T extends keyof typeof QuestionType>(
  props: AnswerDetailsComponentProps<T>,
): JSX.Element => {
  const { answer, question, status } = props;

  const { t } = useTranslation();

  const isAnswerRenderable =
    answer && question && status === HistoryFetchStatus.COMPLETED;
  if (isAnswerRenderable) {
    return <FetchedAnswerDetails answer={answer!} question={question!} />;
  }
  if (status === HistoryFetchStatus.ERRORED) {
    return (
      <Alert severity="error">{t(messagesTranslations.fetchingError)}</Alert>
    );
  }
  return <LoadingIndicator />;
};

export default AnswerDetails;
