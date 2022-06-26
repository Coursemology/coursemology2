import { FC, useEffect } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
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
  SkillBranchOptions,
  SkillFormData,
} from 'types/course/assessment/skills/skills';
import { DialogTypes } from '../../types';

interface Props extends WrappedComponentProps {
  handleClose: (isDirty: boolean) => void;
  onSubmit: (data: SkillFormData, setError: unknown) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues?: Object;
  skillBranchOptions: SkillBranchOptions[];
  dialogType: DialogTypes;
}

interface IFormInputs {
  title: string;
  description: string;
  skillBranchId?: number;
}

const translations = defineMessages({
  branches: {
    id: 'course.assessment.skills.components.SkillForm.branches',
    defaultMessage: 'Skill Branch',
  },
  title: {
    id: 'course.assessment.skills.components.SkillForm.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'course.assessment.skills.components.SkillForm.description',
    defaultMessage: 'Description',
  },
  noneSelected: {
    id: 'course.assessment.skills.components.SkillForm.noneSelected',
    defaultMessage: 'Uncategorised Skills',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  skillBranchId: yup.string().nullable(),
});

const SkillForm: FC<Props> = (props) => {
  const {
    handleClose,
    initialValues,
    onSubmit,
    setIsDirty,
    skillBranchOptions,
    dialogType,
    intl,
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
          const skillBranchFormData = {
            title: data.title,
            description: data.description,
          };
          switch (dialogType) {
            case DialogTypes.NewSkill:
              onSubmit(data, setError);
              break;
            case DialogTypes.NewSkillBranch:
              onSubmit(skillBranchFormData, setError);
              break;
            case DialogTypes.EditSkill:
              onSubmit(data, setError);
              break;
            case DialogTypes.EditSkillBranch:
              onSubmit(skillBranchFormData, setError);
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
              label={<FormattedMessage {...translations.title} />}
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
              label={<FormattedMessage {...translations.description} />}
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
            name="skillBranchId"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.branches} />}
                options={skillBranchOptions}
                noneSelected={intl.formatMessage(translations.noneSelected)}
              />
            )}
          />
        )}
        {actionButtons}
      </form>
    </>
  );
};

export default injectIntl(SkillForm);
