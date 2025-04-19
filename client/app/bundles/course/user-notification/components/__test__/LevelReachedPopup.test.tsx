import { render, within } from 'test-utils';
import { LevelReachedNotification } from 'types/course/userNotifications';

import LevelReachedPopup from '../LevelReachedPopup';

const renderPopup = async (
  data: LevelReachedNotification,
): Promise<HTMLElement> => {
  const page = render(
    <LevelReachedPopup notification={data} onDismiss={jest.fn()} />,
  );

  return page.findByRole('dialog');
};

describe('<LevelReachedPopup />', () => {
  describe('when leaderboard is disabled', () => {
    it('shows the reached level but does not show leaderboard button', async () => {
      const popup = within(
        await renderPopup({
          id: 69,
          notificationType: 'levelReached',
          levelNumber: 5,
          leaderboardEnabled: false,
          leaderboardPosition: null,
        }),
      );

      expect(popup.getByText('Level 5', { exact: false })).toBeVisible();

      expect(
        popup.queryByRole('button', { name: 'Leaderboard' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when the student is on the leaderboard', () => {
    it('shows the reached level, position, and the leaderboard button', async () => {
      const popup = within(
        await renderPopup({
          id: 69,
          notificationType: 'levelReached',
          levelNumber: 5,
          leaderboardEnabled: true,
          leaderboardPosition: 2,
        }),
      );

      expect(popup.getByText('Level 5', { exact: false })).toBeVisible();
      expect(popup.getByText('position 2', { exact: false })).toBeVisible();
      expect(popup.getByRole('button', { name: 'Leaderboard' })).toBeVisible();
    });
  });

  describe('when the student is not on the leaderboard', () => {
    it('shows the reached level, leaderboard button, but no position', async () => {
      const popup = within(
        await renderPopup({
          id: 69,
          notificationType: 'levelReached',
          levelNumber: 5,
          leaderboardEnabled: true,
          leaderboardPosition: null,
        }),
      );

      expect(popup.getByText('Level 5', { exact: false })).toBeVisible();

      expect(
        popup.queryByText('position', { exact: false }),
      ).not.toBeInTheDocument();

      expect(
        popup.queryByRole('button', { name: 'Leaderboard' }),
      ).toBeVisible();
    });
  });
});
