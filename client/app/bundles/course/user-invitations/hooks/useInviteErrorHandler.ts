import { MessageDescriptor } from 'react-intl';

import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

const useInviteErrorHandler = (
  failure: MessageDescriptor,
  failureGeneric: MessageDescriptor,
): ((error: unknown) => void) => {
  const { t } = useTranslation();

  return (error: unknown): void => {
    const rawErrors = (error as { response?: { data?: { errors?: unknown } } })
      ?.response?.data?.errors;
    let errorList: string[];
    if (Array.isArray(rawErrors)) errorList = rawErrors;
    else if (typeof rawErrors === 'string') errorList = [rawErrors];
    else errorList = [];
    const first = errorList[0];
    const overflow =
      errorList.length > 1 ? ` (and ${errorList.length - 1} more)` : '';
    if (first) {
      toast.error(t(failure, { error: first + overflow }), {
        autoClose: false,
      });
    } else {
      toast.error(t(failureGeneric), { autoClose: false });
    }
  };
};

export default useInviteErrorHandler;
