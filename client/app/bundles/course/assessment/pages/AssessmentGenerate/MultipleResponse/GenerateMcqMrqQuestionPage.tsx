import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Container, Divider, Grid } from '@mui/material';
import { McqMrqFormData } from 'types/course/assessment/question/multiple-responses';
import { McqMrqGeneratedOption } from 'types/course/assessment/question-generation';
import * as yup from 'yup';

import GenerateTabs from 'course/assessment/pages/AssessmentGenerate/GenerateTabs';
import GenerateMcqMrqConversation from 'course/assessment/pages/AssessmentGenerate/MultipleResponse/GenerateMcqMrqConversation';
import GenerateMcqMrqExportDialog from 'course/assessment/pages/AssessmentGenerate/MultipleResponse/GenerateMcqMrqExportDialog';
import GenerateMcqMrqPrototypeForm from 'course/assessment/pages/AssessmentGenerate/MultipleResponse/GenerateMcqMrqPrototypeForm';
import { getAssessmentGenerateQuestionsData } from 'course/assessment/pages/AssessmentGenerate/selectors';
import {
  ConversationState,
  McqMrqGenerateFormData,
  McqMrqPrototypeFormData,
  SnapshotState,
} from 'course/assessment/pages/AssessmentGenerate/types';
import {
  buildMcqMrqGenerateRequestPayload,
  buildPrototypeFromMcqMrqQuestionData,
  extractMcqMrqQuestionPrototypeData,
  replaceUnlockedMcqMrqPrototypeFields,
} from 'course/assessment/pages/AssessmentGenerate/utils';
import { generationActions as actions } from 'course/assessment/reducers/generation';
import { setNotification } from 'lib/actions';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { DataHandle } from 'lib/hooks/router/dynamicNest';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { OptionsManagerRef } from '../../../question/multiple-responses/components/OptionsManager';
import {
  fetchEditMcqMrq,
  generate,
} from '../../../question/multiple-responses/operations';
import {
  defaultMcqMrqGenerateFormData,
  defaultMcqPrototypeFormData,
  defaultMrqPrototypeFormData,
} from '../constants';

const translations = defineMessages({
  generateMrqPage: {
    id: 'course.assessment.generation.generateMrqPage',
    defaultMessage: 'Generate Multiple Response Question',
  },
  generateMcqPage: {
    id: 'course.assessment.generation.generateMcqPage',
    defaultMessage: 'Generate Multiple Choice Question',
  },
  generateMultipleSuccess: {
    id: 'course.assessment.generation.generateMultipleSuccess',
    defaultMessage: 'Successfully generated {count} questions!',
  },
  generateError: {
    id: 'course.assessment.generation.generateError',
    defaultMessage: 'An error occurred generating question {title}.',
  },
  loadingSourceError: {
    id: 'course.assessment.generation.loadingSourceError',
    defaultMessage: 'Unable to load source question data.',
  },
  allFieldsLocked: {
    id: 'course.assessment.generation.allFieldsLocked',
    defaultMessage: 'All fields are locked, so nothing can be generated.',
  },
});

const compareFormData = (
  oldState,
  newState,
): { [name: string]: boolean } | null => {
  if (!oldState || !newState) return null;
  return {
    'question.title': oldState.question.title === newState.question.title,
    // remove html tags
    'question.description':
      oldState.question.description.replace(/<(\/)?[^>]+(>|$)/g, '') ===
      newState.question.description.replace(/<(\/)?[^>]+(>|$)/g, ''),
    'question.options':
      JSON.stringify(oldState.options) === JSON.stringify(newState.options),
  };
};

const getMcqMrqType = (
  params: URLSearchParams,
): McqMrqFormData['mcqMrqType'] =>
  params.get('multiple_choice') === 'true' ? 'mcq' : 'mrq';

const generateSnapshotId = (): string => Date.now().toString(16);

const MAX_PROMPT_LENGTH = 10_000;
const NUM_OF_QN_MIN = 1;
const NUM_OF_QN_MAX = 10;

const generateFormValidationSchema = yup.object({
  customPrompt: yup.string().min(1).max(MAX_PROMPT_LENGTH),
  numberOfQuestions: yup
    .number()
    .min(NUM_OF_QN_MIN)
    .max(NUM_OF_QN_MAX)
    .required(),
});

const GenerateMcqMrqQuestionPage = (): JSX.Element => {
  const { t } = useTranslation();
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id)
    throw new Error(`GenerateMcqMrqQuestionPage was loaded with ID: ${id}.`);

  const [searchParams] = useSearchParams();
  const sourceId =
    parseInt(searchParams.get('source_question_id') ?? '', 10) || undefined;

  const isMultipleChoice = searchParams.get('multiple_choice') === 'true';
  const questionType = isMultipleChoice ? 'mcq' : 'mrq';

  const sourceDataInitializedRef = useRef<boolean>(false);
  const optionsRef = useRef<OptionsManagerRef>(null);

  const dispatch = useAppDispatch();
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [isOptionsDirty, setIsOptionsDirty] = useState<boolean>(false);
  const generatePageData = useAppSelector(getAssessmentGenerateQuestionsData);

  // Initialize generation state with the appropriate questionType
  useEffect(() => {
    dispatch(actions.initializeGeneration({ questionType }));
  }, [questionType]);

  // upper form (submit to OpenAI)
  const generateForm = useForm<McqMrqGenerateFormData>({
    defaultValues: defaultMcqMrqGenerateFormData,
    resolver: yupResolver(generateFormValidationSchema),
  });

  // lower form (populate to new question page)
  const prototypeForm = useForm({
    defaultValues: isMultipleChoice
      ? defaultMcqPrototypeFormData
      : defaultMrqPrototypeFormData,
  });
  const questionFormData = prototypeForm.watch();

  const defaultLockStates = {
    'question.title': false,
    'question.description': false,
    'question.options': false,
    'question.correct': false,
  };
  const [lockStates, setLockStates] = useState<{ [name: string]: boolean }>(
    defaultLockStates,
  );

  const activeConversationId = generatePageData.activeConversationId;
  const activeConversationIndex = generatePageData.conversationIds.findIndex(
    (conversationId) => conversationId === activeConversationId,
  );
  const activeConversationSnapshots =
    generatePageData.conversations?.[activeConversationId]?.snapshots;
  const activeSnapshotId =
    generatePageData.conversations[activeConversationId]?.activeSnapshotId;
  const activeSnapshot = activeSnapshotId
    ? generatePageData.conversations[activeConversationId]?.snapshots[
        activeSnapshotId
      ]
    : undefined;
  const latestSnapshotId =
    generatePageData.conversations[activeConversationId]?.latestSnapshotId;

  const questionFormDataEqual = (): boolean => {
    // Get current form data including options from OptionsManager
    const currentFormData = JSON.parse(
      JSON.stringify(prototypeForm.getValues()),
    );
    currentFormData.options = optionsRef.current?.getOptions() || [];

    const comp = compareFormData(activeSnapshot?.questionData, currentFormData);
    const formDataEqual = comp === null || Object.values(comp).every((p) => p);

    // If options are dirty, the form is not equal
    return formDataEqual && !isOptionsDirty;
  };

  // calling getValues() directly returns a "readonly" reference, which can lead to errors
  // as the object is propagated across various state / handler functions
  // so instead, these helper functions return a deep copy
  const getActiveGenerateFormData = (): McqMrqGenerateFormData =>
    JSON.parse(JSON.stringify(generateForm.getValues()));

  const getActivePrototypeFormData = (): McqMrqPrototypeFormData => {
    const formData = JSON.parse(JSON.stringify(prototypeForm.getValues()));

    // Update the form data with current options from OptionsManager
    formData.options = optionsRef.current?.getOptions() || [];

    return formData;
  };

  const saveActiveFormData = (): void => {
    dispatch(
      actions.saveActiveData({
        conversationId: generatePageData.activeConversationId,
        snapshotId: activeSnapshotId,
        questionData: getActivePrototypeFormData(),
      }),
    );
  };

  const switchToConversation = (conversation: ConversationState): void => {
    saveActiveFormData();
    const snapshot = conversation.snapshots?.[conversation.activeSnapshotId];
    if (snapshot) {
      dispatch(
        actions.setActiveConversationId({ conversationId: conversation.id }),
      );
      dispatch(
        actions.setActiveFormTitle({
          title: conversation.activeSnapshotEditedData.question.title,
        }),
      );

      // Set the correct generation mode based on snapshot state
      const isSentinel = snapshot.state === 'sentinel';
      const defaultMode: 'create' | 'enhance' = isSentinel
        ? 'create'
        : 'enhance';
      const formDataWithCorrectMode: McqMrqGenerateFormData = {
        ...defaultMcqMrqGenerateFormData,
        generationMode: defaultMode,
      };

      generateForm.reset(formDataWithCorrectMode);
      prototypeForm.reset(conversation.activeSnapshotEditedData);
      setLockStates(snapshot.lockStates);
      // Reset options dirty state when switching conversations
      setIsOptionsDirty(false);
    }
  };

  const createConversation = (): void => {
    dispatch(actions.createConversation({ questionType }));
    dispatch((_, getState) => {
      const newState = getAssessmentGenerateQuestionsData(getState());
      const newConversationId =
        newState.conversationIds[newState.conversationIds.length - 1];
      const newConversation = newState.conversations[newConversationId];

      switchToConversation(newConversation);
    });
  };

  const duplicateConversation = (conversation: ConversationState): void => {
    dispatch(
      actions.duplicateConversation({ conversationId: conversation.id }),
    );
    if (conversation.id === generatePageData.activeConversationId) {
      // persist changes from the active tab to the duplicated tab
      dispatch((_, getState) => {
        const newState = getAssessmentGenerateQuestionsData(getState());
        const newConversation = Object.values(newState.conversations).find(
          (otherConversation) =>
            otherConversation.duplicateFromId === conversation.id,
        );
        if (newConversation) {
          dispatch(
            actions.saveActiveData({
              conversationId: newConversation.id,
              snapshotId: newConversation.activeSnapshotId,
              questionData: getActivePrototypeFormData(),
            }),
          );
        }
      });
    }
  };

  const deleteConversation = (conversation: ConversationState): void => {
    if (conversation?.id === generatePageData.activeConversationId) {
      const newActiveConversationIndex =
        activeConversationIndex > 0 ? activeConversationIndex - 1 : 1;
      switchToConversation(
        generatePageData.conversations[
          generatePageData.conversationIds[newActiveConversationIndex]
        ],
      );
    }
    dispatch(actions.deleteConversation({ conversationId: conversation.id }));
  };

  const fetchSourceData = async (): Promise<
    McqMrqFormData<'edit'> | undefined
  > => {
    if (sourceId) {
      try {
        return await fetchEditMcqMrq(sourceId);
      } catch (error) {
        dispatch(setNotification(t(translations.loadingSourceError)));
      }
    }
    return undefined;
  };

  const preloadData = async (): Promise<{
    sourceData?: McqMrqFormData<'edit'>;
  }> => {
    const sourceData = await fetchSourceData();
    return { sourceData };
  };

  return (
    <Preload render={<LoadingIndicator />} while={preloadData}>
      {({ sourceData }): JSX.Element => {
        if (sourceData && !sourceDataInitializedRef.current) {
          sourceDataInitializedRef.current = true;
          dispatch(
            actions.setActiveFormTitle({ title: sourceData.question.title }),
          );
          prototypeForm.reset(
            buildPrototypeFromMcqMrqQuestionData(sourceData, isMultipleChoice),
          );
        }

        return (
          <>
            <GenerateTabs
              canReset={!questionFormDataEqual()}
              createConversation={createConversation}
              deleteConversation={deleteConversation}
              duplicateConversation={duplicateConversation}
              onExport={() => {
                saveActiveFormData();
                dispatch(actions.clearErroredConversationData());
                setExportDialogOpen(true);
              }}
              resetConversation={() => {
                prototypeForm.reset(activeSnapshot?.questionData);

                const resetTitle =
                  activeSnapshot?.questionData?.question?.title || '';
                dispatch(actions.setActiveFormTitle({ title: resetTitle }));

                optionsRef.current?.reset();
                setIsOptionsDirty(false);
              }}
              switchToConversation={switchToConversation}
            />

            <Container className="full-height" disableGutters maxWidth={false}>
              <Grid
                alignItems="stretch"
                className="full-height"
                container
                spacing={2}
              >
                <Grid
                  className="lg:self-start lg:sticky lg:top-0 lg:h-[calc(100vh_-_3rem)] flex flex-col"
                  item
                  lg={4}
                  xs={12}
                >
                  {activeConversationSnapshots &&
                    activeSnapshotId &&
                    latestSnapshotId && (
                      <GenerateMcqMrqConversation
                        activeSnapshotId={activeSnapshotId}
                        generateForm={generateForm}
                        latestSnapshotId={latestSnapshotId}
                        onClickSnapshot={(snapshot: SnapshotState) => {
                          if (snapshot.state === 'success') {
                            dispatch(
                              actions.saveActiveData({
                                conversationId:
                                  generatePageData.activeConversationId,
                                snapshotId: snapshot.id,
                                questionData: snapshot.questionData,
                              }),
                            );
                            if (snapshot.questionData) {
                              dispatch(
                                actions.setActiveFormTitle({
                                  title: snapshot.questionData.question.title,
                                }),
                              );
                            }
                            if (snapshot.generateFormData) {
                              generateForm.reset(snapshot.generateFormData);
                            }
                            if (snapshot.questionData) {
                              prototypeForm.reset(snapshot.questionData);
                            }
                            if (snapshot.lockStates) {
                              setLockStates(snapshot.lockStates);
                            }

                            // Update OptionsManager with the snapshot's options
                            if (snapshot.questionData) {
                              const questionData =
                                snapshot.questionData as McqMrqPrototypeFormData;
                              if (
                                questionData.options &&
                                questionData.options.length > 0
                              ) {
                                const draftOptions = questionData.options.map(
                                  (option) => ({
                                    ...option,
                                    draft: true,
                                  }),
                                );
                                optionsRef.current?.updateOptions(draftOptions);
                              } else {
                                // If no options, start with empty options
                                optionsRef.current?.updateOptions([]);
                              }
                            }

                            // Reset options dirty state when switching snapshots
                            setIsOptionsDirty(false);
                          }
                        }}
                        onGenerate={async (generateFormData): Promise<void> => {
                          if (
                            Object.values(lockStates).reduce(
                              (a, b) => a && b,
                              true,
                            )
                          ) {
                            dispatch(
                              setNotification(t(translations.allFieldsLocked)),
                            );
                            return;
                          }
                          const newSnapshotId = Date.now().toString(16);
                          const conversationId =
                            generatePageData.activeConversationId;
                          dispatch(
                            actions.createSnapshot({
                              snapshotId: newSnapshotId,
                              parentId: activeSnapshotId,
                              generateFormData: getActiveGenerateFormData(),
                              conversationId,
                              lockStates,
                            }),
                          );
                          try {
                            const response = await generate(
                              buildMcqMrqGenerateRequestPayload(
                                generateFormData as McqMrqGenerateFormData,
                                questionFormData as McqMrqPrototypeFormData,
                                isMultipleChoice,
                              ),
                            );

                            // Handle multiple questions if they were generated
                            const allQuestions = response.data.allQuestions || [
                              response.data,
                            ];
                            const numberOfQuestions =
                              response.data.numberOfQuestions || 1;

                            if (
                              numberOfQuestions > 1 &&
                              allQuestions.length > 1
                            ) {
                              // Get the original conversation to copy snapshots from
                              const originalConversation =
                                generatePageData.conversations[conversationId];

                              // Create separate conversations for each additional question
                              for (let i = 1; i < allQuestions.length; i++) {
                                const additionalQuestion = allQuestions[i];
                                const additionalQuestionTimestamp =
                                  Date.now() + i; // Ensure unique timestamp
                                const additionalQuestionData = {
                                  question: {
                                    title: additionalQuestion.title,
                                    description: additionalQuestion.description,
                                    skipGrading: false,
                                    randomizeOptions: false,
                                  },
                                  options: additionalQuestion.options.map(
                                    (
                                      option: McqMrqGeneratedOption,
                                      index: number,
                                    ) => ({
                                      ...option,
                                      id: `option-${additionalQuestionTimestamp}-${index}`,
                                    }),
                                  ),
                                  gradingScheme: isMultipleChoice
                                    ? ('any_correct' as const)
                                    : ('all_correct' as const),
                                };

                                // Copy only the latest snapshot from the original conversation
                                if (originalConversation) {
                                  const newAdditionalQuestionSnapshotId =
                                    generateSnapshotId();

                                  // Create a new snapshot with the additional question data
                                  const newSnapshot = {
                                    id: newAdditionalQuestionSnapshotId,
                                    parentId: undefined, // No parent since this is a fresh start
                                    lockStates,
                                    generateFormData,
                                    state: 'success' as const,
                                    questionData: additionalQuestionData,
                                  };

                                  // Create a new conversation with only the new snapshot
                                  dispatch(
                                    actions.createConversationWithSnapshots({
                                      questionType,
                                      copiedSnapshots: {
                                        [newAdditionalQuestionSnapshotId]:
                                          newSnapshot,
                                      },
                                      latestSnapshotId:
                                        newAdditionalQuestionSnapshotId,
                                      activeSnapshotId:
                                        newAdditionalQuestionSnapshotId,
                                      activeSnapshotEditedData:
                                        additionalQuestionData,
                                    }),
                                  );
                                }
                              }

                              // Show success notification for multiple questions
                              dispatch(
                                setNotification(
                                  t(translations.generateMultipleSuccess, {
                                    count: numberOfQuestions,
                                  }),
                                ),
                              );
                            }

                            // Handle the first/main question as before
                            const responseQuestionFormData =
                              extractMcqMrqQuestionPrototypeData(
                                response.data,
                                isMultipleChoice,
                              );
                            const newQuestionFormData =
                              replaceUnlockedMcqMrqPrototypeFields(
                                questionFormData as McqMrqPrototypeFormData,
                                responseQuestionFormData as McqMrqPrototypeFormData,
                                lockStates,
                              );
                            dispatch((_, getState) => {
                              const currentActiveConversationId =
                                getAssessmentGenerateQuestionsData(
                                  getState(),
                                ).activeConversationId;
                              if (
                                conversationId === currentActiveConversationId
                              ) {
                                generateForm.resetField('customPrompt', {
                                  defaultValue: '',
                                });
                                prototypeForm.reset(newQuestionFormData);

                                // Update the OptionsManager with the new options
                                if (
                                  newQuestionFormData.options &&
                                  newQuestionFormData.options.length > 0
                                ) {
                                  // Mark options as drafts for immediate deletion in generation page
                                  const draftOptions =
                                    newQuestionFormData.options.map(
                                      (option) => ({
                                        ...option,
                                        draft: true,
                                      }),
                                    );
                                  optionsRef.current?.updateOptions(
                                    draftOptions,
                                  );
                                }
                              }
                              dispatch(
                                actions.snapshotSuccess({
                                  snapshotId: newSnapshotId,
                                  conversationId,
                                  questionData: newQuestionFormData,
                                }),
                              );
                              dispatch(
                                actions.saveActiveData({
                                  conversationId,
                                  snapshotId: newSnapshotId,
                                  questionData: newQuestionFormData,
                                }),
                              );
                              if (
                                currentActiveConversationId === conversationId
                              ) {
                                dispatch(
                                  actions.setActiveFormTitle({
                                    title: newQuestionFormData.question.title,
                                  }),
                                );
                              }
                            });
                          } catch (response) {
                            dispatch(
                              actions.snapshotError({
                                snapshotId: newSnapshotId,
                                conversationId,
                              }),
                            );
                            dispatch(
                              setNotification(
                                t(translations.generateError, {
                                  title:
                                    generatePageData.conversationMetadata[
                                      conversationId
                                    ].title ?? 'Untitled Question',
                                }),
                              ),
                            );
                          }
                        }}
                        onSaveActiveData={saveActiveFormData}
                        questionFormDataEqual={questionFormDataEqual}
                        snapshots={activeConversationSnapshots}
                      />
                    )}
                </Grid>

                <Grid item lg={8} xs={12}>
                  <GenerateMcqMrqPrototypeForm
                    form={prototypeForm}
                    isMultipleChoice={isMultipleChoice}
                    lockStates={lockStates}
                    onOptionsDirtyChange={setIsOptionsDirty}
                    onToggleLock={(lockStateKey: string) => {
                      setLockStates({
                        ...lockStates,
                        [lockStateKey]: !lockStates[lockStateKey],
                      });
                    }}
                    optionsRef={optionsRef}
                  />
                </Grid>
              </Grid>

              <Divider className="mt-8" />
            </Container>
            <GenerateMcqMrqExportDialog
              onClose={() => setExportDialogOpen(false)}
              open={exportDialogOpen}
            />
          </>
        );
      }}
    </Preload>
  );
};

const handle: DataHandle = (_, location) => {
  const searchParams = new URLSearchParams(location.search);

  return getMcqMrqType(searchParams) === 'mcq'
    ? translations.generateMcqPage
    : translations.generateMrqPage;
};

export default Object.assign(GenerateMcqMrqQuestionPage, { handle });
