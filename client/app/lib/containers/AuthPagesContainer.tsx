import { Dispatch, SetStateAction, useState } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import isString from 'lodash-es/isString';

import Page from 'lib/components/core/layouts/Page';

const AuthPagesContainer = (): JSX.Element => {
  const emailState = useState('');

  return (
    <Page className="flex min-h-[calc(100vh_-_4.5rem)] items-center justify-center max-sm:py-[5rem]">
      <Outlet context={emailState} />
    </Page>
  );
};

export const useEmailFromAuthPagesContext = (): [
  string,
  Dispatch<SetStateAction<string>>,
] => useOutletContext();

export const useEmailFromLocationState = (): string | null => {
  const location = useLocation();
  const maybeEmail = location.state;

  return isString(maybeEmail) ? maybeEmail.trim() : null;
};

export default AuthPagesContainer;
