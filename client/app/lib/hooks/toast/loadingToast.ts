import { DEFAULT_TOAST_TIMEOUT_MS } from 'lib/components/wrappers/ToastProvider';

import toast from './toast';

type Updater = (message: string) => void;

interface LoadingToast {
  update: Updater;
  success: Updater;
  error: Updater;
}

const loadingToast = (loadingMessage: string): LoadingToast => {
  const id = toast.loading(loadingMessage);

  return {
    update: (message) => toast.update(id, { render: message }),
    success: (message) =>
      toast.update(id, {
        type: 'success',
        isLoading: false,
        autoClose: DEFAULT_TOAST_TIMEOUT_MS,
        render: message,
        closeButton: true,
      }),
    error: (message) =>
      toast.update(id, {
        type: 'error',
        isLoading: false,
        autoClose: DEFAULT_TOAST_TIMEOUT_MS,
        render: message,
        closeButton: true,
      }),
  };
};

export default loadingToast;
