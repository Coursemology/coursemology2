import { IntlProvider } from 'react-intl';
import { render, screen } from '@testing-library/react';

import { ToolbarProps } from '../adapters';
import MuiTableToolbar from '../MuiTableAdapter/MuiTableToolbar';

const baseToolbar: ToolbarProps = {
  renderNative: true,
  searchKeyword: '',
  onSearchKeywordChange: () => {},
};

const wrap = (node: JSX.Element): JSX.Element => (
  <IntlProvider defaultLocale="en" locale="en">
    {node}
  </IntlProvider>
);

describe('MuiTableToolbar columnPicker trigger', () => {
  it('does not render Export… button when columnPicker is unset', () => {
    render(wrap(<MuiTableToolbar {...baseToolbar} />));
    expect(
      screen.queryByRole('button', { name: /export/i }),
    ).not.toBeInTheDocument();
  });

  it('renders Export… button when columnPicker is set', () => {
    const props: ToolbarProps = {
      ...baseToolbar,
      columnPicker: {
        renderTree: () => null,
        triggerLabel: 'Export…',
        onExport: 'csv' as const,
      },
      getColumnVisibility: () => ({}),
      commitColumnVisibility: () => {},
    };
    render(wrap(<MuiTableToolbar {...props} />));
    expect(
      screen.getByRole('button', { name: /export…/i }),
    ).toBeInTheDocument();
  });
});

describe('MuiTableToolbar direct export button', () => {
  const directExportProps: ToolbarProps = {
    ...baseToolbar,
    columnPicker: {
      renderTree: () => null,
      directExportLabel: 'Export all rows',
      onExport: 'csv' as const,
    },
    getColumnVisibility: () => ({}),
    commitColumnVisibility: () => {},
    onDirectExport: async () => {},
  };

  it('direct export button is enabled by default', () => {
    render(wrap(<MuiTableToolbar {...directExportProps} />));
    expect(
      screen.getByRole('button', { name: /export all rows/i }),
    ).not.toBeDisabled();
  });
});
