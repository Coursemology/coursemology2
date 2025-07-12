import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Container, Divider, Grid } from '@mui/material';
import {
  LanguageData,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';
import * as yup from 'yup';

import GenerateTabs from 'course/assessment/pages/AssessmentGenerate/GenerateTabs';
import GenerateProgrammingConversation from 'course/assessment/pages/AssessmentGenerate/Programming/GenerateProgrammingConversation';
import GenerateProgrammingPrototypeForm from 'course/assessment/pages/AssessmentGenerate/Programming/GenerateProgrammingPrototypeForm';
import { getAssessmentGenerateQuestionsData } from 'course/assessment/pages/AssessmentGenerate/selectors';
import {
  ConversationState,
  ProgrammingGenerateFormData,
  ProgrammingPrototypeFormData,
  SnapshotState,
} from 'course/assessment/pages/AssessmentGenerate/types';
import {
  buildProgrammingGenerateRequestPayload,
  buildPrototypeFromProgrammingQuestionData,
  extractQuestionPrototypeData,
  replaceUnlockedPrototypeFields,
} from 'course/assessment/pages/AssessmentGenerate/utils';
import { generationActions as actions } from 'course/assessment/reducers/generation';
import { setNotification } from 'lib/actions';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import {
  fetchCodaveriLanguages,
  fetchEdit,
  generate,
} from '../../../question/programming/operations';
import {
  defaultProgrammingGenerateFormData,
  defaultProgrammingPrototypeFormData,
} from '../constants';

import GenerateProgrammingExportDialog from './GenerateProgrammingExportDialog';

const translations = defineMessages({
  generatePage: {
    id: 'course.assessment.generation.generatePage',
    defaultMessage: 'Generate Programming Question',
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
  sourceLanguageNotSupported: {
    id: 'course.assessment.generation.sourceLanguageNotSupported',
    defaultMessage:
      'Source question language not supported by the generation tool.',
  },
  allFieldsLocked: {
    id: 'course.assessment.generation.allFieldsLocked',
    defaultMessage: 'All fields are locked, so nothing can be generated.',
  },
});

const areObjectArraysEqual = <T extends object>(
  array1?: T[],
  array2?: T[],
): boolean =>
  (array1 === undefined && array2 === undefined) ||
  (array1 !== undefined &&
    array2 !== undefined &&
    array1.length === array2.length &&
    // compare each element to see if any are different
    array1
      .map((_, index) =>
        Object.keys(array1[index])?.every(
          (key) => array1[index][key] === array2[index][key],
        ),
      )
      .every((p) => p));

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
    'testUi.metadata.solution':
      oldState.testUi.metadata.solution === newState.testUi.metadata.solution,
    'testUi.metadata.submission':
      oldState.testUi.metadata.submission ===
      newState.testUi.metadata.submission,
    'testUi.metadata.testCases.public': areObjectArraysEqual(
      oldState.testUi.metadata.testCases.public,
      newState.testUi.metadata.testCases.public,
    ),
    'testUi.metadata.testCases.private': areObjectArraysEqual(
      oldState.testUi.metadata.testCases.private,
      newState.testUi.metadata.testCases.private,
    ),
    'testUi.metadata.testCases.evaluation': areObjectArraysEqual(
      oldState.testUi.metadata.testCases.evaluation,
      newState.testUi.metadata.testCases.evaluation,
    ),
  };
};

const codaveriValidationSchema = yup.object({
  customPrompt: yup.string().min(1).max(500),
  languageId: yup.number().positive(),
});

const GenerateProgrammingQuestionPage = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id)
    throw new Error(
      `GenerateProgrammingQuestionPage was loaded with ID: ${id}.`,
    );

  const [searchParams] = useSearchParams();
  const sourceId =
    parseInt(searchParams.get('source_question_id') ?? '', 10) || undefined;
  const sourceDataInitializedRef = useRef<boolean>(false);

  const dispatch = useAppDispatch();
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const generatePageData = useAppSelector(getAssessmentGenerateQuestionsData);

  // Initialize generation state with programming questionType
  useEffect(() => {
    dispatch(actions.initializeGeneration({ questionType: 'programming' }));
  }, []);

  const { t } = useTranslation();
  // upper form (submit to Codaveri)
  const codaveriForm = useForm<ProgrammingGenerateFormData>({
    defaultValues: defaultProgrammingGenerateFormData,
    resolver: yupResolver(codaveriValidationSchema),
  });
  const currentLanguageId = codaveriForm.watch('languageId');

  // lower form (populate to new programming question page)
  // TODO: We reuse ProgrammingFormData object here because test case UI mandates it.
  // Consider reworking type declarations in TestCases.tsx to enable creating an independent model class here.
  const prototypeForm = useForm({
    defaultValues: defaultProgrammingPrototypeFormData,
  });
  const questionFormData = prototypeForm.watch();

  const defaultLockStates = {
    'question.title': false,
    'question.description': false,
    'testUi.metadata.solution': false,
    'testUi.metadata.submission': false,
    'testUi.metadata.prepend': false,
    'testUi.metadata.append': false,
    'testUi.metadata.testCases.public': false,
    'testUi.metadata.testCases.private': false,
    'testUi.metadata.testCases.evaluation': false,
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
  const getActiveCodaveriFormData = (): ProgrammingGenerateFormData =>
    JSON.parse(JSON.stringify(codaveriForm.getValues()));

  const getActivePrototypeFormData = (): ProgrammingPrototypeFormData =>
    JSON.parse(JSON.stringify(prototypeForm.getValues()));

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
    let languageId = 0;
    if (
      snapshot?.generateFormData &&
      'languageId' in snapshot.generateFormData
    ) {
      languageId = snapshot.generateFormData.languageId;
    }
    if (languageId === 0 && typeof currentLanguageId === 'number')
      languageId = currentLanguageId;
    if (snapshot) {
      dispatch(
        actions.setActiveConversationId({ conversationId: conversation.id }),
      );
      dispatch(
        actions.setActiveFormTitle({
          title: conversation.activeSnapshotEditedData.question.title,
        }),
      );
      codaveriForm.reset({ ...defaultProgrammingGenerateFormData, languageId });
      prototypeForm.reset(conversation.activeSnapshotEditedData);
      setLockStates(snapshot.lockStates);
    }
  };

  const createConversation = (): void => {
    dispatch(actions.createConversation({ questionType: 'programming' }));
    dispatch((_, getState) => {
      const newState = getAssessmentGenerateQuestionsData(getState());
      const newConversationId =
        newState.conversationIds[newState.conversationIds.length - 1];
      switchToConversation(newState.conversations[newConversationId]);
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
    ProgrammingFormData | undefined
  > => {
    if (sourceId) {
      try {
        return fetchEdit(sourceId);
      } catch {
        dispatch(setNotification(t(translations.loadingSourceError)));
      }
    }
    return undefined;
  };

  const preloadData = async (): Promise<{
    languages: LanguageData[];
    sourceData?: ProgrammingFormData;
  }> => {
    const [languages, sourceData] = await Promise.all([
      fetchCodaveriLanguages(),
      fetchSourceData(),
    ]);
    return { languages, sourceData };
  };

  return (
    <Preload render={<LoadingIndicator />} while={preloadData}>
      {({ languages, sourceData }): JSX.Element => {
        const currentLanguageMode =
          languages.find((language) => language.id === currentLanguageId)
            ?.editorMode ?? 'python';
        // Only Java has inline code support, so we do not forward to Codaveri for other languages
        const isIncludingInlineCode = currentLanguageMode === 'java';

        if (sourceData && !sourceDataInitializedRef.current) {
          sourceDataInitializedRef.current = true;
          const isLanguageSupported = languages.some(
            (language) => language.id === sourceData.question.languageId,
          );
          if (!isLanguageSupported) {
            dispatch(
              setNotification(t(translations.sourceLanguageNotSupported)),
            );
          }
          dispatch(
            actions.setActiveFormTitle({ title: sourceData.question.title }),
          );
          prototypeForm.reset(
            buildPrototypeFromProgrammingQuestionData(sourceData),
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
                      <GenerateProgrammingConversation
                        activeSnapshotId={activeSnapshotId}
                        codaveriForm={codaveriForm}
                        languages={languages.map((l) => ({
                          label: l.name,
                          value: l.id,
                        }))}
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
                              codaveriForm.reset(snapshot.generateFormData);
                            }
                            if (snapshot.questionData) {
                              prototypeForm.reset(snapshot.questionData);
                            }
                            if (snapshot.lockStates) {
                              setLockStates(snapshot.lockStates);
                            }
                          }
                        }}
                        onGenerate={codaveriForm.handleSubmit(
                          (codaveriFormData): Promise<void> => {
                            if (
                              Object.values(lockStates).reduce(
                                (a, b) => a && b,
                                true,
                              )
                            ) {
                              dispatch(
                                setNotification(
                                  t(translations.allFieldsLocked),
                                ),
                              );
                              return Promise.resolve();
                            }
                            const newSnapshotId = Date.now().toString(16);
                            const conversationId =
                              generatePageData.activeConversationId;
                            dispatch(
                              actions.createSnapshot({
                                snapshotId: newSnapshotId,
                                parentId: activeSnapshotId,
                                generateFormData: getActiveCodaveriFormData(),
                                conversationId,
                                lockStates,
                              }),
                            );
                            return generate(
                              buildProgrammingGenerateRequestPayload(
                                codaveriFormData,
                                questionFormData,
                                isIncludingInlineCode,
                              ),
                            )
                              .then((response) => {
                                const responseQuestionFormData =
                                  extractQuestionPrototypeData(response.data);
                                const newQuestionFormData =
                                  replaceUnlockedPrototypeFields(
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
                                    conversationId ===
                                    currentActiveConversationId
                                  ) {
                                    codaveriForm.resetField('customPrompt', {
                                      defaultValue: '',
                                    });
                                    prototypeForm.reset(newQuestionFormData);
                                  } else {
                                    dispatch(
                                      setNotification(
                                        t(translations.generateSuccess, {
                                          title:
                                            newQuestionFormData.question.title,
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
                                    currentActiveConversationId ===
                                    conversationId
                                  ) {
                                    dispatch(
                                      actions.setActiveFormTitle({
                                        title:
                                          newQuestionFormData.question.title,
                                      }),
                                    );
                                  }
                                });
                              })
                              .catch((response) => {
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
                              });
                          },
                        )}
                        snapshots={activeConversationSnapshots}
                      />
                    )}
                </Grid>

                <Grid item lg={8} xs={12}>
                  <GenerateProgrammingPrototypeForm
                    editorMode={currentLanguageMode}
                    lockStates={lockStates}
                    onToggleLock={(lockStateKey: string) => {
                      setLockStates({
                        ...lockStates,
                        [lockStateKey]: !lockStates[lockStateKey],
                      });
                    }}
                    prototypeForm={prototypeForm}
                  />
                </Grid>
              </Grid>

              <Divider className="mt-8" />
            </Container>
            <GenerateProgrammingExportDialog
              languages={languages}
              open={exportDialogOpen}
              saveActiveFormData={saveActiveFormData}
              setOpen={setExportDialogOpen}
            />
          </>
        );
      }}
    </Preload>
  );
};

const handle = translations.generatePage;

export default Object.assign(GenerateProgrammingQuestionPage, { handle });
