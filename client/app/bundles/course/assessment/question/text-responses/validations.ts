import { isNumber } from 'lodash';
import { SolutionData } from 'types/course/assessment/question/text-responses';
import { array, bool, number, object, string, ValidationError } from 'yup';

import translations from '../../translations';
import { qnFormCommonFieldsValidation } from '../components/QuestionFormCommonFields';

export const questionSchema = qnFormCommonFieldsValidation.shape({
  allowAttachment: bool(),
  hideText: bool(),
});

const solutionSchema = object({
  solution: string().when('toBeDeleted', {
    is: true,
    then: string().notRequired(),
    otherwise: string().required(translations.mustSpecifySolution),
  }),
  solutionType: string().required(),
  grade: number().required(),
  explanation: string().nullable(),
  toBeDeleted: bool(),
});

const solutionsSchema = array().of(solutionSchema);

export type SolutionErrors = Partial<Record<keyof SolutionData, string>>;

export interface SolutionsErrors {
  error?: string;
  errors?: Record<number, SolutionErrors>;
}

const getNumberBetweenTwoSquareBrackets = (str: string): number | undefined => {
  const match = str.match(/\[(\d+)\]/);
  return match ? parseInt(match[1], 10) : undefined;
};

/**
 * Extracts the index and key from yup's `ValidationError` path. Only works
 * for first-level array-record paths of the format `'[index].key'`.
 *
 * @param path for example: `'[5].option'`
 * @returns a tuple of the index (`number`) and key (`string`)
 */
const getIndexAndKeyPath = <T extends string>(path: string): [number, T] => {
  const [indexString, key] = path.split('.');
  const index = getNumberBetweenTwoSquareBrackets(indexString);
  if (!isNumber(index))
    throw new Error(`validateOptions encountered ${index} index`);

  return [index, key as T];
};

export const validateSolutions = async (
  solutions: SolutionData[],
): Promise<SolutionsErrors | undefined> => {
  try {
    await solutionsSchema.validate(solutions, {
      abortEarly: false,
    });

    return undefined;
  } catch (validationErrors) {
    if (!(validationErrors instanceof ValidationError)) throw validationErrors;

    return validationErrors.inner.reduce<SolutionsErrors>((errors, error) => {
      const { path, message } = error;
      if (path) {
        const [index, key] = getIndexAndKeyPath<keyof SolutionData>(path);

        if (!errors.errors) errors.errors = {};
        if (!errors.errors[index]) errors.errors[index] = {};

        errors.errors[index][key] = message;
      }

      return errors;
    }, {});
  }
};
