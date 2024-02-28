import { Control, Controller, UseFormWatch } from 'react-hook-form';
import { RadioGroup } from '@mui/material';
import {
  AttachmentType,
  TextResponseQuestionFormData,
} from 'types/course/assessment/question/text-responses';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface Props {
  isTextResponseQuestion: boolean;
  disabled: boolean;
  control: Control<TextResponseQuestionFormData>;
  watch: UseFormWatch<TextResponseQuestionFormData>;
}

const FileUploadManager = (props: Props): JSX.Element => {
  const { control, watch, disabled, isTextResponseQuestion } = props;
  const { t } = useTranslation();

  return (
    <Section
      sticksToNavbar
      subtitle={t(translations.fileUploadDescription)}
      title={t(translations.fileUpload)}
    >
      <Subsection
        subtitle={t(translations.attachmentSettingsDescription)}
        title={t(translations.attachmentSettings)}
      >
        <Controller
          control={control}
          name="attachmentType"
          render={({ field }): JSX.Element => (
            <RadioGroup className="space-y-5" {...field}>
              {isTextResponseQuestion && (
                <RadioButton
                  description={t(translations.noAttachmentDescription)}
                  disabled={disabled}
                  label={t(translations.noAttachment)}
                  value="no_attachment"
                />
              )}
              <RadioButton
                description={t(translations.singleFileAttachmentDescription)}
                disabled={disabled}
                label={t(translations.singleFileAttachment)}
                value="single_file_attachment"
              />
              <RadioButton
                description={t(translations.multipleFileAttachmentDescription)}
                disabled={disabled}
                label={t(translations.multipleFileAttachment)}
                value="multiple_file_attachment"
              />
            </RadioGroup>
          )}
        />

        {watch('attachmentType') !== AttachmentType.NO_ATTACHMENT && (
          <div className="mt-5">
            <Controller
              control={control}
              name="requireAttachment"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  disabled={disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.requireAttachment)}
                />
              )}
            />
          </div>
        )}
      </Subsection>
    </Section>
  );
};

export default FileUploadManager;
