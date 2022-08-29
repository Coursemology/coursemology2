// @ts-nocheck
// Disable type-checking because as of yup 0.32.11, arguments types
// for yup.when(['a', 'b'], (a, b, schema) => ...) cannot be resolved.
// This is a known issue: https://github.com/jquense/yup/issues/1529
// Probably fixed in yup 1.0+ with a new function signature with array destructuring
// https://github.com/jquense/yup#:~:text=isBig%27%2C%20(-,%5BisBig%5D,-%2C%20schema)

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from 'react-hook-form';

import ft from 'lib/translations/form';
import t from './translations.intl';

const validationSchema = yup.object({
  title: yup.string().required(ft.required),
  tab_id: yup.number(),
  description: yup.string(),
  start_at: yup
    .date()
    .nullable()
    .typeError(ft.invalidDate)
    .required(ft.required),
  end_at: yup
    .date()
    .nullable()
    .typeError(ft.invalidDate)
    .min(yup.ref('start_at'), t.startEndValidationError),
  bonus_end_at: yup
    .date()
    .nullable()
    .typeError(ft.invalidDate)
    .min(yup.ref('start_at'), t.startEndValidationError),
  base_exp: yup.number().typeError(ft.required).required(ft.required),
  time_bonus_exp: yup
    .number()
    .nullable(true)
    .transform((_, val) => (val === Number(val) ? val : null)),
  published: yup.bool(),
  autograded: yup.bool(),
  block_student_viewing_after_submitted: yup.bool(),
  skippable: yup.bool(),
  allow_partial_submission: yup.bool(),
  show_mcq_answer: yup.bool(),
  tabbed_view: yup.bool().when('autograded', {
    is: false,
    then: yup.bool().required(ft.required),
  }),
  delayed_grade_publication: yup.bool(),
  password_protected: yup
    .bool()
    .when(
      ['view_password', 'session_password'],
      (view_password, session_password, schema: yup.BooleanSchema) =>
        schema.test({
          test: (password_protected) =>
            // Check if there is at least 1 password type when password_protectd
            // is enabled.
            password_protected ? session_password || view_password : true,
          message: t.passwordRequired,
        }),
    ),
  view_password: yup.string().nullable(),
  session_password: yup.string().nullable(),
  show_mcq_mrq_solution: yup.bool(),
  use_public: yup.bool(),
  use_private: yup.bool(),
  use_evaluation: yup
    .bool()
    .when(
      ['use_public', 'use_private'],
      (use_public, use_private, schema: yup.BooleanSchema) =>
        schema.test({
          // Check if there is at least 1 selected test case.
          test: (use_evaluation) => use_public || use_private || use_evaluation,
          message: t.noTestCaseChosenError,
        }),
    ),
  show_private: yup.bool(),
  show_evaluation: yup.bool(),
  randomization: yup.bool(),
  has_personal_times: yup.bool(),
  affects_personal_times: yup.bool(),
});

const useFormValidation = (initialValues): UseFormReturn => {
  const form = useForm({
    defaultValues: {
      ...initialValues,
      session_protected: Boolean(initialValues?.session_password),
    },
    resolver: yupResolver(validationSchema),
  });

  return {
    ...form,

    handleSubmit: (onValid, onInvalid): SubmitHandler<FieldValues> => {
      const postProcessor = (rawData): SubmitHandler<FieldValues> => {
        if (!rawData.session_protected) rawData.session_password = null;
        return onValid(rawData);
      };

      return form.handleSubmit(postProcessor, onInvalid);
    },
  };
};

export default useFormValidation;
