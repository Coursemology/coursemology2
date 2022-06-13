import { FC, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import {
  BranchOptions,
  SkillBranchFormData,
  SkillFormData,
  SkillSettings,
} from 'types/course/assessment/skills/skills';
import { DialogTypes } from '../types';

interface Props {
  handleClose: (isDirty: boolean) => any;
  onSubmit: (data: any, setError: unknown) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues?: Object;
  settings: SkillSettings;
  branchOptions: BranchOptions[];
  dialogType: DialogTypes;
}

interface IFormInputs {
  title: string;
  description: string;
  skill_branch_id?: number;
}

const translations = defineMessages({
  branches: {
    id: 'course.assessment.skills.components.SkillForm.branches',
    defaultMessage: 'Skill Branch',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  skill_branch_id: yup.number().nullable(),
});

const SkillForm: FC<Props> = (props) => {
  const {
    handleClose,
    initialValues,
    onSubmit,
    setIsDirty,
    settings,
    branchOptions,
    dialogType,
  } = props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<IFormInputs>({
    defaultValues: initialValues,
    resolver: yupResolver<yup.AnyObjectSchema>(validationSchema),
  });

  useEffect(() => {
    if (setIsDirty) {
      if (isDirty) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [isDirty]);

  const disabled = isSubmitting;

  const actionButtons = (
    <div
      style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}
    >
      <Button
        color="primary"
        className="btn-cancel"
        disabled={disabled}
        key="skill-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      <Button
        color="primary"
        className="btn-submit"
        disabled={disabled || !isDirty}
        form="skill-form"
        key="skill-form-submit-button"
        type="submit"
      >
        <FormattedMessage {...formTranslations.submit} />
      </Button>
    </div>
  );

  return (
    <>
      <form
        encType="multipart/form-data"
        id="skill-form"
        noValidate
        onSubmit={handleSubmit((data) => {
          const newData = { title: data.title, description: data.description };
          switch (dialogType) {
            case DialogTypes.NewSkill:
              onSubmit(data as SkillFormData, setError);
              break;
            case DialogTypes.NewSkillBranch:
              onSubmit(newData as SkillBranchFormData, setError);
              break;
            case DialogTypes.EditSkill:
              onSubmit(data as SkillFormData, setError);
              break;
            case DialogTypes.EditSkillBranch:
              onSubmit(newData as SkillBranchFormData, setError);
              break;
            default:
              break;
          }
        })}
      >
        <ErrorText errors={errors} />
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={settings.headerTitle}
              // @ts-ignore: component is still written in JS
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
              variant="standard"
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormRichTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={settings.headerDescription}
              // @ts-ignore: component is still written in JS
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="standard"
            />
          )}
        />
        {(dialogType === DialogTypes.NewSkill ||
          dialogType === DialogTypes.EditSkill) && (
          <Controller
            name="skill_branch_id"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.branches} />}
                options={branchOptions}
              />
            )}
          />
        )}
        {actionButtons}
      </form>
    </>
  );
};

export default SkillForm;
