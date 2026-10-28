import { render, screen } from 'test-utils';

import SidebarItem from '../SidebarItem';

const Icon = (): JSX.Element => <svg data-testid="icon" />;
const ActiveIcon = (): JSX.Element => <svg data-testid="active-icon" />;

describe('SidebarItem', () => {
  // jsdom does not implement scrollIntoView, which an active item calls to bring itself into view.
  const scrollIntoView = jest.fn();

  beforeEach(() => {
    scrollIntoView.mockClear();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  it('links to its destination with the given id and the inactive icon', async () => {
    render(
      <SidebarItem
        activeIcon={<ActiveIcon />}
        icon={<Icon />}
        id="sidebar_item_users"
        label="Users"
        to="/admin/users"
      />,
    );

    const link = (await screen.findByText('Users')).closest('a');
    expect(link).toHaveAttribute('href', '/admin/users');
    expect(link).toHaveAttribute('id', 'sidebar_item_users');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('active-icon')).not.toBeInTheDocument();
  });

  it('shows the active icon while active', async () => {
    render(
      <SidebarItem
        active
        activeIcon={<ActiveIcon />}
        icon={<Icon />}
        label="Users"
        to="/admin/users"
      />,
    );

    await screen.findByText('Users');
    expect(screen.getByTestId('active-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('is not a link without a destination', async () => {
    render(<SidebarItem icon={<Icon />} label="Users" />);

    expect((await screen.findByText('Users')).closest('a')).toBeNull();
  });
});
