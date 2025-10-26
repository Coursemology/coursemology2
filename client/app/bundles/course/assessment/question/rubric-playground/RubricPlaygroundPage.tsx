import { useEffect, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import sampleSize from 'lodash-es/sampleSize';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';
import { redirectToNotFound } from 'lib/hooks/router/redirect';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { actions as questionRubricsActions } from '../reducers/rubrics';

import {
  fetchQuestionRubricAnswers,
  fetchRubricAnswerEvaluations,
} from './operations/answers';
import {
  createQuestionMockAnswer,
  fetchQuestionRubricMockAnswers,
  fetchRubricMockAnswerEvaluations,
} from './operations/mockAnswers';
import { fetchQuestionRubrics } from './operations/rubric';
import AddSampleAnswersDialog, {
  AddSampleAnswersFormData,
  AddSampleMode,
} from './AddSampleAnswersDialog';
import AnswerEvaluationsTable from './AnswerEvaluationsTable';
import RubricHeader from './RubricHeader';

const RubricPlaygroundPage = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isAddingAnswers, setIsAddingAnswers] = useState(false);

  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const [selectedRubricId, setSelectedRubricId] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [compareCount, setCompareCount] = useState(2);

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
    const sortedRubrics = Object.values(rubricState.rubrics).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    const selectedRubricIndex = Object.values(rubricState.rubrics).findIndex(
      (rubric) => rubric.id === selectedRubricId,
    );
    const rubricIdsToLoad = isComparing
      ? sortedRubrics
          .slice(
            Math.max(0, selectedRubricIndex - compareCount + 1),
            selectedRubricIndex + 1,
          )
          .map((rubric) => rubric.id)
      : [selectedRubricId];
    for (const rubricId of rubricIdsToLoad) {
      if (rubricState.rubrics[rubricId]?.isEvaluationsLoaded === false) {
        fetchRubricEvaluationsData(rubricId);
      }
    }
  }, [selectedRubricId, compareCount]);

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
            <RubricHeader
              compareCount={compareCount}
              isComparing={isComparing}
              selectedRubricId={selectedRubricId}
              setCompareCount={setCompareCount}
              setIsComparing={setIsComparing}
              setSelectedRubricId={setSelectedRubricId}
            />

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
            <AnswerEvaluationsTable
              compareCount={compareCount}
              isComparing={isComparing}
              selectedRubricId={selectedRubricId}
            />
          </>
        );
      }}
    </Preload>
  );
};

const handle: DataHandle = (match) => {
  const { courseId, assessmentId, questionId } = match.params;
  const parsedQuestionId = getIdFromUnknown(questionId);
  if (!parsedQuestionId) throw new Error(`Invalid question id: ${questionId}`);
  return {
    getData: async (): Promise<CrumbPath> => {
      const question = (
        await CourseAPI.assessment.question.questions.fetch(parsedQuestionId)
      )?.data;
      if (!question) return {};

      const questionCrumbTitle = question.title
        ? `${question.defaultTitle}: ${question.title}`
        : question.defaultTitle;
      return {
        activePath: `/courses/${courseId}/assessments/${assessmentId}`,
        content: [
          { title: questionCrumbTitle },
          { title: 'Rubric Playground' },
        ],
      };
    },
  };
};

export default Object.assign(RubricPlaygroundPage, { handle });
