import { ReactNode } from 'react';
import { ToastContainer, TypeOptions } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { Close } from '@mui/icons-material';

injectStyle();

export const DEFAULT_TOAST_TIMEOUT_MS = 5000 as const;

interface ToastProviderProps {
  children: ReactNode;
}

const colors: Record<TypeOptions, string> = {
  default: 'bg-neutral-800',
  success: 'bg-green-600',
  warning: 'bg-amber-600',
  error: 'bg-red-700',
  info: 'bg-sky-600',
};

const ToastProvider = (props: ToastProviderProps): JSX.Element => {
  return (
    <>
      {props.children}

      <ToastContainer
        autoClose={DEFAULT_TOAST_TIMEOUT_MS}
        bodyClassName={(): string => 'flex'}
        closeButton={<Close />}
        draggable={false}
        hideProgressBar
        position="bottom-center"
        toastClassName={(toast): string =>
          `relative shadow-xl rounded-lg mb-4 flex p-5 items-start justify-between ${
            colors[toast?.type ?? 'default']
          }`
        }
      />
    </>
  );
};

export default ToastProvider;
