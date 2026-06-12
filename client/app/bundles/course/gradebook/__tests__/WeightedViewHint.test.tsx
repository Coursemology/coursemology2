import { store as appStore } from 'store';
import { fireEvent, render, screen } from 'test-utils';

import WeightedViewHint, {
  WEIGHTED_VIEW_HINT_KEY,
} from '../components/WeightedViewHint';

const USER_ID = 42;
const STORAGE_KEY = `${USER_ID}:${WEIGHTED_VIEW_HINT_KEY}`;

const userState = {
  global: {
    ...appStore.getState().global,
    user: {
      ...appStore.getState().global.user,
      user: { id: USER_ID, name: '', imageUrl: '' },
    },
  },
};

const renderHint = (): void => {
  render(<WeightedViewHint courseId={7} />, { state: userState });
};

beforeEach(() => localStorage.clear());

describe('WeightedViewHint', () => {
  it('renders the capability hint with a link to gradebook settings', () => {
    renderHint();
    // Copy names the capability (weighted total grade), not the mechanism.
    expect(screen.getByText(/weighted total/i)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /gradebook settings/i });
    expect(link).toHaveAttribute('href', '/courses/7/admin/gradebook');
  });

  it('hides and persists dismissal when the close button is clicked', () => {
    renderHint();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByText(/weighted total/i)).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('does not render when already dismissed', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    renderHint();
    expect(screen.queryByText(/weighted total/i)).not.toBeInTheDocument();
  });
});
