import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';
import { redirectToNotFound } from 'lib/hooks/router/redirect';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { actions as questionRubricsActions } from '../reducers/rubrics';
import { getSelectedRubricData } from '../selectors/rubrics';

import {
  fetchQuestionRubricAnswers,
  fetchRubricAnswerEvaluations,
} from './operations/answers';
import {
  fetchQuestionRubricMockAnswers,
  fetchRubricMockAnswerEvaluations,
} from './operations/mockAnswers';
import { fetchQuestionRubrics } from './operations/rubric';
import AnswerEvaluationsTable from './AnswerEvaluationsTable';
import AnswerEvaluationsTableHeader from './AnswerEvaluationsTableHeader';
import RubricHeader from './RubricHeader';
import { buildSelectedRubricTableData } from './utils';

const RubricPlaygroundPage = (): JSX.Element | null => {
  const dispatch = useAppDispatch();

  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const [selectedRubricId, setSelectedRubricId] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [compareCount, setCompareCount] = useState(2);

  const { sortedRubrics, selectedRubricData } = useAppSelector(
    getSelectedRubricData(selectedRubricId),
  );

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

  useEffect(() => {
    if (typeof selectedRubricData?.index === 'number') {
      const rubricIdsToLoad = isComparing
        ? sortedRubrics
            .slice(
              Math.max(0, selectedRubricData.index - compareCount + 1),
              selectedRubricData.index + 1,
            )
            .map((rubric) => rubric.id)
        : [selectedRubricId];

      Promise.all(
        rubricIdsToLoad
          .filter(
            (rubricId) => !rubricState.rubrics[rubricId]?.isEvaluationsLoaded,
          )
          .map((rubricId) => fetchRubricEvaluationsData(rubricId)),
      );
    }
  }, [selectedRubricData?.index, compareCount]);

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

  return (
    <Preload render={<LoadingIndicator />} while={fetchPlaygroundData}>
      {() => {
        if (!selectedRubricData) return <LoadingIndicator />;

        const {
          state: selectedRubric,
          index: selectedRubricIndex,
          answerCount,
          answerEvaluatedCount,
        } = selectedRubricData;
        const compareRubrics = isComparing
          ? sortedRubrics.slice(
              Math.max(0, selectedRubricIndex - compareCount + 1),
              selectedRubricIndex + 1,
            )
          : undefined;
        const answerEvaluationTableData = buildSelectedRubricTableData(
          selectedRubric,
          rubricState.answers,
          rubricState.mockAnswers,
          compareRubrics,
        );
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

            <AnswerEvaluationsTableHeader
              answerCount={answerCount}
              answerEvaluatedCount={answerEvaluatedCount}
              answerEvaluationTableData={answerEvaluationTableData}
              compareCount={compareCount}
              isComparing={isComparing}
              selectedRubric={selectedRubric}
            />

            <AnswerEvaluationsTable
              data={answerEvaluationTableData}
              isComparing={isComparing}
              selectedRubric={selectedRubric}
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
