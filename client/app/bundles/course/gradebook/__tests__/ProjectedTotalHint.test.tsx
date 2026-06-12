import { store as appStore } from 'store';
import { fireEvent, render, screen } from 'test-utils';

import ProjectedTotalHint, {
  PROJECTED_TOTAL_POLICY_HINT_KEY,
} from '../components/ProjectedTotalHint';

const USER_ID = 42;
const STORAGE_KEY = `${USER_ID}:${PROJECTED_TOTAL_POLICY_HINT_KEY}`;

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
  render(<ProjectedTotalHint />, { state: userState });
};

beforeEach(() => localStorage.clear());

describe('ProjectedTotalHint', () => {
  it('teaches the projected-total policy on first view', () => {
    renderHint();
    expect(screen.getByText(/ungraded assessments as 0/i)).toBeInTheDocument();
  });

  it('hides and persists dismissal when the close button is clicked', () => {
    renderHint();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(
      screen.queryByText(/ungraded assessments as 0/i),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('does not render when already dismissed', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    renderHint();
    expect(
      screen.queryByText(/ungraded assessments as 0/i),
    ).not.toBeInTheDocument();
  });
});
