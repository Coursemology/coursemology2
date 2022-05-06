import { FC, ReactElement } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, RenderOptions } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

const AllTheProviders: FC<any> = ({ children }) => {
  return (
    <IntlProvider locale="en" timeZone="Asia/Singapore">
      {children}
    </IntlProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';
export { customRender as render };
