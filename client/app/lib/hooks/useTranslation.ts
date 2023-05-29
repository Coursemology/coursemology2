import { MessageDescriptor, useIntl } from 'react-intl';

export type Descriptor = MessageDescriptor;

type InterpolatedValue =
  | string
  | JSX.Element
  | number
  | boolean
  | ((chunks: string) => JSX.Element);

export type MessageTranslator = (
  descriptor: Descriptor,
  values?: Record<string, InterpolatedValue>,
) => string;

interface TranslationHook {
  t: MessageTranslator;
}

export const translatable = (object: unknown): object is Descriptor =>
  typeof object === 'object' &&
  object !== null &&
  'id' in object &&
  'defaultMessage' in object;

const useTranslation = (): TranslationHook => {
  const intl = useIntl();

  return { t: intl.formatMessage };
};

export type Translated<T> = (translator: MessageTranslator) => T;

export default useTranslation;
