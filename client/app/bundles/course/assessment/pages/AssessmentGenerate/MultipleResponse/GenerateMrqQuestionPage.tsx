import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Container, Divider, Grid } from '@mui/material';
import { McqMrqFormData } from 'types/course/assessment/question/multiple-responses';
import { MrqGeneratedOption } from 'types/course/assessment/question-generation';
import * as yup from 'yup';

import GenerateTabs from 'course/assessment/pages/AssessmentGenerate/GenerateTabs';
import GenerateMrqConversation from 'course/assessment/pages/AssessmentGenerate/MultipleResponse/GenerateMrqConversation';
import GenerateMrqExportDialog from 'course/assessment/pages/AssessmentGenerate/MultipleResponse/GenerateMrqExportDialog';
import GenerateMrqPrototypeForm from 'course/assessment/pages/AssessmentGenerate/MultipleResponse/GenerateMrqPrototypeForm';
import { getAssessmentGenerateQuestionsData } from 'course/assessment/pages/AssessmentGenerate/selectors';
import {
  ConversationState,
  MrqGenerateFormData,
  MrqPrototypeFormData,
  SnapshotState,
} from 'course/assessment/pages/AssessmentGenerate/types';
import {
  buildMrqGenerateRequestPayload,
  buildPrototypeFromMrqQuestionData,
  extractMrqQuestionPrototypeData,
  replaceUnlockedMrqPrototypeFields,
} from 'course/assessment/pages/AssessmentGenerate/utils';
import { generationActions as actions } from 'course/assessment/reducers/generation';
import { setNotification } from 'lib/actions';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { OptionsManagerRef } from '../../../question/multiple-responses/components/OptionsManager';
import {
  fetchEditMrq,
  generate,
} from '../../../question/multiple-responses/operations';
import {
  defaultMrqGenerateFormData,
  defaultMrqPrototypeFormData,
} from '../constants';

// Helper function to generate snapshot ID (copied from generation reducer)
const generateSnapshotId = (): string => Date.now().toString(16);

const translations = defineMessages({
  generatePage: {
    id: 'course.assessment.generation.generatePage',
    defaultMessage: 'Generate Multiple Response Question',
  },
  generateSuccess: {
    id: 'course.assessment.generation.generateSuccess',
    defaultMessage: 'Generation for "{title}" successful.',
  },
  generateError: {
    id: 'course.assessment.generation.generateError',
    defaultMessage: 'An error occurred generating question "{title}".',
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
      JSON.stringify(oldState.question.options) ===
      JSON.stringify(newState.question.options),
    'question.correct':
      JSON.stringify(oldState.question.correct) ===
      JSON.stringify(newState.question.correct),
  };
};

const generateFormValidationSchema = yup.object({
  customPrompt: yup.string().min(1).max(500),
  numberOfQuestions: yup.number().min(1).max(3).required(),
});

const GenerateMrqQuestionPage = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id)
    throw new Error(`GenerateMrqQuestionPage was loaded with ID: ${id}.`);

  const [searchParams] = useSearchParams();
  const sourceId =
    parseInt(searchParams.get('source_question_id') ?? '', 10) || undefined;
  const sourceDataInitializedRef = useRef<boolean>(false);
  const optionsRef = useRef<OptionsManagerRef>(null);

  const dispatch = useAppDispatch();
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const generatePageData = useAppSelector(getAssessmentGenerateQuestionsData);

  // Initialize generation state with MRQ questionType
  useEffect(() => {
    dispatch(actions.initializeGeneration({ questionType: 'mrq' }));
  }, []);

  const { t } = useTranslation();
  // upper form (submit to OpenAI)
  const generateForm = useForm<MrqGenerateFormData>({
    defaultValues: defaultMrqGenerateFormData,
    resolver: yupResolver(generateFormValidationSchema),
  });

  // lower form (populate to new MRQ question page)
  const prototypeForm = useForm({
    defaultValues: defaultMrqPrototypeFormData,
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
    const comp = compareFormData(
      activeSnapshot?.questionData,
      questionFormData,
    );
    return comp === null || Object.values(comp).every((p) => p);
  };

  // calling getValues() directly returns a "readonly" reference, which can lead to errors
  // as the object is propagated across various state / handler functions
  // so instead, these helper functions return a deep copy
  const getActiveGenerateFormData = (): MrqGenerateFormData =>
    JSON.parse(JSON.stringify(generateForm.getValues()));

  const getActivePrototypeFormData = (): MrqPrototypeFormData => {
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
      generateForm.reset(defaultMrqGenerateFormData);
      prototypeForm.reset(conversation.activeSnapshotEditedData);
      setLockStates(snapshot.lockStates);
    }
  };

  const createConversation = (): void => {
    dispatch(actions.createConversation({ questionType: 'mrq' }));
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
        return await fetchEditMrq(sourceId);
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
          prototypeForm.reset(buildPrototypeFromMrqQuestionData(sourceData));
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
                // Reset the active conversation form title to match the reset form data
                const resetTitle =
                  activeSnapshot?.questionData?.question?.title || '';
                dispatch(actions.setActiveFormTitle({ title: resetTitle }));
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
                      <GenerateMrqConversation
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
                              const mrqData =
                                snapshot.questionData as MrqPrototypeFormData;
                              if (
                                mrqData.options &&
                                mrqData.options.length > 0
                              ) {
                                const draftOptions = mrqData.options.map(
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
                              buildMrqGenerateRequestPayload(
                                generateFormData,
                                questionFormData,
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
                                      option: MrqGeneratedOption,
                                      index: number,
                                    ) => ({
                                      ...option,
                                      id: `option-${additionalQuestionTimestamp}-${index}`,
                                    }),
                                  ),
                                  gradingScheme: 'all_correct' as const,
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
                                      questionType: 'mrq',
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
                                  `Successfully generated ${numberOfQuestions} questions!`,
                                ),
                              );
                            }

                            // Handle the first/main question as before
                            const responseQuestionFormData =
                              extractMrqQuestionPrototypeData(response.data);
                            const newQuestionFormData =
                              replaceUnlockedMrqPrototypeFields(
                                questionFormData,
                                responseQuestionFormData,
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
                              } else {
                                dispatch(
                                  setNotification(
                                    t(translations.generateSuccess, {
                                      title: newQuestionFormData.question.title,
                                    }),
                                  ),
                                );
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
                            setNotification(
                              'An error occurred in generating the question.',
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
                  <GenerateMrqPrototypeForm
                    form={prototypeForm}
                    lockStates={lockStates}
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
            <GenerateMrqExportDialog
              onClose={() => setExportDialogOpen(false)}
              open={exportDialogOpen}
            />
          </>
        );
      }}
    </Preload>
  );
};

const handle = translations.generatePage;

export default Object.assign(GenerateMrqQuestionPage, { handle });
