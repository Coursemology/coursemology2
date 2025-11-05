import { FC, useState } from 'react';
import { Add, PlayArrow, Refresh } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import sampleSize from 'lodash-es/sampleSize';
import { dispatch } from 'store';

import { useAppSelector } from 'lib/hooks/store';

import {
  actions as questionRubricsActions,
  RubricState,
} from '../reducers/rubrics';

import { AnswerTableEntry } from './AnswerEvaluationsTable/types';
import { isAnswerAlreadyEvaluated } from './AnswerEvaluationsTable/utils';
import { initializeAnswerEvaluations } from './operations/answers';
import {
  createQuestionMockAnswer,
  initializeMockAnswerEvaluations,
} from './operations/mockAnswers';
import { requestRowEvaluation } from './operations/rowEvaluation';
import AddSampleAnswersDialog, {
  AddSampleAnswersFormData,
  AddSampleMode,
} from './AddSampleAnswersDialog';

const AnswerEvaluationsTableHeader: FC<{
  answerCount: number;
  answerEvaluatedCount: number;
  answerEvaluationTableData: AnswerTableEntry[];
  compareCount: number;
  isComparing: boolean;
  selectedRubric: RubricState;
}> = (props) => {
  const {
    answerCount,
    answerEvaluatedCount,
    answerEvaluationTableData,
    compareCount,
    isComparing,
    selectedRubric,
  } = props;

  const rubricAnswers = useAppSelector(
    (state) => state.assessments.question.rubrics.answers,
  );
  const selectableAnswers = Object.values(rubricAnswers).filter(
    (answer) => !(answer.id in selectedRubric.answerEvaluations),
  );

  const maximumGrade = selectedRubric.categories.reduce(
    (sum, category) => sum + category.maximumGrade,
    0,
  );

  const [isAddingAnswers, setIsAddingAnswers] = useState(false);

  const handleAddAnswers = async (
    data: AddSampleAnswersFormData,
  ): Promise<void> => {
    switch (data.addMode) {
      case AddSampleMode.SPECIFIC_ANSWER: {
        dispatch(
          questionRubricsActions.initializeAnswerEvaluations({
            answerIds: data.addAnswerIds,
            rubricId: selectedRubric.id,
          }),
        );
        await initializeAnswerEvaluations(selectedRubric.id, data.addAnswerIds);
        break;
      }
      case AddSampleMode.RANDOM_STUDENT: {
        const randomAnswerIds = sampleSize(
          selectableAnswers,
          data.addRandomAnswerCount,
        ).map((answer) => answer.id);
        dispatch(
          questionRubricsActions.initializeAnswerEvaluations({
            answerIds: randomAnswerIds,
            rubricId: selectedRubric.id,
          }),
        );
        await initializeAnswerEvaluations(selectedRubric.id, randomAnswerIds);
        break;
      }
      case AddSampleMode.CUSTOM_ANSWER: {
        const mockAnswerId = await createQuestionMockAnswer(
          data.addMockAnswerText,
        );
        dispatch(
          questionRubricsActions.initializeMockAnswer({
            rubricId: selectedRubric.id,
            mockAnswerId,
            answerText: data.addMockAnswerText,
          }),
        );
        await initializeMockAnswerEvaluations(selectedRubric.id, [
          mockAnswerId,
        ]);
        break;
      }
      default: {
        break;
      }
    }
  };

  return (
    <>
      <div className="flex flex-row space-x-4 items-center py-2">
        <Typography variant="h6">Sample Answer Evaluations</Typography>
        <Button
          onClick={() => setIsAddingAnswers(true)}
          size="small"
          startIcon={<Add />}
          variant="outlined"
        >
          Add Sample Answers
        </Button>
        {Boolean(answerCount) && !isComparing && (
          <Button
            disabled={answerEvaluationTableData.some((row) => row.isEvaluating)}
            onClick={() => {
              const rowsToEvaluate =
                answerEvaluatedCount === answerCount
                  ? answerEvaluationTableData
                  : answerEvaluationTableData.filter(
                      (answer) => !isAnswerAlreadyEvaluated(answer),
                    );
              Promise.all(
                rowsToEvaluate.map((row) =>
                  requestRowEvaluation(dispatch, row, selectedRubric.id),
                ),
              );
            }}
            size="small"
            startIcon={
              answerEvaluatedCount === answerCount ? <Refresh /> : <PlayArrow />
            }
            variant="outlined"
          >
            {!answerEvaluatedCount && `Evaluate All (${answerCount})`}
            {Boolean(answerEvaluatedCount) &&
              answerEvaluatedCount === answerCount &&
              `Re-evaluate All (${answerCount})`}
            {Boolean(answerEvaluatedCount) &&
              answerEvaluatedCount !== answerCount &&
              `Evaluate Remaining (${answerCount - answerEvaluatedCount})`}
          </Button>
        )}
      </div>
      {isComparing && (
        <Typography variant="body2">
          Comparing {compareCount} revisions
        </Typography>
      )}

      <AddSampleAnswersDialog
        answers={selectableAnswers}
        maximumGrade={maximumGrade ?? 0}
        onClose={() => setIsAddingAnswers(false)}
        onSubmit={async (data: AddSampleAnswersFormData): Promise<void> => {
          await handleAddAnswers(data);
          setIsAddingAnswers(false);
        }}
        open={isAddingAnswers}
      />
    </>
  );
};

export default AnswerEvaluationsTableHeader;
