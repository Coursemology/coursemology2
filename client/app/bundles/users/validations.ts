import {
  AnyObjectSchema,
  object,
  ref,
  string,
  StringSchema,
  ValidationError,
} from 'yup';

import { Translated } from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import translations from './translations';

export const emailValidationSchema: Translated<StringSchema> = (t) =>
  string()
    .email(t(formTranslations.email))
    .required(t(formTranslations.required));

const passwordValidationSchemaObject: Translated<
  Record<string, StringSchema>
> = (t) => ({
  password: string()
    .required(t(formTranslations.required))
    .min(8, t(translations.passwordMinCharacters)),
  passwordConfirmation: string().when('$requirePasswordConfirmation', {
    is: true,
    then: string()
      .equals([ref('password')], t(translations.passwordConfirmationMustMatch))
      .required(t(translations.passwordConfirmationRequired)),
    otherwise: string().optional(),
  }),
});

export const passwordValidationSchema: Translated<AnyObjectSchema> = (t) =>
  object(passwordValidationSchemaObject(t));

export const signUpValidationSchema: Translated<AnyObjectSchema> = (t) =>
  object({
    name: string().required(t(formTranslations.required)),
    email: emailValidationSchema(t),
    ...passwordValidationSchemaObject(t),
  });

export const getValidationErrors = (
  errors: ValidationError,
): Record<string, string> =>
  errors.inner.reduce<Record<string, string>>((result, { path, message }) => {
    if (!path) return result;

    result[path] = message;
    return result;
  }, {});
