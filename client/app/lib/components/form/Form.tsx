/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Slide, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import useEmitterFactory, { Emits } from 'react-emitter-factory';
import { Control, FormState, useForm, UseFormWatch } from 'react-hook-form';
import { AnyObjectSchema } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import messagesTranslations from 'lib/translations/messages';

type Data = Record<string, any>;

export interface FormEmitter {
  reset?: () => void;
  resetTo?: (data: Data) => void;

  /**
   * Resets the `Form` by merging its `initialValues` with the given `data`.
   * @param data The (partial) form data to merge.
   */
  resetByMerging?: (data: Data) => void;

  setValue?: (fieldName: string, value) => void;
  setError?: (fieldName: string, errors: Record<string, string>) => void;

  /**
   * Sets errors for fields in `errors` with `setReactHookFormError`. If `errors` is
   * `undefined`, pops a toast up with a generic update error message.
   * @param errors The same `errors` parameter of `setReactHookFormError`
   */
  receiveErrors?: (errors?) => void;

  /**
   * Sets the values in `data` as part of the `initialValues` without modifying the
   * `Form`'s current state. The keys of `data` must be valid field names.
   * @param data The (partial) form data to merge.
   */
  mutate?: (data: Data) => void;
}

interface FormProps extends Emits<FormEmitter> {
  initialValues?: Data;
  onSubmit?: (data) => void;
  headsUp?: boolean;
  dirty?: boolean;
  validates?: AnyObjectSchema;
  children?: (
    control: Control,
    watch: UseFormWatch<any>,
    formState: FormState<any>,
  ) => ReactNode;
  disabled?: boolean;

  /**
   * Dispatched when the form is reset. Return `true` to prevent the default form
   * reset from executing.
   */
  onReset?: () => boolean | void;

  /**
   * Due to performance concerns, dirty fields are determined by strict equality,
   * i.e., with `===`, against the latest `initialValues`. There is no deep equality
   * performed.
   */
  submitsDirtyFieldsOnly?: boolean;
}

const Form = (props: FormProps): JSX.Element => {
  const { t } = useTranslation();
  const [initialValues, setInitialValues] = useState(props.initialValues);
  const { control, formState, reset, watch, handleSubmit, setValue, setError } =
    useForm({
      defaultValues: props.initialValues,
      resolver: props.validates && yupResolver(props.validates),
    });

  const resetForm = (): void => {
    if (!props.onReset?.()) reset();
  };

  const resetTo = (data: Data): void => {
    reset(data);
    setInitialValues(data);
  };

  useEmitterFactory(props, {
    reset: resetForm,
    resetTo,
    resetByMerging: (data) => resetTo({ ...initialValues, ...data }),
    setValue,
    setError,
    receiveErrors: (errors) => {
      if (errors) {
        setReactHookFormError(setError, errors);
      } else {
        toast.error(t(messagesTranslations.formUpdateError));
      }
    },
    mutate: (data) => {
      const newInitialValues = { ...initialValues, ...data };

      reset(newInitialValues, {
        keepValues: true,
        keepDirty: true,
      });

      setInitialValues(newInitialValues);

      Object.entries(data).forEach(([fieldName, value]) => {
        setValue(fieldName, value);
      });
    },
  });

  const processAndSubmit = (data: Data): void => {
    if (!props.onSubmit) return;

    let submittedData = data;

    if (initialValues && props.submitsDirtyFieldsOnly) {
      submittedData = Object.keys(data).reduce((newData, fieldName) => {
        const value = data[fieldName];
        if (value !== initialValues[fieldName]) newData[fieldName] = value;

        return newData;
      }, {});
    }

    props.onSubmit(submittedData);
  };

  return (
    <form onSubmit={handleSubmit(processAndSubmit)} className="pb-32">
      {props.children?.(control, watch, formState)}

      {props.headsUp && (
        <Slide
          in={formState.isDirty || props.dirty}
          direction="up"
          unmountOnExit
        >
          <div className="fixed inset-x-0 bottom-0 z-10 flex w-full items-center justify-between bg-neutral-800 px-8 py-4 text-white sm:bottom-8 sm:mx-auto sm:w-fit sm:rounded-lg sm:drop-shadow-xl">
            <Typography variant="body1">
              {t(translations.unsavedChanges)}
            </Typography>

            <div className="ml-10">
              <Button
                onClick={resetForm}
                className={`mr-4 ${props.disabled && 'text-neutral-500'}`}
                disabled={props.disabled}
              >
                {t(translations.reset)}
              </Button>

              <Button
                type="submit"
                variant="contained"
                disableElevation
                className={`${props.disabled && 'bg-neutral-500'}`}
                disabled={props.disabled}
              >
                {t(translations.saveChanges)}
              </Button>
            </div>
          </div>
        </Slide>
      )}
    </form>
  );
};

export default Form;
