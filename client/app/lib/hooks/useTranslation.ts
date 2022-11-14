import { MessageDescriptor, useIntl } from 'react-intl';

export type Descriptor = MessageDescriptor;

type TranslationHook = () => {
  t: (
    descriptor: Descriptor,
    values?: Record<string, string | JSX.Element | number>,
  ) => string;
};

const useTranslation: TranslationHook = () => {
  const intl = useIntl();

  return { t: intl.formatMessage };
};

export default useTranslation;
