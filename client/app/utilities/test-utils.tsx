// eslint-disable-next-line import/no-extraneous-dependencies
import { render, RenderResult } from '@testing-library/react';

import TestApp, { CustomRenderOptions } from './TestApp';

const customRender = (
  ui: JSX.Element,
  options?: CustomRenderOptions,
): RenderResult => render(<TestApp {...options}>{ui}</TestApp>);

// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';
export { customRender as render };
