import { DependencyList, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import ErrorCard from 'lib/components/core/ErrorCard';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';
import messagesTranslations from 'lib/translations/messages';

interface PreloadProps<Data> {
  while: () => Promise<Data>;
  render: JSX.Element;
  children: (
    data: Data,
    refreshable: (element: JSX.Element) => JSX.Element,
  ) => JSX.Element;
  onErrorDo?: (error: unknown) => void;
  silently?: boolean;
  onErrorToast?: string;
  syncsWith?: DependencyList;
  after?: number;
}

const Preload = <Data,>(props: PreloadProps<Data>): JSX.Element => {
  const { t } = useTranslation();
  const [data, setData] = useState<Data>();
  const [loading, setLoading] = useState(true);
  const [failed, toggleFailed] = useToggle();

  const fetch = (ignore: boolean): void => {
    setLoading(true);

    props
      .while()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((error: AxiosError) => {
        toggleFailed();
        props.onErrorDo?.(error.response?.data);
        if (!props.silently)
          toast.error(
            props.onErrorToast ?? t(messagesTranslations.fetchingError),
          );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    let timeout: NodeJS.Timeout;

    if (props.after && props.after > 0) {
      timeout = setTimeout(() => fetch(ignore), props.after);
    } else {
      fetch(ignore);
    }

    return () => {
      ignore = true;
      if (timeout) clearTimeout(timeout);
    };
  }, props.syncsWith ?? []);

  if (failed)
    return <ErrorCard message={t(messagesTranslations.fetchingError)} />;

  const refreshable = (element: JSX.Element): JSX.Element =>
    loading ? props.render : element;

  return data ? props.children(data, refreshable) : props.render;
};

export default Preload;
