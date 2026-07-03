// eslint-disable-next-line import/no-extraneous-dependencies
import {
  render,
  renderHook,
  RenderHookOptions,
  RenderHookResult,
  RenderResult,
  waitFor,
} from '@testing-library/react';

import TestApp, { CustomRenderOptions } from './TestApp';

const customRender = (
  ui: JSX.Element,
  options?: CustomRenderOptions,
): RenderResult => render(<TestApp {...options}>{ui}</TestApp>);

// Hooks that read from the Redux store (useAppSelector) need the same
// Providers/store wiring as customRender. `preloadedState` mirrors `render`'s
// `state` option so hook tests can seed the store the same way component
// tests do.
interface CustomRenderHookOptions<Props>
  extends RenderHookOptions<Props>,
    Pick<CustomRenderOptions, 'at'> {
  preloadedState?: CustomRenderOptions['state'];
}

// `TestApp` renders `I18nProvider`, which shows a `LoadingIndicator` until it
// asynchronously loads the compiled locale messages (dynamic `import()`), so
// the wrapped hook does not mount synchronously. Component tests already
// account for this by `await`-ing `screen.findBy...`/`waitFor` past the
// loading state; there's no DOM text to await for a bare hook, so this
// wrapper waits for the initial render (`result.current` populated) itself
// before handing control back to the caller.
const customRenderHook = async <Result, Props>(
  callback: (props: Props) => Result,
  options?: CustomRenderHookOptions<Props>,
): Promise<RenderHookResult<Result, Props>> => {
  const { preloadedState, at, ...rest } = options ?? {};
  const utils = renderHook(callback, {
    ...rest,
    wrapper: ({ children }) => (
      <TestApp at={at} state={preloadedState}>
        {children}
      </TestApp>
    ),
  });
  await waitFor(() => expect(utils.result.current).not.toBeNull());
  return utils;
};

// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
