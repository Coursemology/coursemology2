import { ElementType, FC } from 'react';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { Container } from '@mui/material';
import { LanguageMode } from 'types/course/assessment/question/programming';

import EditorAccordion from 'course/assessment/question/programming/components/common/EditorAccordion';
import ReorderableJavaTestCase from 'course/assessment/question/programming/components/common/ReorderableJavaTestCase';
import ReorderableTestCase, {
  ReorderableTestCaseProps,
} from 'course/assessment/question/programming/components/common/ReorderableTestCase';
import { generationActions as actions } from 'course/assessment/reducers/generation';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { CODAVERI_EVALUATOR_ONLY_LANGUAGES } from './constants';
import LockableSection from './LockableSection';
import TestCasesManager from './TestCasesManager';
import { LockStates, QuestionPrototypeFormData } from './types';

interface Props {
  prototypeForm: UseFormReturn<QuestionPrototypeFormData>;
  onToggleLock: (key: string) => void;
  lockStates: LockStates;
  editorMode: LanguageMode;
}

const TestCaseComponentMapper: Record<
  LanguageMode,
  ElementType<ReorderableTestCaseProps>
> = {
  python: ReorderableTestCase,
  java: ReorderableJavaTestCase,
  c_cpp: ReorderableTestCase,
  javascript: ReorderableTestCase,
  r: ReorderableTestCase,
  csharp: ReorderableTestCase,
  golang: ReorderableTestCase,
  rust: ReorderableTestCase,
  typescript: ReorderableTestCase,
};

const GenerateQuestionPrototypeForm: FC<Props> = (props) => {
  const { prototypeForm, lockStates, onToggleLock, editorMode } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { onChange } = prototypeForm.register('question.title', {
    onChange: (e) => {
      const title = e?.target?.value?.toString();
      if (title) dispatch(actions.setActiveFormTitle({ title }));
    },
  });
  // New languages supported by Codaveri only allow IO test cases.
  const isIOTestCaseLanguage =
    CODAVERI_EVALUATOR_ONLY_LANGUAGES.includes(editorMode);

  const TestCaseComponent = TestCaseComponentMapper[editorMode];
  const lhsHeader = isIOTestCaseLanguage
    ? t(translations.input)
    : t(translations.expression);
  const rhsHeader = isIOTestCaseLanguage
    ? t(translations.expectedOutput)
    : t(translations.expected);

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
              label={t(translations.title)}
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
          className="w-[calc(100%_-_4rem)]"
          disableGutters
          maxWidth={false}
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
                label={t(translations.description)}
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
                language={editorMode}
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
                language={editorMode}
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
        lockState={lockStates['testUi.metadata.prepend']}
        lockStateKey="testUi.metadata.prepend"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <Controller
            control={prototypeForm.control}
            name="testUi.metadata.prepend"
            render={({ field }): JSX.Element => (
              <EditorAccordion
                disabled={lockStates['testUi.metadata.prepend']}
                language={editorMode}
                name={field.name}
                onChange={field.onChange}
                subtitle={t(translations.prependHint)}
                title={t(translations.prepend)}
                value={field.value ?? ''}
              />
            )}
          />
        </Container>
      </LockableSection>
      <LockableSection
        lockState={lockStates['testUi.metadata.append']}
        lockStateKey="testUi.metadata.append"
        onToggleLock={onToggleLock}
      >
        <Container disableGutters maxWidth={false}>
          <Controller
            control={prototypeForm.control}
            name="testUi.metadata.append"
            render={({ field }): JSX.Element => (
              <EditorAccordion
                disabled={lockStates['testUi.metadata.append']}
                language={editorMode}
                name={field.name}
                onChange={field.onChange}
                subtitle={t(translations.appendHint)}
                title={t(translations.append)}
                value={field.value ?? ''}
              />
            )}
          />
        </Container>
      </LockableSection>

      <TestCasesManager
        component={TestCaseComponent}
        control={prototypeForm.control}
        lhsHeader={lhsHeader}
        lockStates={lockStates}
        onToggleLock={onToggleLock}
        rhsHeader={rhsHeader}
        setValue={prototypeForm.setValue}
      />
    </FormProvider>
  );
};

export default GenerateQuestionPrototypeForm;
