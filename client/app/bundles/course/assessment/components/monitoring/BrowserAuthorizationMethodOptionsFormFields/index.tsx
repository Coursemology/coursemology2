import { ElementType } from 'react';

import {
  BrowserAuthorizationMethod,
  BrowserAuthorizationMethodOptionsProps,
} from './common';
import SebConfigKeyOptionsFormFields from './SebConfigKeyOptionsFormFields';
import UserAgentOptionsFormFields from './UserAgentOptionsFormFields';

const AUTHORIZATION_METHODS: Record<
  BrowserAuthorizationMethod,
  ElementType<BrowserAuthorizationMethodOptionsProps>
> = {
  user_agent: UserAgentOptionsFormFields,
  seb_config_key: SebConfigKeyOptionsFormFields,
};

const BrowserAuthorizationMethodOptionsFormFields = ({
  authorizationMethod,
  ...restProps
}: {
  authorizationMethod: BrowserAuthorizationMethod;
} & BrowserAuthorizationMethodOptionsProps): JSX.Element => {
  const Component = AUTHORIZATION_METHODS[authorizationMethod];
  if (!Component)
    throw new Error(
      `Unregistered authorization method: ${authorizationMethod}`,
    );

  return <Component {...restProps} />;
};

export default BrowserAuthorizationMethodOptionsFormFields;
