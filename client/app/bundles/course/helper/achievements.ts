import achievementBlankUrl from 'assets/images/achievement-blank.png?url';
import achievementLockedUrl from 'assets/images/achievement-locked.svg?url';

export const getAchievementBadgeUrl = (
  badgeUrl: string | null | undefined,
  canDisplayBadge: boolean,
): string => {
  if (!canDisplayBadge) {
    return achievementLockedUrl;
  }
  if (!badgeUrl) {
    return achievementBlankUrl;
  }
  return badgeUrl;
};
