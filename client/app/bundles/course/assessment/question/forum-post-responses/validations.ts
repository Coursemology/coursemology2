import { bool, number } from 'yup';

import translations from '../../translations';
import { qnFormCommonFieldsValidation } from '../components/QuestionFormCommonFields';

const questionSchema = qnFormCommonFieldsValidation.shape({
  maxPosts: number()
    .required()
    .min(0, translations.mustSpecifyPositiveMaximumPosts)
    .typeError(translations.mustSpecifyMaximumPosts),
  hasTextResponse: bool(),
});

export default questionSchema;
