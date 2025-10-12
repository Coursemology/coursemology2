import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import sampleSize from 'lodash-es/sampleSize';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { actions as questionRubricsActions } from '../reducers/rubrics';

import AddSampleAnswersDialog, {
  AddSampleAnswersFormData,
  AddSampleMode,
} from './AddSampleAnswersDialog';
import RubricHeader from './RubricHeader';
import { fetchQuestionRubricAnswers } from './operations/answers';
import { fetchQuestionRubrics } from './operations/rubric';
import { createQuestionMockAnswer } from './operations/mockAnswers';

const RubricPlaygroundPage = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isAddingAnswers, setIsAddingAnswers] = useState(false);

  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const [selectedRubricId, setSelectedRubricId] = useState(0);

  const fetchPlaygroundData = async (): Promise<void> => {
    const rubrics = await fetchQuestionRubrics();
    dispatch(questionRubricsActions.loadRubrics(rubrics));
    setSelectedRubricId(rubrics?.at(-1)?.id ?? 0);

    const answers = await fetchQuestionRubricAnswers();
    dispatch(questionRubricsActions.loadAnswers(answers));
  };

  const selectableAnswers = Object.values(rubricState.answers).filter(
    (answer) =>
      !(answer.id in rubricState.rubrics[selectedRubricId].answerEvaluations),
  );
  return (
    <Preload render={<LoadingIndicator />} while={fetchPlaygroundData}>
      {() => {
        return (
          <>
            <RubricHeader selectedRubricId={selectedRubricId} />

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

              <div className="flex-1" />
            </div>

            <AddSampleAnswersDialog
              answers={selectableAnswers}
              onClose={() => setIsAddingAnswers(false)}
              onSubmit={async (
                data: AddSampleAnswersFormData,
              ): Promise<void> => {
                switch (data.addMode) {
                  case AddSampleMode.SPECIFIC_ANSWER: {
                    dispatch(
                      questionRubricsActions.initializeAnswerEvaluations({
                        answerIds: data.addAnswerIds,
                        rubricId: selectedRubricId,
                      }),
                    );
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
                        rubricId: selectedRubricId,
                      }),
                    );
                    break;
                  }
                  case AddSampleMode.CUSTOM_ANSWER: {
                    const mockAnswerId = await createQuestionMockAnswer(
                      data.addMockAnswerText,
                    );
                    dispatch(
                      questionRubricsActions.initializeMockAnswerEvaluation({
                        rubricId: selectedRubricId,
                        mockAnswerId,
                      }),
                    );
                    break;
                  }
                  default: {
                    break;
                  }
                }
                setIsAddingAnswers(false);
              }}
              open={isAddingAnswers}
            />
          </>
        );
      }}
    </Preload>
  );
};

const handle = 'Rubric Playground';

export default Object.assign(RubricPlaygroundPage, { handle });
