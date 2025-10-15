import { useEffect, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import sampleSize from 'lodash-es/sampleSize';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { redirectToNotFound } from 'lib/hooks/router/redirect';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { actions as questionRubricsActions } from '../reducers/rubrics';

import AddSampleAnswersDialog, {
  AddSampleAnswersFormData,
  AddSampleMode,
} from './AddSampleAnswersDialog';
import AnswerEvaluationsTable from './AnswerEvaluationsTable';
import RubricHeader from './RubricHeader';
import {
  fetchQuestionRubricAnswers,
  fetchRubricAnswerEvaluations
} from './operations/answers';
import { fetchQuestionRubrics } from './operations/rubric';
import {
  createQuestionMockAnswer,
  fetchQuestionRubricMockAnswers,
  fetchRubricMockAnswerEvaluations
} from './operations/mockAnswers';
import { AxiosError } from 'axios';

const RubricPlaygroundPage = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isAddingAnswers, setIsAddingAnswers] = useState(false);

  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const [selectedRubricId, setSelectedRubricId] = useState(0);

  const fetchRubricEvaluationsData = async (
    rubricId: number,
  ): Promise<void> => {
    const [answerEvaluations, mockAnswerEvaluations] = await Promise.all([
      fetchRubricAnswerEvaluations(rubricId),
      fetchRubricMockAnswerEvaluations(rubricId),
    ]);
    dispatch(
      questionRubricsActions.loadRubricEvaluations({
        rubricId,
        answerEvaluations,
        mockAnswerEvaluations,
      }),
    );
  };

  const fetchPlaygroundData = async (): Promise<void> => {
    try {
      const rubrics = await fetchQuestionRubrics();
      const mostRecentRubricId = rubrics?.at(-1)?.id ?? 0;
      await dispatch(questionRubricsActions.loadRubrics(rubrics));
      setSelectedRubricId(mostRecentRubricId);

      const answers = await fetchQuestionRubricAnswers();
      dispatch(questionRubricsActions.loadAnswers(answers));

      const mockAnswers = await fetchQuestionRubricMockAnswers();
      dispatch(questionRubricsActions.loadMockAnswers(mockAnswers));
      await fetchRubricEvaluationsData(mostRecentRubricId);
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 404) {
        redirectToNotFound();
      }
    }
  };

  useEffect(() => {
    if (rubricState.rubrics[selectedRubricId]?.isEvaluationsLoaded === false) {
      fetchRubricEvaluationsData(selectedRubricId);
    }
  }, [selectedRubricId]);

  const selectableAnswers = Object.values(rubricState.answers).filter(
    (answer) =>
      rubricState.rubrics[selectedRubricId] &&
      !(answer.id in rubricState.rubrics[selectedRubricId].answerEvaluations),
  );

  const maximumGrade = rubricState.rubrics[selectedRubricId]?.categories.reduce(
    (sum, category) => sum + category.maximumGrade,
    0,
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
              maximumGrade={maximumGrade ?? 0}
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
                      questionRubricsActions.initializeMockAnswer({
                        rubricId: selectedRubricId,
                        mockAnswerId,
                        answerText: data.addMockAnswerText,
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
            <AnswerEvaluationsTable selectedRubricId={selectedRubricId} />
          </>
        );
      }}
    </Preload>
  );
};

const handle = 'Rubric Playground';

export default Object.assign(RubricPlaygroundPage, { handle });
