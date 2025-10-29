import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
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
  initializeAnswerEvaluations,
} from './operations/answers';
import {
  fetchQuestionRubricMockAnswers,
  fetchRubricMockAnswerEvaluations,
  initializeMockAnswerEvaluations,
} from './operations/mockAnswers';
import { createNewRubric, fetchQuestionRubrics } from './operations/rubric';
import AnswerEvaluationsTable from './AnswerEvaluationsTable';
import AnswerEvaluationsTableHeader from './AnswerEvaluationsTableHeader';
import RubricEditForm from './RubricEditForm';
import RubricHeader from './RubricHeader';
import { RubricEditFormData, RubricPlaygroundTab } from './types';
import { buildSelectedRubricTableData } from './utils';

const RubricPlaygroundPage = (): JSX.Element | null => {
  const dispatch = useAppDispatch();

  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );
  const [selectedRubricId, setSelectedRubricId] = useState(0);
  const [activeTab, setActiveTab] = useState<RubricPlaygroundTab>(
    RubricPlaygroundTab.EVALUATE,
  );
  const editForm = useForm<RubricEditFormData>({
    defaultValues: {
      categories: [],
      gradingPrompt: '',
      modelAnswer: '',
    },
  });
  const isShowingAnswerEvaluationsTable =
    activeTab === RubricPlaygroundTab.EVALUATE ||
    activeTab === RubricPlaygroundTab.COMPARE;
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
      const rubricIdsToLoad =
        activeTab === RubricPlaygroundTab.COMPARE
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

  const handleEditFormSubmit: SubmitHandler<RubricEditFormData> = async (
    formData,
  ) => {
    const rubric = await createNewRubric(formData);
    await dispatch(
      questionRubricsActions.createNewRubric({
        rubric,
        selectedRubricId,
      }),
    );
    await Promise.all([
      initializeAnswerEvaluations(
        rubric.id,
        Object.values(selectedRubricData?.state.answerEvaluations ?? []).map(
          (evaluation) => evaluation.answerId,
        ),
      ),
      initializeMockAnswerEvaluations(
        rubric.id,
        Object.values(
          selectedRubricData?.state.mockAnswerEvaluations ?? [],
        ).map((evaluation) => evaluation.mockAnswerId),
      ),
    ]);
    setSelectedRubricId(rubric.id);
    setActiveTab(RubricPlaygroundTab.EVALUATE);
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

        const compareRubrics =
          activeTab === RubricPlaygroundTab.COMPARE
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
              activeTab={activeTab}
              compareCount={compareCount}
              editForm={editForm}
              selectedRubric={selectedRubric}
              selectedRubricIndex={selectedRubricIndex}
              setActiveTab={setActiveTab}
              setCompareCount={setCompareCount}
              setSelectedRubricId={setSelectedRubricId}
              sortedRubrics={sortedRubrics}
            />

            {activeTab === RubricPlaygroundTab.EDIT && (
              <RubricEditForm
                form={editForm}
                onSubmit={handleEditFormSubmit}
                selectedRubric={selectedRubric}
              />
            )}

            {isShowingAnswerEvaluationsTable && (
              <AnswerEvaluationsTableHeader
                answerCount={answerCount}
                answerEvaluatedCount={answerEvaluatedCount}
                answerEvaluationTableData={answerEvaluationTableData}
                compareCount={compareCount}
                isComparing={activeTab === RubricPlaygroundTab.COMPARE}
                selectedRubric={selectedRubric}
              />
            )}

            {isShowingAnswerEvaluationsTable && (
              <AnswerEvaluationsTable
                data={answerEvaluationTableData}
                isComparing={activeTab === RubricPlaygroundTab.COMPARE}
                selectedRubric={selectedRubric}
              />
            )}
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
