import { Provider } from '@rollbar/react';

interface RollbarProviderProps {
  children: JSX.Element;
}

const RollbarProvider = (props: RollbarProviderProps): JSX.Element => {
  // TODO: To report user id as well after we move to SPA.
  const rollbarConfig =
    process.env.NODE_ENV === 'development'
      ? {}
      : {
          accessToken: process.env.ROLLBAR_POST_CLIENT_ITEM_KEY,
          environment: 'production',
          captureUncaught: false,
          captureUnhandledRejections: true,
          // checkIgnore(
          //   _isUncaught: unknown,
          //   _args: unknown,
          //   payload: unknown,
          // ): boolean {
          //   // Code here to determine whether or not to send the payload
          //   // to the Rollbar API
          //   // return true to ignore the payload
          //   return true
          // },
          ignoredMessages: [
            'ResizeObserver loop limit exceeded',
            'Request failed with status code.*',
            'Uncaught CKEditorError.*',
            "Cannot read properties of null (reading 'CodeMirror')",
            'Uncaught TypeError: Cannot redefine property: googletag',
            'Network Error',
            'Request aborted',
          ],
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

export default RollbarProvider;
