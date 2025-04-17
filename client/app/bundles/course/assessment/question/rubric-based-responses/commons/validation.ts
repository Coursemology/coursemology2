import { AnyObjectSchema, object } from 'yup';

import { Translated } from 'lib/hooks/useTranslation';

import { commonQuestionFieldsValidation } from '../../components/CommonQuestionFields';

const schema: Translated<AnyObjectSchema> = (_t) =>
  object({
    question: commonQuestionFieldsValidation,
  });

export default schema;
