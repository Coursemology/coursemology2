import { FC, ReactNode } from 'react';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { LockOpenOutlined, LockOutlined } from '@mui/icons-material';
import { Container, Divider, IconButton } from '@mui/material';

import EditorAccordion from 'course/assessment/question/programming/components/common/EditorAccordion';
import TestCases from 'course/assessment/question/programming/components/common/TestCases';
import { generationActions as actions } from 'course/assessment/reducers/generation';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { QuestionPrototypeFormData } from './types';

interface LockableSectionProps {
  onToggleLock: (key: string) => void;
  children: ReactNode;
  lockStateKey: string;
  lockState: boolean;
}

const LockableSection: FC<LockableSectionProps> = (props) => (
  <>
    <div className="flex flex-nowrap">
      <IconButton
        centerRipple={false}
        onClick={() => props.onToggleLock(props.lockStateKey)}
        sx={{
          margin: 1,
          borderRadius: 1,
          alignItems: 'start',
        }}
      >
        {props.lockState ? <LockOutlined /> : <LockOpenOutlined />}
      </IconButton>
      {props.children}
    </div>
    <Divider className="my-4" variant="middle" />
  </>
);

interface Props {
  prototypeForm: UseFormReturn<QuestionPrototypeFormData>;
  onToggleLock: (key: string) => void;
  lockStates: { [key: string]: boolean };
}

const GenerateQuestionPrototypeForm: FC<Props> = (props) => {
  const { prototypeForm, lockStates, onToggleLock } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { onChange } = prototypeForm.register('question.title', {
    onChange: (e) => {
      const title = e?.target?.value?.toString();
      if (title) dispatch(actions.setActiveFormTitle({ title }));
    },
  });

  return (
    <FormProvider {...prototypeForm}>
      <LockableSection
        lockState={lockStates['question.title']}
        lockStateKey="question.title"
        onToggleLock={onToggleLock}
      >
        <Controller
          control={prototypeForm.control}
          name="question.title"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={lockStates['question.title']}
              field={field}
              fieldState={fieldState}
              fullWidth
              label="Title"
              onChange={onChange}
              variant="filled"
            />
          )}
        />
      </LockableSection>
      <LockableSection
        lockState={lockStates['question.description']}
        lockStateKey="question.description"
        onToggleLock={onToggleLock}
      >
        <Container
          disableGutters
          maxWidth={false}
          sx={{ width: 'calc(100% - 50px)' }}
        >
          <Controller
            control={prototypeForm.control}
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
        </Container>
      </LockableSection>
      <LockableSection
        lockState={lockStates['testUi.metadata.submission']}
        lockStateKey="testUi.metadata.submission"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <Controller
            control={prototypeForm.control}
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
        </Container>
      </LockableSection>
      <LockableSection
        lockState={lockStates['testUi.metadata.solution']}
        lockStateKey="testUi.metadata.solution"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <Controller
            control={prototypeForm.control}
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
        </Container>
      </LockableSection>
      <LockableSection
        lockState={lockStates['testUi.metadata.testCases.public']}
        lockStateKey="testUi.metadata.testCases.public"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <TestCases
            disabled={lockStates['testUi.metadata.testCases.public']}
            name="testUi.metadata.testCases.public"
            title={t(translations.publicTestCases)}
          />
        </Container>
      </LockableSection>
      <LockableSection
        lockState={lockStates['testUi.metadata.testCases.private']}
        lockStateKey="testUi.metadata.testCases.private"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <TestCases
            disabled={lockStates['testUi.metadata.testCases.private']}
            name="testUi.metadata.testCases.private"
            subtitle={t(translations.privateTestCasesHint)}
            title={t(translations.privateTestCases)}
          />
        </Container>
      </LockableSection>

      <LockableSection
        lockState={lockStates['testUi.metadata.testCases.evaluation']}
        lockStateKey="testUi.metadata.testCases.evaluation"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <TestCases
            disabled={lockStates['testUi.metadata.testCases.evaluation']}
            name="testUi.metadata.testCases.evaluation"
            subtitle={t(translations.evaluationTestCasesHint)}
            title={t(translations.evaluationTestCases)}
          />
        </Container>
      </LockableSection>
    </FormProvider>
  );
};

export default GenerateQuestionPrototypeForm;
