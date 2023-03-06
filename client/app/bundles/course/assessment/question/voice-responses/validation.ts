import { array, number, object, string } from 'yup';

import translations from '../../translations';

const questionSchema = object({
  title: string().nullable(),
  description: string().nullable(),
  staffOnlyComments: string().nullable(),
  maximumGrade: number()
    .required()
    .min(0, translations.mustSpecifyPositiveMaximumGrade)
    .typeError(translations.mustSpecifyMaximumGrade),
  skillIds: array().of(number()),
});

export default questionSchema;
