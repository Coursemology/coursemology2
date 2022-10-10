import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import useTranslation from 'lib/hooks/useTranslation';
import messagesTranslations from 'lib/translations/messages';
import useToggle from 'lib/hooks/useToggle';

interface PreloadProps<Data> {
  while: () => Promise<Data>;
  render: JSX.Element;
  silently?: boolean;
  onErrorToast?: string;
  onErrorDo?: (error: unknown) => void;
  children: (data: Data) => JSX.Element;
}

const Preload = <Data,>(props: PreloadProps<Data>): JSX.Element | null => {
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

  if (failed) return null;

  return data ? props.children(data) : props.render;
};

export default Preload;
