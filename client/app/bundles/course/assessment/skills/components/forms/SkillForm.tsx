import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import {
  SkillBranchOptions,
  SkillFormData,
} from 'types/course/assessment/skills/skills';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

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
      editing={false}
      formName="skill-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      title={title}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.title)}
                required
                variant="standard"
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={formState.isSubmitting}
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
          {(dialogType === DialogTypes.NewSkill ||
            dialogType === DialogTypes.EditSkill) && (
            <Controller
              control={control}
              name="skillBranchId"
              render={({ field, fieldState }): JSX.Element => (
                <FormSelectField
                  disabled={formState.isSubmitting}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.branches)}
                  noneSelected={t(translations.noneSelected)}
                  options={skillBranchOptions}
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
