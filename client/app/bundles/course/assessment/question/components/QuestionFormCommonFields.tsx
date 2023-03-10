import { Control, Controller, FieldValues } from 'react-hook-form';
import { Alert } from '@mui/material';
import { QuestionFormData } from 'types/course/assessment/questions';
import { array, bool, number, object, string } from 'yup';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import SkillsAutocomplete from './SkillsAutocomplete';

export const qnFormCommonFieldsInitialValues: QuestionFormData = {
  title: '',
  description: '',
  staffOnlyComments: '',
  maximumGrade: '',
  skillIds: [],
};

export const qnFormCommonFieldsValidation = object({
  title: string().nullable(),
  description: string().nullable(),
  staffOnlyComments: string().nullable(),
  maximumGrade: number()
    .required()
    .min(0, translations.mustSpecifyPositiveMaximumGrade)
    .typeError(translations.mustSpecifyMaximumGrade),
  skipGrading: bool(),
  skillIds: array().of(number()),
});

interface CommonFieldsProps {
  disabled: boolean;
  control?: Control<FieldValues, unknown>;
  availableSkills?: Record<
    number,
    {
      id: number;
      title: string;
      description: string;
    }
  > | null;
  skillsUrl?: string;
}

const QuestionFormCommonFields = (props: CommonFieldsProps): JSX.Element => {
  const { disabled: submitting, control, availableSkills, skillsUrl } = props;

  const { t } = useTranslation();

  return (
    <>
      <Section sticksToNavbar title={t(translations.questionDetails)}>
        <Controller
          control={control}
          name="title"
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
            name="description"
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
          subtitle={t(translations.staffOnlyCommentsHint)}
          title={t(translations.staffOnlyComments)}
        >
          <Controller
            control={control}
            name="staffOnlyComments"
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
          name="maximumGrade"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={submitting}
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
            name="skillIds"
            render={({ field, fieldState: { error } }): JSX.Element => (
              <SkillsAutocomplete
                availableSkills={availableSkills}
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
                <Link href={skillsUrl} opensInNewTab>
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

export default QuestionFormCommonFields;
