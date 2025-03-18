/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Control,
  DefaultValues,
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormProvider,
  FormState,
  Resolver,
  useForm,
  UseFormWatch,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Slide, Typography } from '@mui/material';
import { isEmpty } from 'lodash';
import { AnyObjectSchema } from 'yup';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations/form';
import messagesTranslations from 'lib/translations/messages';

type Data = FieldValues;

export interface FormRef<D extends Data = any> {
  reset?: () => void;
  resetTo?: (data: D, keepDirty?: boolean) => void;

  /**
   * Resets the `Form` by merging its `initialValues` with the given `data`.
   * @param data The (partial) form data to merge.
   */
  resetByMerging?: (data: Partial<D>) => void;

  setValue?: <P extends FieldPath<D>>(
    fieldName: P,
    value: FieldPathValue<D, P>,
  ) => void;

  setError?: <P extends FieldPath<D>>(
    fieldName: P,
    errors: Record<P, string>,
  ) => void;

  /**
   * Sets errors for fields in `errors` with `setReactHookFormError`. If `errors` is
   * `undefined`, pops a toast up with a generic update error message.
   * @param errors The same `errors` parameter of `setReactHookFormError`
   */
  receiveErrors?: (errors?: Record<FieldPath<D>, string>) => void;

  /**
   * Sets the values in `data` as part of the `initialValues` without modifying the
   * `Form`'s current state. The keys of `data` must be valid field names.
   * @param data The (partial) form data to merge.
   */
  mutate?: (data: Partial<D>) => void;
}

type Transformer<D> = (data: D) => D | Partial<D>;

interface FormProps<
  D extends Data = any,
  M extends boolean = false,
  V extends AnyObjectSchema = never,
> {
  initialValues: D;
  ref?: ForwardedRef<FormRef<D>>;
  onSubmit?: (data: M extends true ? Partial<D> : D) => void;
  headsUp?: boolean;
  dirty?: boolean;
  validates?: V;
  children?:
    | ReactNode
    | ((
        control: Control<D>,
        watch: UseFormWatch<D>,
        formState: FormState<D>,
      ) => ReactNode);
  disabled?: boolean;
  className?: string;
  contextual?: boolean;

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
  submitsDirtyFieldsOnly?: M;

  /**
   * Transforms the raw data before validating and eventually submitting it. This
   * prop is only available if `validates` is provided a validation schema.
   */
  transformsBy?: V extends AnyObjectSchema ? Transformer<D> : never;

  /**
   * A context object to supply for the validation schema in `validates`.
   */
  validatesWith?: V extends AnyObjectSchema ? Record<string, unknown> : never;
}

/**
 * Technically, `transformer(data)` can return `Partial<D>`, but `Resolver<D>`'s type
 * is very complex, so we suppress the type error here by asserting it as `D`.
 */
const transformedResolver =
  <D extends Data>(
    transformer: Transformer<D>,
    resolver: Resolver<D>,
  ): Resolver<D> =>
  (data, ...resolverArgs) =>
    resolver(transformer(data) as D, ...resolverArgs);

const transformableResolver = <D extends Data>(
  resolver: Resolver<D>,
  transformer?: Transformer<D>,
): Resolver<D> =>
  transformer ? transformedResolver(transformer, resolver) : resolver;

const FormWithoutRef = <
  D extends Data = any,
  M extends boolean = false,
  V extends AnyObjectSchema = never,
>(
  props: FormProps<D, M, V>,
  ref: ForwardedRef<FormRef<D>>,
): JSX.Element => {
  const {
    transformsBy: transformer,
    validates: schema,
    validatesWith: validationContext,
  } = props;

  const { t } = useTranslation();

  const [initialValues, setInitialValues] = useState(props.initialValues);

  const methods = useForm({
    defaultValues: props.initialValues as DefaultValues<D>,
    resolver: schema && transformableResolver(yupResolver(schema), transformer),
    context: schema && validationContext,
  });

  const { control, formState, reset, watch, handleSubmit, setValue, setError } =
    methods;

  const resetForm = (): void => {
    if (!props.onReset?.()) reset();
  };

  const resetTo = (data: D, keepDirty?: boolean): void => {
    reset(data, { keepDirty });
    setInitialValues(data);
  };

  useImperativeHandle(
    ref,
    () => ({
      reset: resetForm,
      resetTo,
      resetByMerging: (data): void => {
        if (!data || isEmpty(data)) return;
        resetTo({ ...initialValues, ...data });
      },
      setValue,
      setError,
      receiveErrors: (errors): void => {
        if (errors) {
          setReactHookFormError(setError, errors);
        } else {
          toast.error(t(messagesTranslations.formUpdateError));
        }
      },
      mutate: (data): void => {
        const newInitialValues = { ...initialValues, ...data };

        reset(newInitialValues, {
          keepValues: true,
          keepDirty: true,
        });

        setInitialValues(newInitialValues);

        Object.entries(data).forEach(([fieldName, value]) => {
          setValue(fieldName as FieldPath<D>, value as D[string]);
        });
      },
    }),
    [],
  );

  const processAndSubmit = (data: D): void => {
    if (!props.onSubmit) return;

    let submittedData: Partial<D> | D = data;

    if (initialValues && props.submitsDirtyFieldsOnly) {
      const keys = Object.keys(data) as FieldPath<D>[];

      submittedData = keys.reduce<Partial<D>>((newData, fieldName) => {
        const value = data[fieldName];
        if (value !== initialValues[fieldName]) newData[fieldName] = value;

        return newData;
      }, {});
    }

    props.onSubmit(submittedData as M extends true ? Partial<D> : D);
  };

  const form = (
    <form
      className={`${props.headsUp ? 'pb-32' : ''} ${props.className ?? ''}`}
      onSubmit={handleSubmit(processAndSubmit)}
    >
      {typeof props.children === 'function'
        ? props.children(control, watch, formState)
        : props.children}

      {props.headsUp && (
        <Slide
          direction="up"
          in={formState.isDirty || props.dirty}
          unmountOnExit
        >
          <div className="fixed inset-x-0 bottom-0 z-10 flex w-full items-center justify-between bg-neutral-800 px-8 py-4 text-white sm:bottom-8 sm:mx-auto sm:w-fit sm:rounded-lg sm:drop-shadow-xl">
            <Typography>{t(translations.unsavedChanges)}</Typography>

            <div className="ml-10">
              <Button
                className={`mr-4 ${props.disabled && 'text-neutral-500'}`}
                disabled={props.disabled}
                onClick={resetForm}
              >
                {t(translations.reset)}
              </Button>

              <Button
                className={props.disabled ? 'bg-neutral-500' : ''}
                disabled={props.disabled}
                disableElevation
                type="submit"
                variant="contained"
              >
                {t(translations.saveChanges)}
              </Button>
            </div>
          </div>
        </Slide>
      )}
    </form>
  );

  if (props.contextual) return <FormProvider {...methods}>{form}</FormProvider>;

  return form;
};

/**
 * We do this hack because `forwardRef` doesn't support generic types.
 */
const Form = forwardRef(FormWithoutRef) as typeof FormWithoutRef;

export default Form;
