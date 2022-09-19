import { MessageDescriptor, useIntl } from 'react-intl';

type Descriptor = MessageDescriptor;

type TranslationHook = () => {
  t: (descriptor: Descriptor, values?: Record<string, string>) => string;
};

const useTranslation: TranslationHook = () => {
  const intl = useIntl();

  return { t: intl.formatMessage };
};

export default useTranslation;
