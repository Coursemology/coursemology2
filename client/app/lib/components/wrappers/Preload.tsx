import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import ErrorCard from 'lib/components/core/ErrorCard';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';
import messagesTranslations from 'lib/translations/messages';

interface PreloadProps<Data> {
  while: () => Promise<Data>;
  render: JSX.Element;
  silently?: boolean;
  onErrorToast?: string;
  onErrorDo?: (error: unknown) => void;
  children: (data: Data) => JSX.Element;
}

const Preload = <Data,>(props: PreloadProps<Data>): JSX.Element => {
  const { t } = useTranslation();
  const [data, setData] = useState<Data>();
  const [failed, toggleFailed] = useToggle();

  useEffect(() => {
    props
      .while()
      .then(setData)
      .catch((error: AxiosError) => {
        toggleFailed();
        props.onErrorDo?.(error.response?.data);
        if (!props.silently)
          toast.error(
            props.onErrorToast ?? t(messagesTranslations.fetchingError),
          );
      });
  }, []);

  if (failed)
    return <ErrorCard message={t(messagesTranslations.fetchingError)} />;

  return data ? props.children(data) : props.render;
};

export default Preload;
