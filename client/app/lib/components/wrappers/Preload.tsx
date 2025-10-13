import { DependencyList, useEffect, useState } from 'react';
import { AxiosError } from 'axios';

import Note from 'lib/components/core/Note';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import messagesTranslations from 'lib/translations/messages';

interface PreloadProps<Data> {
  while: () => Promise<Data>;
  render: JSX.Element;
  children:
    | JSX.Element
    | ((
        data: Data,
        refreshable: (element: JSX.Element) => JSX.Element,
      ) => JSX.Element);
  onErrorDo?: (error: unknown) => void;
  silently?: boolean;
  onErrorToast?: string;
  syncsWith?: DependencyList;
  after?: number;
}

interface PreloadState<Data> {
  preloaded: boolean;
  data: Data;
}

const Preload = <Data,>(props: PreloadProps<Data>): JSX.Element => {
  const { t } = useTranslation();

  const [state, setState] = useState<PreloadState<Data>>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetch = (ignore: boolean): void => {
    setLoading(true);

    props
      .while()
      .then((data) => {
        if (!ignore) setState({ preloaded: true, data });
      })
      .catch((error: AxiosError) => {
        setFailed(true);
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
    return (
      <Note message={t(messagesTranslations.fetchingError)} severity="error" />
    );

  const refreshable = (element: JSX.Element): JSX.Element =>
    loading ? props.render : element;

  if (!state?.preloaded) return props.render;

  if (typeof props.children === 'function')
    return props.children(state.data, refreshable);

  return props.children;
};

export default Preload;
