import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import MuiTableToolbar from '../MuiTableAdapter/MuiTableToolbar';
import { ToolbarProps } from '../adapters';

const baseToolbar: ToolbarProps = {
  renderNative: true,
  searchKeyword: '',
  onSearchKeywordChange: () => {},
};

const wrap = (node: JSX.Element): JSX.Element => (
  <IntlProvider locale="en" defaultLocale="en">
    {node}
  </IntlProvider>
);

describe('MuiTableToolbar columnPicker trigger', () => {
  it('does not render Export… button when columnPicker is unset', () => {
    render(wrap(<MuiTableToolbar {...baseToolbar} />));
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
  });

  it('renders Export… button when columnPicker is set', () => {
    const props: ToolbarProps = {
      ...baseToolbar,
      columnPicker: {
        renderTree: () => null,
        triggerLabel: 'Export…',
      },
      getColumnVisibility: () => ({}),
      commitColumnVisibility: () => {},
    };
    render(wrap(<MuiTableToolbar {...props} />));
    expect(screen.getByRole('button', { name: /export…/i })).toBeInTheDocument();
  });
});
