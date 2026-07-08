import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  RubricAnswerEvaluationData,
  RubricGradingContextData,
} from 'types/course/rubrics';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';
import { redirectToNotFound } from 'lib/hooks/router/redirect';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import { actions as questionRubricsActions } from '../reducers/rubrics';
import { getSelectedRubricData } from '../selectors/rubrics';

import {
  fetchQuestionRubricAnswers,
  fetchRubricAnswerEvaluations,
  initializeAnswerEvaluations,
} from './operations/answers';
import {
  fetchQuestionRubricGradingContexts,
  fetchQuestionRubricMockAnswers,
  fetchRubricMockAnswerEvaluations,
  initializeMockAnswerEvaluations,
} from './operations/mockAnswers';
import {
  createNewRubric,
  fetchQuestionRubrics,
  setActiveRubric,
} from './operations/rubric';
import AnswerEvaluationsTable from './AnswerEvaluationsTable';
import AnswerEvaluationsTableHeader from './AnswerEvaluationsTableHeader';
import RubricEditForm from './RubricEditForm';
import RubricHeader from './RubricHeader';
import {
  RubricEditFormData,
  RubricPlaygroundTab,
  SliderRevision,
  UNSAVED_RUBRIC_ID,
} from './types';
import { buildSelectedRubricTableData, rubricStateToFormData } from './utils';

const RubricPlaygroundPage = (): JSX.Element | null => {
  const dispatch = useAppDispatch();

  const rubricState = useAppSelector(
    (state) => state.assessments.question.rubrics,
  );

  const [searchParams] = useSearchParams();
  const sourceAnswerId = parseInt(
    searchParams.get('source_answer_id') ?? '',
    10,
  );

  const [selectedRubricId, setSelectedRubricId] = useState(0);
  const [gradingContexts, setGradingContexts] = useState<
    RubricGradingContextData[]
  >([]);
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

  // The client-only "Unsaved" draft revision, present only while editing. `draftCreatedAt` timestamps
  // it for the slider, and `editSourceRubricId` is the saved revision editing began from (return target).
  const [draft, setDraft] = useState<RubricEditFormData | null>(null);
  const [draftCreatedAt, setDraftCreatedAt] = useState('');
  const [editSourceRubricId, setEditSourceRubricId] = useState(0);

  const { sortedRubrics, selectedRubricData } = useAppSelector(
    getSelectedRubricData(selectedRubricId),
  );

  const isEditingDraft = selectedRubricId === UNSAVED_RUBRIC_ID;

  // Saved rubrics, plus the unsaved draft appended at the end while editing.
  const revisions: SliderRevision[] = [
    ...sortedRubrics.map((rubric) => ({
      id: rubric.id,
      createdAt: rubric.createdAt,
      isActive: rubric.isActive,
    })),
    ...(draft
      ? [{ id: UNSAVED_RUBRIC_ID, createdAt: draftCreatedAt, isUnsaved: true }]
      : []),
  ];
  const selectedRevisionIndex = revisions.findIndex(
    (revision) => revision.id === selectedRubricId,
  );

  const fetchRubricEvaluationsData = async (
    rubricId: number,
  ): Promise<RubricAnswerEvaluationData[]> => {
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
    return answerEvaluations;
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

      setGradingContexts(await fetchQuestionRubricGradingContexts());

      const answerEvaluations =
        await fetchRubricEvaluationsData(mostRecentRubricId);
      if (
        sourceAnswerId &&
        !answerEvaluations.find(
          (evaluation) => evaluation.answerId === sourceAnswerId,
        )
      ) {
        dispatch(
          questionRubricsActions.initializeAnswerEvaluations({
            answerIds: [sourceAnswerId],
            rubricId: mostRecentRubricId,
          }),
        );
        await initializeAnswerEvaluations(mostRecentRubricId, [sourceAnswerId]);
      }
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 404) {
        redirectToNotFound();
      }
    }
  };

  // Selecting another revision while the unsaved draft is open captures its in-progress form values
  // first, so sliding back to "Unsaved" resumes exactly where the user left off.
  const handleSelectRevision = (revisionId: number): void => {
    if (isEditingDraft && draft) setDraft(editForm.getValues());
    setSelectedRubricId(revisionId);
  };

  // First "Edit Rubric" click: seed an Unsaved draft from the currently selected revision and open it.
  const handleStartEditing = (): void => {
    setDraft(rubricStateToFormData(selectedRubricData?.state));
    setDraftCreatedAt(new Date().toISOString());
    setEditSourceRubricId(selectedRubricId);
    setActiveTab(RubricPlaygroundTab.EDIT);
    setSelectedRubricId(UNSAVED_RUBRIC_ID);
  };

  // From a read-only preview, jump back to the unsaved draft (its captured edits are restored).
  const handleReturnToEditing = (): void => {
    setSelectedRubricId(UNSAVED_RUBRIC_ID);
  };

  // From a read-only preview, replace the draft with a fresh copy of the previewed revision.
  const handleRestartEditing = (): void => {
    setDraft(rubricStateToFormData(selectedRubricData?.state));
    setDraftCreatedAt(new Date().toISOString());
    setEditSourceRubricId(selectedRubricId);
    setSelectedRubricId(UNSAVED_RUBRIC_ID);
  };

  const handleDiscardChanges = (): void => {
    setDraft(null);
    setActiveTab(RubricPlaygroundTab.EVALUATE);
    setSelectedRubricId(editSourceRubricId);
  };

  // Points the question's active rubric at the selected revision (server + store). Forwarded unconditionally;
  // the backend rejects an incompatible change with graded answers (409) unless confirmRubricAdvance is set,
  // which RubricHeader surfaces as a confirmation before retrying. The store updates only on success.
  const handleSetActive = async (
    confirmRubricAdvance = false,
  ): Promise<void> => {
    await setActiveRubric(selectedRubricId, confirmRubricAdvance);
    dispatch(questionRubricsActions.setActiveRubric(selectedRubricId));
  };

  // Persists the draft as a new saved revision. The draft's latest values come from the live form when
  // it is open, otherwise from the captured draft state. Evaluations are seeded from the source revision.
  const handleSaveDraft = async (): Promise<void> => {
    const draftValues = isEditingDraft ? editForm.getValues() : draft;
    if (!draftValues) return;

    const sourceRubric = rubricState.rubrics[editSourceRubricId];
    const rubric = await createNewRubric(draftValues);
    await dispatch(
      questionRubricsActions.createNewRubric({
        rubric,
        selectedRubricId: editSourceRubricId,
      }),
    );
    await Promise.all([
      initializeAnswerEvaluations(
        rubric.id,
        Object.values(sourceRubric?.answerEvaluations ?? {}).map(
          (evaluation) => evaluation.answerId,
        ),
      ),
      initializeMockAnswerEvaluations(
        rubric.id,
        Object.values(sourceRubric?.mockAnswerEvaluations ?? {}).map(
          (evaluation) => evaluation.mockAnswerId,
        ),
      ),
    ]);
    setDraft(null);
    setSelectedRubricId(rubric.id);
    setActiveTab(RubricPlaygroundTab.EVALUATE);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchPlaygroundData}>
      {() => {
        // The unsaved draft has no store entry, so selectedRubricData is undefined while it is selected.
        if (!isEditingDraft && !selectedRubricData) return <LoadingIndicator />;

        const selectedRubric = selectedRubricData?.state;

        const compareRubrics =
          activeTab === RubricPlaygroundTab.COMPARE && selectedRubricData
            ? sortedRubrics.slice(
                Math.max(0, selectedRubricData.index - compareCount + 1),
                selectedRubricData.index + 1,
              )
            : undefined;
        const answerEvaluationTableData = selectedRubric
          ? buildSelectedRubricTableData(
              selectedRubric,
              rubricState.answers,
              rubricState.mockAnswers,
              compareRubrics,
            )
          : [];

        // In edit mode: the draft is editable, a previewed saved revision is read-only.
        const editInitialValues =
          isEditingDraft && draft
            ? draft
            : rubricStateToFormData(selectedRubric);

        return (
          <>
            <RubricHeader
              activeTab={activeTab}
              compareCount={compareCount}
              onDiscardChanges={handleDiscardChanges}
              onRestartEditing={handleRestartEditing}
              onReturnToEditing={handleReturnToEditing}
              onSaveDraft={handleSaveDraft}
              onSelectRevision={handleSelectRevision}
              onSetActive={handleSetActive}
              onStartEditing={handleStartEditing}
              revisions={revisions}
              selectedRevisionIndex={selectedRevisionIndex}
              selectedRubric={selectedRubric}
              setActiveTab={setActiveTab}
              setCompareCount={setCompareCount}
            />

            {activeTab === RubricPlaygroundTab.EDIT && (
              <RubricEditForm
                disabled={!isEditingDraft}
                form={editForm}
                formKey={selectedRubricId}
                initialValues={editInitialValues}
              />
            )}

            {isShowingAnswerEvaluationsTable && selectedRubricData && (
              <AnswerEvaluationsTableHeader
                answerCount={selectedRubricData.answerCount}
                answerEvaluatedCount={selectedRubricData.answerEvaluatedCount}
                answerEvaluationTableData={answerEvaluationTableData}
                compareCount={compareCount}
                gradingContexts={gradingContexts}
                isComparing={activeTab === RubricPlaygroundTab.COMPARE}
                selectedRubric={selectedRubricData.state}
              />
            )}

            {isShowingAnswerEvaluationsTable && selectedRubric && (
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
          { title: questionCrumbTitle, url: question.editUrl },
          { title: 'Rubric Playground' }, // TODO: Translate this using translations.rubricPlayground
        ],
      };
    },
  };
};

export default Object.assign(RubricPlaygroundPage, { handle });
