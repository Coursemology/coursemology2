import { FC, useMemo } from 'react';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Container } from '@mui/material';

import { generationActions as actions } from 'course/assessment/reducers/generation';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import {
  mcqAdapter,
  mrqAdapter,
} from '../../../question/multiple-responses/commons/translationAdapter';
import OptionsManager, {
  OptionsManagerRef,
} from '../../../question/multiple-responses/components/OptionsManager';
import LockableSection from '../LockableSection';
import { LockStates, McqMrqPrototypeFormData } from '../types';

const translations = defineMessages({
  title: {
    id: 'course.assessment.question.multipleResponses.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.assessment.question.multipleResponses.description',
    defaultMessage: 'Description',
  },
  alwaysGradeAsCorrect: {
    id: 'course.assessment.question.multipleResponses.alwaysGradeAsCorrect',
    defaultMessage: 'Always grade as correct',
  },
});

interface Props {
  form: UseFormReturn<McqMrqPrototypeFormData>;
  lockStates: LockStates;
  onToggleLock: (key: string) => void;
  optionsRef: React.RefObject<OptionsManagerRef>;
  onOptionsDirtyChange: (isDirty: boolean) => void;
  isMultipleChoice: boolean;
}

const GenerateMcqMrqPrototypeForm: FC<Props> = (props) => {
  const {
    form,
    lockStates,
    onToggleLock,
    optionsRef,
    onOptionsDirtyChange,
    isMultipleChoice,
  } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { onChange } = form.register('question.title', {
    onChange: (e) => {
      const title = e?.target?.value?.toString() || '';
      dispatch(actions.setActiveFormTitle({ title }));
    },
  });

  const adapter = isMultipleChoice ? mcqAdapter(t) : mrqAdapter(t);

  // Mark all options as drafts for immediate deletion in generation page
  // Memoize to prevent unnecessary re-renders of OptionsManager
  const draftOptions = useMemo(() => {
    const options = form.watch('options') || [];
    return options.map((option) => ({
      ...option,
      draft: true,
    }));
  }, [form.watch('options')]);

  return (
    <FormProvider {...form}>
      <LockableSection
        lockState={lockStates['question.title']}
        lockStateKey="question.title"
        onToggleLock={onToggleLock}
      >
        <Controller
          control={form.control}
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
            control={form.control}
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
        lockState={lockStates['question.skipGrading']}
        lockStateKey="question.skipGrading"
        onToggleLock={onToggleLock}
      >
        <div className="my-4">
          <Controller
            control={form.control}
            name="question.skipGrading"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={lockStates['question.skipGrading']}
                field={field}
                fieldState={fieldState}
                label={t(translations.alwaysGradeAsCorrect)}
              />
            )}
          />
        </div>
      </LockableSection>

      <LockableSection
        lockState={lockStates['question.options']}
        lockStateKey="question.options"
        onToggleLock={onToggleLock}
      >
        <Container
          className="w-[calc(100%_-_4rem)]"
          disableGutters
          maxWidth={false}
        >
          <div className="my-4 space-y-4">
            <OptionsManager
              ref={optionsRef}
              adapter={adapter}
              allowRandomization={form.watch('question.randomizeOptions')}
              disabled={lockStates['question.options']}
              for={draftOptions}
              hideCorrect={form.watch('question.skipGrading')}
              onDirtyChange={onOptionsDirtyChange}
            />
          </div>
        </Container>
      </LockableSection>
    </FormProvider>
  );
};

export default GenerateMcqMrqPrototypeForm;
