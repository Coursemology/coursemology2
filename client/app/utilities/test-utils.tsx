import { FC, ReactNode } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

const AllTheProviders: FC<{ children: ReactNode }> = ({ children }) => (
  <IntlProvider locale="en" timeZone="Asia/Singapore">
    {children}
  </IntlProvider>
);

const customRender = (
  ui: JSX.Element,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';
export { customRender as render };
