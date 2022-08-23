import { FC, ReactElement } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, RenderOptions } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AllTheProviders: FC<any> = ({ children }) => {
  return (
    <IntlProvider locale="en" timeZone="Asia/Singapore">
      {children}
    </IntlProvider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customRender: any = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';
export { customRender as render };
