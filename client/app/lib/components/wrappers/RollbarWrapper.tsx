import { FC } from 'react';
import { Provider } from '@rollbar/react';

interface Props {
  children: JSX.Element;
}

const RollBarWrapper: FC<Props> = (props) => {
  // TODO: To report user id as well after we move to SPA.
  const rollbarConfig =
    process.env.NODE_ENV === 'development'
      ? {}
      : {
          accessToken: process.env.ROLLBAR_POST_CLIENT_ITEM_KEY,
          environment: 'production',
          captureUncaught: true,
          captureUnhandledRejections: true,
          payload: {
            client: {
              javascript: {
                source_map_enabled: true,
              },
            },
          },
        };

  return <Provider config={rollbarConfig}>{props.children}</Provider>;
};

export default RollBarWrapper;
