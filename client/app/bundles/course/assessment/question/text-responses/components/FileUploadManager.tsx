import { Controller, useFormContext } from 'react-hook-form';
import { RadioGroup } from '@mui/material';
import {
  AttachmentType,
  TextResponseQuestionFormData,
} from 'types/course/assessment/question/text-responses';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface Props {
  isTextResponseQuestion: boolean;
  disabled: boolean;
}

const FileUploadManager = (props: Props): JSX.Element => {
  const { disabled, isTextResponseQuestion } = props;
  const { t } = useTranslation();

  const { control, watch } = useFormContext<TextResponseQuestionFormData>();

  return (
    <>
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
              value="multiple_file_attachments"
            />
          </RadioGroup>
        )}
      />

      {watch('attachmentType') !== AttachmentType.NO_ATTACHMENT && (
        <div className="mt-5">
          <Controller
            control={control}
            name="isAttachmentRequired"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.isAttachmentRequired)}
              />
            )}
          />
        </div>
      )}

      {watch('attachmentType') === AttachmentType.MULTIPLE_FILE_ATTACHMENTS && (
        <div className="mt-5">
          <Controller
            control={control}
            name="maxAttachments"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                className="w-1/2"
                disabled={disabled}
                disableMargins
                field={field}
                fieldState={fieldState}
                label={t(translations.maxAttachment)}
                type="number"
                variant="filled"
              />
            )}
          />
        </div>
      )}
    </>
  );
};

export default FileUploadManager;
