import { useState } from 'react';
import { produce } from 'immer';
import {
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import translations from '../../translations';

import { Box, Divider, RadioGroup } from '@mui/material';
import buildFormData, { buildGenerateFormData } from './commons/builder';
import { create, fetchEdit, fetchNew, generate, update } from './operations';
import ProgrammingForm from './ProgrammingForm';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Form, { FormEmitter } from 'lib/components/form/Form';
import { Controller, FieldArrayPath, FormProvider, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Section from 'lib/components/core/layouts/Section';
import FormTextField from 'lib/components/form/fields/TextField';
import { LockOpenOutlined, LockOutlined, Redo, Undo } from '@mui/icons-material';
import { Container, IconButton, Typography } from '@mui/material';
import Subsection from 'lib/components/core/layouts/Subsection';
import EditorAccordion from './components/common/EditorAccordion';
import TestCases from './components/common/TestCases';

import FormSelectField from 'lib/components/form/fields/SelectField';
import IconRadio from 'lib/components/core/buttons/IconRadio';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';
import { FetchAssessmentData, isAuthenticatedAssessmentData } from 'types/course/assessment/assessments';
import { fetchAssessment } from 'course/assessment/operations/assessments';

export type PublishTime = 'now' | 'later';

const CODAVERI_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = typeof CODAVERI_DIFFICULTIES[number];

const ibsx = {
  margin: 1,
  borderRadius: 1,
  alignItems: 'start',
};

const GenerateProgrammingQuestionPage = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id) throw new Error(`AssessmentShow was loaded with ID: ${id}.`);

  const fetchAssessmentWithId = (): Promise<FetchAssessmentData> =>
    fetchAssessment(id);

  const navigate = useNavigate();
  const { t } = useTranslation();
  // upper form (submit to Codaveri)
  const { control, handleSubmit, watch } = useForm({ defaultValues: { languageId: 0, customPrompt: '', difficulty: 'easy' } });

  const languageId = watch('languageId');
  // lower form (populate to new programming question page)
  // TODO: We reuse ProgrammingFormData object here because test case UI mandates it.
  // Consider reworking type declarations in TestCases.tsx to enable creating an independent model class here.
  const methods = useForm<ProgrammingFormData>({ 
    defaultValues: {
    question: {
      title: '',
      description: '',
    },
    testUi: {
      metadata: {
        solution: '',
        submission: '',
        testCases: {
          public: [],
          private: [],
          evaluation: [],
        },
      }
    },
  } });
  const questionFormData = methods.watch();
  const questionFormTouched = Object.keys(methods.formState.touchedFields).length > 0 || methods.formState.isDirty;

  const [lockStates, setLockStates] = useState<{ [name: string]: boolean }>({
    'question.title': false,
    'question.description': false,
    'testUi.metadata.solution': false,
    'testUi.metadata.submission': false,
    'testUi.metadata.testCases.public': false,
    'testUi.metadata.testCases.private': false,
    'testUi.metadata.testCases.evaluation': false,
  });

  const setQuestionFieldIfUnlocked = (lockStateKey: string, newValue) => {
    if (!lockStates[lockStateKey] && newValue !== null && newValue !== undefined) {
      methods.setValue(lockStateKey as FieldArrayPath<ProgrammingFormData>, newValue);
    }
  }

  const [isGenerating, setIsGenerating] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const renderActionButtons = () => (
    <div className="flex flex-nowrap">
    <Button
      disabled={isGenerating || languageId === 0}
      startIcon={
        isGenerating && (
          <LoadingIndicator bare size={20} />
        )
      }
      onClick={handleSubmit((codaveriFormData) => {
        setIsGenerating(true);
        return generate(buildGenerateFormData(codaveriFormData, questionFormData)).then((response: any) => {
          console.log(response);
          setQuestionFieldIfUnlocked('question.title', response?.title);
          setQuestionFieldIfUnlocked('question.description', response?.description);
          const prefix = response?.resources?.[0]?.templates[0]?.prefix;
          setQuestionFieldIfUnlocked('testUi.metadata.submission', [prefix, response?.resources?.[0]?.templates[0]?.content].join('\n'));
          setQuestionFieldIfUnlocked('testUi.metadata.solution', [prefix, response?.resources?.[0]?.solutions?.[0]?.files?.[0]?.content].join('\n'));
          setQuestionFieldIfUnlocked('testUi.metadata.testCases.public', response?.resources?.[0]?.exprTestcases?.filter(testCase => testCase?.visibility === 'public')?.map(testCase => ({ expression: testCase.expression, expected: "True", hint: testCase.hint })));
          setQuestionFieldIfUnlocked('testUi.metadata.testCases.private', response?.resources?.[0]?.exprTestcases?.filter(testCase => testCase?.visibility === 'private')?.map(testCase => ({ expression: testCase.expression, expected: "True", hint: testCase.hint })));
          setQuestionFieldIfUnlocked('testUi.metadata.testCases.evaluation', response?.resources?.[0]?.exprTestcases?.filter(testCase => testCase?.visibility === 'evaluation')?.map(testCase => ({ expression: testCase.expression, expected: "True", hint: testCase.hint })));
          setIsGenerating(false);
        }).catch((response) => {
          setIsGenerating(false);
        });
      })}
      variant='contained'
      sx={{ width: '100px' }}
    >
      {questionFormTouched ? 'Refine' : 'Generate'}
    </Button>

          <IconButton
            disabled={false}
            className='ml-4'
          >
            <Undo />
          </IconButton>

<IconButton
  disabled={false}
  className='ml-2'
>
  <Redo />
</IconButton>
        <Box sx={{ flex: '1', width: '100%' }} />
          <Button
            disabled={false}
            onClick={() => setOpenConfirmation(true)}
            variant='contained'
          >
            Finish
          </Button>
    </div>
  );

  const renderLockableSection = (lockStateKey: string, content: JSX.Element) => (
    <>
    <div className="flex flex-nowrap">
      <IconButton
        onClick={() => setLockStates({ ...lockStates, [lockStateKey]: !lockStates[lockStateKey] })}
        centerRipple={false}
        sx={{
          margin: 1,
          borderRadius: 1,
          alignItems: 'start',
        }}
      >
        {lockStates[lockStateKey] ? <LockOutlined /> : <LockOpenOutlined />}
      </IconButton>
      {content}
    </div>
    <Divider variant='middle' className="my-4" />
    </>
  )

  return (
    // TODO: Update these queries to return only data needed for this page, instead of the full objects.
    <Preload render={<LoadingIndicator />} while={() => Promise.all([fetchAssessmentWithId(), fetchNew()])}>
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
                label={questionFormTouched ? "How can we help you refine the question? Locked fields will not be modified." : "Briefly describe the question you want to create here."}
                variant="standard"
              />
            )}
          />


<Controller
            control={control}
            name="languageId"
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                disabled={isGenerating}
                className={'mt-3 mx-0'}
                label={'Language'}
                options={data.languages.map((l) => ({ label: l.name, value: l.id}))}
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
                  <Typography variant='subtitle2' sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}> Difficulty </Typography>
                  {CODAVERI_DIFFICULTIES.map(difficulty =>
                    <IconRadio
                      disabled={isGenerating}
                      iconClassName="py-0"
                      label={difficulty.charAt(0).toUpperCase() + difficulty.substring(1)}
                      value={difficulty}
                    />
                  )}
                </div>
              </RadioGroup>
            )}
            />
          {renderActionButtons()}
    <Divider sx={{ opacity: 0.8, borderBottomWidth: 2, borderColor: 'rgba(0, 0, 0, 0.3)'}} className="my-4" />

          <FormProvider {...methods}>
          {renderLockableSection('question.title', 
            <Controller
              control={methods.control}
              name={'question.title'}
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={lockStates['question.title']}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={'Title'}
                  variant="filled"
                />
              )}
            />)}

{renderLockableSection('question.description', 
            <Container sx={{ width: 'calc(100% - 50px)'}} maxWidth={false} disableGutters>
              <Controller
                control={methods.control}
                name={'question.description'}
                render={({ field, fieldState }): JSX.Element => (
                  <FormRichTextField
                    disabled={lockStates['question.description']}
                    field={field}
                    fullWidth
                    fieldState={fieldState}
                    InputLabelProps={{
                      shrink: true, 
                    }}
                    label={"Description"}
                    variant="standard"
                  />
                )}
              />
            </Container>
          )}

{renderLockableSection('question.metadata.submission', 
            <Container maxWidth={false} disableGutters>
              <Controller
                control={methods.control}
                name={'testUi.metadata.submission'}
                render={({ field }): JSX.Element => (
                  <EditorAccordion
                    language='python'
                    disabled={lockStates['question.metadata.submission']}
                    title={t(translations.template)}
                    subtitle={t(translations.templateHint)}
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value ?? ''}
                  />
                )}
              />
            </Container>)}

            {renderLockableSection('question.metadata.solution', 
  <Container maxWidth={false} disableGutters>
    <Controller
      control={methods.control}
      name={'testUi.metadata.solution'}
      render={({ field }): JSX.Element => (
        <EditorAccordion
          language='python'
          disabled={lockStates['question.metadata.solution']}
          title={t(translations.solution)}
          subtitle={t(translations.solutionHint)}
          name={field.name}
          onChange={field.onChange}
          value={field.value ?? ''}
        />
      )}
    />
  </Container>)}

  {renderLockableSection('testUi.metadata.testCases.public', 
            <Container maxWidth={false} disableGutters>
              <TestCases
                disabled={lockStates['testUi.metadata.testCases.public']}
                name="testUi.metadata.testCases.public"
                title={t(translations.publicTestCases)}
              />
            </Container>)}

{renderLockableSection('testUi.metadata.testCases.private', 
          <Container maxWidth={false} disableGutters>
            <TestCases
              disabled={lockStates['testUi.metadata.testCases.private']}
              name="testUi.metadata.testCases.private"
              title={t(translations.privateTestCases)}
              subtitle={t(translations.privateTestCasesHint)}
            />
          </Container>)}

{renderLockableSection('testUi.metadata.testCases.evaluation', 
          <Container maxWidth={false} disableGutters>
            <TestCases
              disabled={lockStates['testUi.metadata.testCases.evaluation']}
              name="testUi.metadata.testCases.evaluation"
              title={t(translations.evaluationTestCases)}
              subtitle={t(translations.evaluationTestCasesHint)}
            />
          </Container>)}
      </FormProvider>
        <Prompt
          contentClassName="space-y-4"
          disabled={false}
          onClickPrimary={() => {
            setOpenConfirmation(false); 
            // redirect to new pq page with data
            if (isAuthenticatedAssessmentData(assessment) && assessment?.newQuestionUrls) {
              const newProgrammingQuestionUrl = assessment.newQuestionUrls.find(url => url.type === 'Programming')?.url;
              navigate(newProgrammingQuestionUrl!, { state: Object.assign({}, questionFormData, { 
                question: { 
                  title: questionFormData.question.title,
                  description: questionFormData.question.description,
                  languageId }
                })});
            } 
          }}
          onClose={() => setOpenConfirmation(false)}
          open={openConfirmation}
          primaryDisabled={false}
          primaryLabel={'Finish'}
          title={'Finish Question Generation'}
        >
          <PromptText>{'You will be taken to the standard programming question creation form. Codaveri will no longer be able to assist you. Are you sure you wish to finish question generation?'}</PromptText>
        </Prompt>
      </>
      )}
    </Preload>
  );
};

const handle = 'Generate Programming Question';

export default Object.assign(GenerateProgrammingQuestionPage, { handle });
