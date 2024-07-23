import { useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
} from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LockOpenOutlined,
  LockOutlined,
  Redo,
  Undo,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Container,
  Divider,
  IconButton,
  RadioGroup,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import {
  FetchAssessmentData,
  isAuthenticatedAssessmentData,
} from 'types/course/assessment/assessments';
import { MetadataTestCase, ProgrammingFormData } from 'types/course/assessment/question/programming';

import { fetchAssessment } from 'course/assessment/operations/assessments';
import IconRadio from 'lib/components/core/buttons/IconRadio';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { buildGenerateFormData } from './commons/builder';
import EditorAccordion from './components/common/EditorAccordion';
import TestCases from './components/common/TestCases';
import { fetchNew, generate } from './operations';

export type PublishTime = 'now' | 'later';

const CODAVERI_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof CODAVERI_DIFFICULTIES)[number];

type PrimitiveField = 'question.title' | 'question.description' | 'testUi.metadata.solution' | 'testUi.metadata.submission';
type ArrayField = 'testUi.metadata.testCases.public' | 'testUi.metadata.testCases.private' | 'testUi.metadata.testCases.evaluation';

const areObjectArraysEqual = <T extends object>(array1?: T[], array2?: T[]) =>
  (array1 === undefined && array2 === undefined) ||
  (array1 !== undefined && array2 !== undefined && array1.length === array2.length &&
  // compare each element to see if any are different
  array1.map((_, index) => 
    Object.keys(array1[index])?.every(key => array1[index][key] === array2[index][key])
  ).every(p => p));

const defaultQuestionFormData = {
  question: {
    title: '',
    description: '',
  },
  testUi: {
    metadata: {
      solution: '',
      submission: '',
      testCases: {
        public: [] as MetadataTestCase[],
        private: [] as MetadataTestCase[],
        evaluation: [] as MetadataTestCase[],
      },
    },
  },
};

const compareFormData = (oldState, newState): { [name: string]: boolean } => ({
  'question.title': oldState.question.title !== newState.question.title,
  'question.description': oldState.question.description !== newState.question.description,
  'testUi.metadata.solution': oldState.testUi.metadata.solution !== newState.testUi.metadata.solution,
  'testUi.metadata.submission': oldState.testUi.metadata.submission !== newState.testUi.metadata.submission,
  'testUi.metadata.testCases.public': !areObjectArraysEqual(oldState.testUi.metadata.testCases.public, newState.testUi.metadata.testCases.public),
  'testUi.metadata.testCases.private': !areObjectArraysEqual(oldState.testUi.metadata.testCases.private, newState.testUi.metadata.testCases.private),
  'testUi.metadata.testCases.evaluation': !areObjectArraysEqual(oldState.testUi.metadata.testCases.evaluation, newState.testUi.metadata.testCases.evaluation),
});

const GenerateProgrammingQuestionPage = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id) throw new Error(`AssessmentShow was loaded with ID: ${id}.`);

  const fetchAssessmentWithId = (): Promise<FetchAssessmentData> =>
    fetchAssessment(id);

  const navigate = useNavigate();
  const { t } = useTranslation();
  // upper form (submit to Codaveri)
  const { control, handleSubmit, watch } = useForm({
    defaultValues: { languageId: 0, customPrompt: '', difficulty: 'easy' },
  });

  const languageId = watch('languageId');
  // lower form (populate to new programming question page)
  // TODO: We reuse ProgrammingFormData object here because test case UI mandates it.
  // Consider reworking type declarations in TestCases.tsx to enable creating an independent model class here.
  const methods = useForm({ defaultValues: defaultQuestionFormData });
  const questionFormData = methods.watch();
  const questionFormTouched =
    Object.keys(methods.formState.touchedFields).length > 0 ||
    methods.formState.isDirty;

  const [undoStack, setUndoStack] = useState([JSON.parse(JSON.stringify(defaultQuestionFormData))]);
  const [undoPointer, setUndoPointer] = useState<number>(0);

  const questionFormDataEqual = () =>
    // if all false, return true
    Object.values(compareFormData(undoStack[undoPointer], questionFormData)).every(p => !p);

  const [lockStates, setLockStates] = useState<{ [name: string]: boolean }>({
    'question.title': false,
    'question.description': false,
    'testUi.metadata.solution': false,
    'testUi.metadata.submission': false,
    'testUi.metadata.testCases.public': false,
    'testUi.metadata.testCases.private': false,
    'testUi.metadata.testCases.evaluation': false,
  });

  const [updatedStates, setUpdatedStates] = useState<{ [name: string]: boolean }>({
    'question.title': false,
    'question.description': false,
    'testUi.metadata.solution': false,
    'testUi.metadata.submission': false,
    'testUi.metadata.testCases.public': false,
    'testUi.metadata.testCases.private': false,
    'testUi.metadata.testCases.evaluation': false,
  });

  const setQuestionPrimitiveFieldIfUnlocked = (lockStateKey: PrimitiveField, oldValue?: string | null, newValue?: string | null): boolean => {
    if (
      !lockStates[lockStateKey] &&
      newValue !== null &&
      newValue !== undefined
    ) {
      if (newValue !== oldValue) {
        methods.setValue<PrimitiveField>(
          lockStateKey,
          newValue,
        );
        return true;
      }
    }
    return false;
  };

  const setQuestionArrayFieldIfUnlocked = (lockStateKey: ArrayField, oldValue?: MetadataTestCase[], newValue?: MetadataTestCase[]): boolean => {
    if (
      !lockStates[lockStateKey] &&
      newValue !== null &&
      newValue !== undefined
    ) {
      if (!areObjectArraysEqual(oldValue, newValue)) {
        methods.setValue(
          lockStateKey,
          newValue,
        );
        return true;
      }
    }
    return false;
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const renderActionButtons = (): JSX.Element => (
    <div className="flex flex-nowrap">
      <Button
        disabled={isGenerating || languageId === 0}
        onClick={handleSubmit((codaveriFormData) => {
          setIsGenerating(true);
          return generate(
            buildGenerateFormData(codaveriFormData, questionFormData as ProgrammingFormData),
          )
            .then((response: any) => {
              const titleUpdated = setQuestionPrimitiveFieldIfUnlocked(
                'question.title',
                questionFormData.question.title,
                response?.title,
              );
              const descriptionUpdated = setQuestionPrimitiveFieldIfUnlocked(
                'question.description',
                questionFormData.question.description,
                response?.description,
              );
              const prefix = response?.resources?.[0]?.templates[0]?.prefix;
              const templateUpdated = setQuestionPrimitiveFieldIfUnlocked(
                'testUi.metadata.submission',
                questionFormData.testUi?.metadata.submission,
                [prefix, response?.resources?.[0]?.templates[0]?.content].join(
                  '\n',
                ),
              );
              const solutionUpdated = setQuestionPrimitiveFieldIfUnlocked(
                'testUi.metadata.solution',
                questionFormData.testUi?.metadata.solution,
                [
                  prefix,
                  response?.resources?.[0]?.solutions?.[0]?.files?.[0]?.content,
                ].join('\n'),
              );
              const publicTestCasesUpdated = setQuestionArrayFieldIfUnlocked(
                'testUi.metadata.testCases.public',
                questionFormData.testUi?.metadata.testCases.public,
                response?.resources?.[0]?.exprTestcases
                  ?.filter((testCase) => testCase?.visibility === 'public')
                  ?.map((testCase) => ({
                    expression: testCase.expression,
                    expected: 'True',
                    hint: testCase.hint,
                  })),
              );
              const privateTestCasesUpdated = setQuestionArrayFieldIfUnlocked(
                'testUi.metadata.testCases.private',
                questionFormData.testUi?.metadata.testCases.private,
                response?.resources?.[0]?.exprTestcases
                  ?.filter((testCase) => testCase?.visibility === 'private')
                  ?.map((testCase) => ({
                    expression: testCase.expression,
                    expected: 'True',
                    hint: testCase.hint,
                  })),
              );
              const evaluationTestCasesUpdated = setQuestionArrayFieldIfUnlocked(
                'testUi.metadata.testCases.evaluation',
                questionFormData.testUi?.metadata.testCases.evaluation,
                response?.resources?.[0]?.exprTestcases
                  ?.filter((testCase) => testCase?.visibility === 'evaluation')
                  ?.map((testCase) => ({
                    expression: testCase.expression,
                    expected: 'True',
                    hint: testCase.hint,
                  })),
              );
              // if any fields are different after all set operations, create a new undo stack item
              if (!questionFormDataEqual()) {
                setUpdatedStates({
                  'question.title': titleUpdated,
                  'question.description': descriptionUpdated,
                  'testUi.metadata.solution': solutionUpdated,
                  'testUi.metadata.submission': templateUpdated,
                  'testUi.metadata.testCases.public': publicTestCasesUpdated,
                  'testUi.metadata.testCases.private': privateTestCasesUpdated,
                  'testUi.metadata.testCases.evaluation': evaluationTestCasesUpdated,
                });
                setTimeout(() => {
                  setUndoStack([...undoStack.slice(0, undoPointer + 1), JSON.parse(JSON.stringify(questionFormData))]);
                  setUndoPointer(undoPointer + 1);
                }, 1);
              }
              setIsGenerating(false);
            })
            .catch((response) => {
              setIsGenerating(false);
            });
        })}
        startIcon={isGenerating && <LoadingIndicator bare size={20} />}
        sx={{ width: '100px' }}
        variant="contained"
      >
        {questionFormTouched ? 'Refine' : 'Generate'}
      </Button>

      <IconButton className="ml-4" disabled={questionFormDataEqual() && undoPointer === 0} onClick={() => {
        let undoCurrent = undoStack[undoPointer];
        if (questionFormDataEqual()) {
          undoCurrent = undoStack[undoPointer - 1];
          setUndoPointer(undoPointer - 1);
        }
        setUpdatedStates(compareFormData(questionFormData, undoCurrent));
        methods.reset(undoCurrent, { keepDirty: true, keepTouched: true });
      }}>
        <Undo />
      </IconButton>

      <IconButton className="ml-2" disabled={undoPointer === undoStack.length - 1} onClick={() => {
        const undoCurrent = undoStack[undoPointer + 1];
        setUndoPointer(undoPointer + 1);
        setUpdatedStates(compareFormData(questionFormData, undoCurrent));
        methods.reset(undoCurrent, { keepDirty: true, keepTouched: true });
      }}>
        <Redo />
      </IconButton>
      <Box sx={{ flex: '1', width: '100%' }} />
      <Button
        disabled={false}
        onClick={() => setOpenConfirmation(true)}
        variant="contained"
      >
        Finish
      </Button>
    </div>
  );

  const renderLockableSection = (
    lockStateKey: string,
    content: JSX.Element,
  ): JSX.Element => (
    <>
      <div className="flex flex-nowrap">
        <IconButton
          centerRipple={false}
          onClick={() => {
              setLockStates({
                ...lockStates,
                [lockStateKey]: !lockStates[lockStateKey],
              });
              setUpdatedStates({
                ...updatedStates,
                [lockStateKey]: false,
              });
            }
          }
          sx={{
            margin: 1,
            borderRadius: 1,
            alignItems: 'start',
          }}
        >
          <Badge
            badgeContent={' '}
            variant='dot'
            color="success"
            invisible={!updatedStates[lockStateKey]}
          >
            {lockStates[lockStateKey] ? <LockOutlined/> : <LockOpenOutlined />}
          </Badge>
        </IconButton>
        {content}
      </div>
      <Divider className="my-4" variant="middle" />
    </>
  );

  return (
    // TODO: Update these queries to return only data needed for this page, instead of the full objects.
    <Preload
      render={<LoadingIndicator />}
      while={() => Promise.all([fetchAssessmentWithId(), fetchNew()])}
    >
      {([assessment, data]): JSX.Element => (
        <>
          <Controller
            control={control}
            name="customPrompt"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={isGenerating}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={
                  questionFormTouched
                    ? 'How can we help you refine the question? Locked fields will not be modified.'
                    : 'Briefly describe the question you want to create here.'
                }
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="languageId"
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                className="mt-3 mx-0"
                disabled={isGenerating}
                field={field}
                fieldState={fieldState}
                label="Language"
                options={data.languages.map((l) => ({
                  label: l.name,
                  value: l.id,
                }))}
                required
                variant="outlined"
              />
            )}
          />

          <Controller
            control={control}
            name="difficulty"
            render={({ field }): JSX.Element => (
              <RadioGroup className="space-y-5" {...field}>
                <div className="flex space-x-3 max-sm:flex-col max-sm:space-x-0">
                  <Typography
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                    variant="subtitle2"
                  >
                    {' '}
                    Difficulty{' '}
                  </Typography>
                  {CODAVERI_DIFFICULTIES.map((difficulty) => (
                    <IconRadio
                      key={difficulty}
                      disabled={isGenerating}
                      iconClassName="py-0"
                      label={
                        difficulty.charAt(0).toUpperCase() +
                        difficulty.substring(1)
                      }
                      value={difficulty}
                    />
                  ))}
                </div>
              </RadioGroup>
            )}
          />
          {renderActionButtons()}
          <Divider
            className="my-4"
            sx={{
              opacity: 0.8,
              borderBottomWidth: 2,
              borderColor: 'rgba(0, 0, 0, 0.3)',
            }}
          />

          <FormProvider {...methods}>
            {renderLockableSection(
              'question.title',
              <Controller
                control={methods.control}
                name="question.title"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={lockStates['question.title']}
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    label="Title"
                    variant="filled"
                    onFocus={() => setUpdatedStates({ ...updatedStates, 'question.title': false })}
                  />
                )}
              />,
            )}

            {renderLockableSection(
              'question.description',
              <Container
                disableGutters
                maxWidth={false}
                sx={{ width: 'calc(100% - 50px)' }}
              >
                <Controller
                  control={methods.control}
                  name="question.description"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormRichTextField
                      disabled={lockStates['question.description']}
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      label="Description"
                      variant="standard"
                    />
                  )}
                />
              </Container>,
            )}

            {renderLockableSection(
              'testUi.metadata.submission',
              <Container disableGutters maxWidth={false}>
                <Controller
                  control={methods.control}
                  name="testUi.metadata.submission"
                  render={({ field }): JSX.Element => (
                    <EditorAccordion
                      disabled={lockStates['testUi.metadata.submission']}
                      language="python"
                      name={field.name}
                      onChange={field.onChange}
                      subtitle={t(translations.templateHint)}
                      title={t(translations.template)}
                      value={field.value ?? ''}
                    />
                  )}
                />
              </Container>,
            )}

            {renderLockableSection(
              'testUi.metadata.solution',
              <Container disableGutters maxWidth={false}>
                <Controller
                  control={methods.control}
                  name="testUi.metadata.solution"
                  render={({ field }): JSX.Element => (
                    <EditorAccordion
                      disabled={lockStates['testUi.metadata.solution']}
                      language="python"
                      name={field.name}
                      onChange={field.onChange}
                      subtitle={t(translations.solutionHint)}
                      title={t(translations.solution)}
                      value={field.value ?? ''}
                    />
                  )}
                />
              </Container>,
            )}

            {renderLockableSection(
              'testUi.metadata.testCases.public',
              <Container disableGutters maxWidth={false}>
                <TestCases
                  disabled={lockStates['testUi.metadata.testCases.public']}
                  name="testUi.metadata.testCases.public"
                  title={t(translations.publicTestCases)}
                />
              </Container>,
            )}

            {renderLockableSection(
              'testUi.metadata.testCases.private',
              <Container disableGutters maxWidth={false}>
                <TestCases
                  disabled={lockStates['testUi.metadata.testCases.private']}
                  name="testUi.metadata.testCases.private"
                  subtitle={t(translations.privateTestCasesHint)}
                  title={t(translations.privateTestCases)}
                />
              </Container>,
            )}

            {renderLockableSection(
              'testUi.metadata.testCases.evaluation',
              <Container disableGutters maxWidth={false}>
                <TestCases
                  disabled={lockStates['testUi.metadata.testCases.evaluation']}
                  name="testUi.metadata.testCases.evaluation"
                  subtitle={t(translations.evaluationTestCasesHint)}
                  title={t(translations.evaluationTestCases)}
                />
              </Container>,
            )}
          </FormProvider>
          <Prompt
            contentClassName="space-y-4"
            disabled={false}
            onClickPrimary={() => {
              setOpenConfirmation(false);
              // redirect to new pq page with data
              if (
                isAuthenticatedAssessmentData(assessment) &&
                assessment?.newQuestionUrls
              ) {
                const newProgrammingQuestionUrl =
                  assessment.newQuestionUrls.find(
                    (url) => url.type === 'Programming',
                  )?.url;
                navigate(newProgrammingQuestionUrl!, {
                  state: {
                    ...questionFormData,
                    question: {
                      title: questionFormData.question.title,
                      description: questionFormData.question.description,
                      languageId,
                    },
                  },
                });
              }
            }}
            onClose={() => setOpenConfirmation(false)}
            open={openConfirmation}
            primaryDisabled={false}
            primaryLabel="Finish"
            title="Finish Question Generation"
          >
            <PromptText>
              You will be taken to the standard programming question creation
              form. Codaveri will no longer be able to assist you. Are you sure
              you wish to finish question generation?
            </PromptText>
          </Prompt>
        </>
      )}
    </Preload>
  );
};

const handle = 'Generate Programming Question';

export default Object.assign(GenerateProgrammingQuestionPage, { handle });
