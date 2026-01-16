import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { EditNote } from '@mui/icons-material';
import { Alert } from '@mui/material';
import {
  AvailableSkills,
  QuestionFormData,
} from 'types/course/assessment/questions';
import { array, bool, number, object, string } from 'yup';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import SkillsAutocomplete from './SkillsAutocomplete';

export const commonQuestionFieldsInitialValues: QuestionFormData = {
  title: '',
  description: '',
  staffOnlyComments: '',
  maximumGrade: '',
  skillIds: [],
};

export const commonQuestionFieldsValidation = object({
  title: string().nullable(),
  description: string().nullable(),
  staffOnlyComments: string().nullable(),
  maximumGrade: number()
    .required()
    .min(0, translations.mustSpecifyPositiveMaximumGrade)
    .lessThan(1000, translations.mustBeLessThanMaxMaximumGrade)
    .typeError(translations.mustSpecifyMaximumGrade),
  skipGrading: bool(),
  skillIds: array().of(number()),
});

interface CommonQuestionFieldsProps<T extends FieldValues>
  extends Partial<AvailableSkills> {
  disabled?: boolean;
  disableSettingMaxGrade?: boolean;
  control?: Control<T>;
  name?: FieldPath<T>;
}

const CommonQuestionFields = <T extends FieldValues>(
  props: CommonQuestionFieldsProps<T>,
): JSX.Element => {
  const {
    disabled: submitting,
    disableSettingMaxGrade,
    control,
    availableSkills,
    skillsUrl,
  } = props;

  const { t } = useTranslation();

  const prefix = props.name ? `${props.name}.` : '';

  return (
    <>
      <Section sticksToNavbar title={t(translations.questionDetails)}>
        <Controller
          control={control}
          name={`${prefix}title` as FieldPath<T>}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={submitting}
              field={field}
              fieldState={fieldState}
              fullWidth
              label={t(translations.title)}
              variant="filled"
            />
          )}
        />

        <Subsection title={t(translations.description)}>
          <Controller
            control={control}
            name={`${prefix}description` as FieldPath<T>}
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={submitting}
                field={field}
                fieldState={fieldState}
              />
            )}
          />
        </Subsection>

        <Subsection
          startIcon={<EditNote fontSize="small" />}
          subtitle={t(translations.staffOnlyCommentsHint)}
          title={t(translations.staffOnlyComments)}
        >
          <Controller
            control={control}
            name={`${prefix}staffOnlyComments` as FieldPath<T>}
            render={({ field, fieldState }): JSX.Element => (
              <FormRichTextField
                disabled={submitting}
                field={field}
                fieldState={fieldState}
              />
            )}
          />
        </Subsection>
      </Section>

      <Section sticksToNavbar title={t(translations.grading)}>
        <Controller
          control={control}
          name={`${prefix}maximumGrade` as FieldPath<T>}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={submitting || disableSettingMaxGrade}
              disableMargins
              field={field}
              fieldState={fieldState}
              fullWidth
              label={t(translations.maximumGrade)}
              required
              variant="filled"
            />
          )}
        />
      </Section>

      <Section
        sticksToNavbar
        subtitle={t(translations.skillsHint)}
        title={t(translations.skills)}
      >
        {availableSkills && (
          <Controller
            control={control}
            name={`${prefix}skillIds` as FieldPath<T>}
            render={({ field, fieldState: { error } }): JSX.Element => (
              <SkillsAutocomplete
                availableSkills={availableSkills}
                disabled={props.disabled}
                error={error}
                field={field}
              />
            )}
          />
        )}

        <Alert severity="info">
          {t(
            availableSkills
              ? translations.canConfigureSkills
              : translations.noSkillsCanCreateSkills,
            {
              url: (chunks) => (
                <Link opensInNewTab to={skillsUrl}>
                  {chunks}
                </Link>
              ),
            },
          )}
        </Alert>
      </Section>
    </>
  );
};

export default CommonQuestionFields;
