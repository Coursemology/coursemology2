import {
  McqMrqFormData,
  OptionData,
} from 'types/course/assessment/question/multiple-responses';
import {
  AnySchema,
  array,
  bool,
  number,
  object,
  string,
  StringSchema,
  ValidationError,
} from 'yup';

import translations from '../../../translations';
import getIndexAndKeyPath from '../../commons/utils';
import { commonQuestionFieldsValidation } from '../../components/CommonQuestionFields';

export const questionSchema = commonQuestionFieldsValidation.shape({
  randomizeOptions: bool(),
});

const optionSchema = object({
  option: string().when('toBeDeleted', {
    is: true,
    then: string().notRequired(),
    otherwise: string().when(
      '$type',
      (type: McqMrqFormData['mcqMrqType'], schema: StringSchema) =>
        type === 'mcq'
          ? schema.required(translations.mustSpecifyChoice)
          : schema.required(translations.mustSpecifyResponse),
    ),
  }),
  weight: number().required(),
  correct: bool(),
  explanation: string().nullable(),
  ignoreRandomization: bool(),
  toBeDeleted: bool(),
});

const responsesSchema = array().of(optionSchema);

const AT_LEAST_ONE_CORRECT_CHOICE_ERROR_NAME = 'at-least-one-correct-choice';

const choicesSchema = responsesSchema.when('$skipGrading', {
  is: false,
  then: responsesSchema.test(
    AT_LEAST_ONE_CORRECT_CHOICE_ERROR_NAME,
    translations.mustSpecifyAtLeastOneCorrectChoice,
    (options?: { correct: OptionData['correct'] | undefined }[]) =>
      options?.some((option) => option.correct) ?? false,
  ),
});

const optionsSchema: Record<McqMrqFormData['mcqMrqType'], AnySchema> = {
  mcq: choicesSchema,
  mrq: responsesSchema,
};

export type OptionErrors = Partial<Record<keyof OptionData, string>>;

export interface OptionsErrors {
  error?: string;
  errors?: Record<number, OptionErrors>;
}

export const validateOptions = async (
  options: OptionData[],
  type: McqMrqFormData['mcqMrqType'],
  skipGrading: boolean,
): Promise<OptionsErrors | undefined> => {
  try {
    await optionsSchema[type].validate(options, {
      abortEarly: false,
      context: { type, skipGrading },
    });

    return undefined;
  } catch (validationErrors) {
    if (!(validationErrors instanceof ValidationError)) throw validationErrors;

    return validationErrors.inner.reduce<OptionsErrors>((errors, error) => {
      const { path, type: name, message } = error;

      if (name === AT_LEAST_ONE_CORRECT_CHOICE_ERROR_NAME) {
        errors.error = message;
      } else if (path) {
        const [index, key] = getIndexAndKeyPath<keyof OptionData>(path);

        if (!errors.errors) errors.errors = {};
        if (!errors.errors[index]) errors.errors[index] = {};

        errors.errors[index][key] = message;
      }

      return errors;
    }, {});
  }
};
