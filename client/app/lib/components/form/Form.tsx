/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Slide, Typography } from '@mui/material';
import { ReactNode } from 'react';
import useEmitterFactory, { Emits } from 'react-emitter-factory';
import { Control, FormState, useForm, UseFormWatch } from 'react-hook-form';
import { AnyObjectSchema } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';

export interface FormEmitter {
  reset?: () => void;
  resetTo?: (data) => void;
  setError?: (fieldName: string, errors: Record<string, string>) => void;
}

interface FormProps extends Emits<FormEmitter> {
  initialValues?: Record<string, any>;
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
  onReset?: (reset: FormEmitter['reset']) => void;
}

const Form = (props: FormProps): JSX.Element => {
  const { t } = useTranslation();
  const { control, formState, reset, watch, handleSubmit, setError } = useForm({
    defaultValues: props.initialValues,
    resolver: props.validates && yupResolver(props.validates),
  });

  useEmitterFactory(props, { reset: () => reset(), resetTo: reset, setError });

  return (
    <form onSubmit={props.onSubmit && handleSubmit(props.onSubmit)}>
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
                onClick={(): void => props.onReset?.(reset) ?? reset()}
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
