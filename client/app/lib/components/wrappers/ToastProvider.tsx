import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';

injectStyle();

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider = (props: ToastProviderProps): JSX.Element => {
  return (
    <>
      {props.children}

      <ToastContainer position="bottom-center" />
    </>
  );
};

export default ToastProvider;
