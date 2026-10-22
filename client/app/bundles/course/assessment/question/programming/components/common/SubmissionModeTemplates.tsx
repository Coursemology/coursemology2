import { Controller, useFormContext } from 'react-hook-form';
import { RadioGroup } from '@mui/material';
import {
  LanguageMode,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Subsection from 'lib/components/core/layouts/Subsection';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';

import ControlledEditor from './ControlledEditor';
import DataFilesAccordion from './DataFilesAccordion';

interface SubmissionModeTemplatesProps {
  language: LanguageMode;
  disabled?: boolean;
}

/**
 * The submission template and solution, as code or as uploaded files. The choice between them is
 * offered only for languages whitelisted for multiple file submission.
 */
const SubmissionModeTemplates = (
  props: SubmissionModeTemplatesProps,
): JSX.Element => {
  const { t } = useTranslation();

  const { control, watch } = useFormContext<ProgrammingFormData>();

  const { question, languages } = useProgrammingFormDataContext();

  const languageId = watch('question.languageId');
  const submitAsFile = watch('testUi.metadata.submitAsFile');

  const language = languages.find(({ id }) => id === Number(languageId));

  const codeEditors = (
    <>
      <ControlledEditor.Template
        disabled={props.disabled}
        language={props.language}
      />
      <ControlledEditor.Solution
        disabled={props.disabled}
        language={props.language}
      />
    </>
  );

  if (!language?.whitelists.multipleFileSubmission) return codeEditors;

  const modeLocked = question.hasSubmissions || props.disabled;

  return (
    <>
      <Subsection
        subtitle={t(translations.templateModeHint)}
        title={t(translations.templateMode)}
      >
        <Controller
          control={control}
          name="testUi.metadata.submitAsFile"
          render={({ field: { value, onChange } }): JSX.Element => (
            <RadioGroup
              className="space-y-5"
              onChange={(e): void => onChange(e.target.value === 'file')}
              value={value ? 'file' : 'code'}
            >
              <RadioButton
                className="my-0"
                description={t(translations.codeSubmissionHint)}
                disabled={modeLocked}
                label={t(translations.codeSubmission)}
                value="code"
              />

              <RadioButton
                className="my-0"
                description={t(translations.fileSubmissionHint)}
                disabled={modeLocked}
                label={t(translations.fileSubmission)}
                value="file"
              />
            </RadioGroup>
          )}
        />
      </Subsection>

      {submitAsFile ? (
        <>
          <DataFilesAccordion
            disabled={props.disabled}
            name="testUi.metadata.submissionFiles"
            subtitle={t(translations.templateHint)}
            title={t(translations.template)}
          />

          <DataFilesAccordion
            disabled={props.disabled}
            name="testUi.metadata.solutionFiles"
            subtitle={t(translations.solutionHint)}
            title={t(translations.solution)}
          />
        </>
      ) : (
        codeEditors
      )}
    </>
  );
};

export default SubmissionModeTemplates;
