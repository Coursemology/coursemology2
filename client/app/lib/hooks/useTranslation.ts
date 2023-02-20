import { MessageDescriptor, useIntl } from 'react-intl';

export type Descriptor = MessageDescriptor;

type InterpolatedValue =
  | string
  | JSX.Element
  | number
  | boolean
  | ((chunks: string) => JSX.Element);

interface TranslationHook {
  t: MessageTranslator;
}

const useTranslation = (): TranslationHook => {
  const intl = useIntl();

  return { t: intl.formatMessage };
};

export default useTranslation;
