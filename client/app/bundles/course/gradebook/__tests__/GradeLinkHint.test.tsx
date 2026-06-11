import { store as appStore } from 'store';
import { fireEvent, render, screen, waitFor } from 'test-utils';

import GradeLinkHint, {
  GRADE_LINK_HINT_KEY,
} from '../components/GradeLinkHint';

const USER_ID = 42;
const STORAGE_KEY = `${USER_ID}:${GRADE_LINK_HINT_KEY}`;

// The dismissal flag is namespaced by the authenticated user id from the global
// user store, which the course layout loader hydrates on every course page.
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
  render(<GradeLinkHint />, { state: userState });
};

beforeEach(() => localStorage.clear());

describe('GradeLinkHint', () => {
  it('explains that grades are clickable and lead to the submission', async () => {
    renderHint();
    expect(await screen.findByText(/click any grade/i)).toBeInTheDocument();
  });

  it('hides and persists dismissal when the close button is clicked', async () => {
    renderHint();
    fireEvent.click(await screen.findByRole('button', { name: /close/i }));

    expect(screen.queryByText(/click any grade/i)).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('does not render when already dismissed', async () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    renderHint();
    // Wait for the async locale load to settle (spinner gone) before asserting
    // absence, so we are not just observing the pre-load loading state.
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
    );
    expect(screen.queryByText(/click any grade/i)).not.toBeInTheDocument();
  });
});
