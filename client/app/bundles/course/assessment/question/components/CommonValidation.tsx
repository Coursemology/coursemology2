import { array, bool, number, object, string } from 'yup';

import translations from '../../translations';

const basicQuestionSchema = object({
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

export default basicQuestionSchema;
