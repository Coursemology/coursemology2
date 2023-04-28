import { bool, number } from 'yup';

import translations from '../../../translations';
import { commonQuestionFieldsValidation } from '../../components/CommonQuestionFields';

const questionSchema = commonQuestionFieldsValidation.shape({
  maxPosts: number()
    .required()
    .min(0, translations.mustSpecifyPositiveMaximumPosts)
    .typeError(translations.mustSpecifyMaximumPosts),
  hasTextResponse: bool(),
});

export default questionSchema;
