import { toast } from 'react-toastify';

const DEFAULT_TOAST_TIMEOUT_MS = 5000 as const;

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
      }),
    error: (message) =>
      toast.update(id, {
        type: 'error',
        isLoading: false,
        autoClose: DEFAULT_TOAST_TIMEOUT_MS,
        render: message,
      }),
  };
};

export default loadingToast;
