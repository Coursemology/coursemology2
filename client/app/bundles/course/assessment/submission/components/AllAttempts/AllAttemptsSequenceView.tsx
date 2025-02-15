import { FC, useEffect } from 'react';
import {
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';
import { AllAnswerItem } from 'types/course/assessment/submission/submission-question';

import { tryFetchAnswerById } from 'course/assessment/operations/history';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import { historyActions } from '../../reducers/history';
import { getSubmissionQuestionHistory } from '../../selectors/history';
import translations from '../../translations';
import AnswerDetails from '../AnswerDetails/AnswerDetails';
import TextResponseSolutions from '../TextResponseSolutions';

interface Props {
  submissionId: number;
  questionId: number;
  graderView: boolean;
}

const AllAttemptsSequenceView: FC<Props> = (props) => {
  const { submissionId, questionId, graderView } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { answerDataById, allAnswers, selectedAnswerIds, question } =
    useAppSelector(getSubmissionQuestionHistory(submissionId, questionId));

  useEffect(() => {
    const answerIdsToFetch =
      selectedAnswerIds.filter(
        (answerId) => answerDataById?.[answerId]?.status !== 'completed',
      ) ?? [];
    Promise.allSettled(
      answerIdsToFetch.map((answerId) =>
        tryFetchAnswerById(submissionId, questionId, answerId),
      ),
    );
  }, [dispatch, selectedAnswerIds, submissionId, questionId]);

  const renderPastAnswerSelect = (): JSX.Element => {
    const renderOption = (
      answer: AllAnswerItem,
      index: number,
    ): JSX.Element => {
      return (
        <MenuItem key={index} value={answer.id}>
          {formatLongDateTime(answer.createdAt)}
        </MenuItem>
      );
    };

    return (
      <FormControl className="w-full" variant="standard">
        <InputLabel>{t(translations.pastAnswers)}</InputLabel>
        <Select
          multiple
          onChange={(event) => {
            dispatch(
              historyActions.updateSelectedAnswerIds({
                submissionId,
                questionId,
                selectedAnswerIds: event.target.value as number[],
              }),
            );
          }}
          value={selectedAnswerIds}
          variant="standard"
        >
          {allAnswers.toReversed().map(renderOption)}
        </Select>
      </FormControl>
    );
  };

  const renderSelectedPastAnswers = (answerIds: number[]): JSX.Element => {
    if (answerIds.length > 0) {
      return (
        <>
          {answerIds.map((answerId) => {
            const answerDetails = answerDataById?.[answerId]?.details;
            if (answerDetails) {
              return (
                <>
                  <AnswerDetails
                    key={answerId}
                    answer={answerDetails}
                    question={question!}
                  />
                  <Divider className="mt-4 border-gray-600" />
                </>
              );
            }
            return <LoadingIndicator key={answerId} />;
          })}
        </>
      );
    }
    return (
      <Card className="bg-yellow-100">
        <CardContent>
          <Typography variant="body2">
            {t(translations.noAnswerSelected)}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      {renderPastAnswerSelect()}
      {renderSelectedPastAnswers(selectedAnswerIds)}
      {graderView &&
        question &&
        [QuestionType.TextResponse, QuestionType.Comprehension].includes(
          typeof question.type as QuestionType,
        ) && (
          <TextResponseSolutions
            question={
              question as unknown as SubmissionQuestionData<
                typeof question.type
              >
            }
          />
        )}
    </div>
  );
};

export default AllAttemptsSequenceView;
