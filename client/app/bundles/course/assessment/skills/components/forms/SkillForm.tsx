import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import useTranslation from 'lib/hooks/useTranslation';
import {
  SkillBranchOptions,
  SkillFormData,
} from 'types/course/assessment/skills/skills';
import { DialogTypes } from '../../types';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (
    data: SkillFormData,
    setError: UseFormSetError<SkillFormData>,
  ) => void;
  initialValues: SkillFormData;
  skillBranchOptions: SkillBranchOptions[];
  dialogType: DialogTypes;
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
    open,
    title,
    onClose,
    initialValues,
    onSubmit,
    skillBranchOptions,
    dialogType,
  } = props;
  const { t } = useTranslation();

  const handleSubmit = (data, setError): void => {
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
  };

  return (
    <FormDialog
      open={open}
      editing={false}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      formName="skill-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.title)}
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
                disabled={formState.isSubmitting}
                label={t(translations.description)}
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
                  disabled={formState.isSubmitting}
                  label={t(translations.branches)}
                  options={skillBranchOptions}
                  noneSelected={t(translations.noneSelected)}
                />
              )}
            />
          )}
        </>
      )}
    </FormDialog>
  );
};

export default SkillForm;
