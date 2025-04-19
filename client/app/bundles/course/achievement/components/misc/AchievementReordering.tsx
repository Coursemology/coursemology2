import { useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import { LoadingButton } from '@mui/lab';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

interface AchievementReorderingProps {
  handleReordering: (state: boolean) => void;
  isReordering: boolean;
}

const translations = defineMessages({
  startReorderAchievement: {
    id: 'course.achievement.AchievementReordering.startReorderAchievement',
    defaultMessage: 'Reorder',
  },
  endReorderAchievement: {
    id: 'course.achievement.AchievementReordering.endReorderAchievement',
    defaultMessage: 'Done reordering',
  },
  updateFailed: {
    id: 'course.achievement.AchievementReordering.updateFailed',
    defaultMessage: 'Reorder Failed.',
  },
  updateSuccess: {
    id: 'course.achievement.AchievementReordering.updateSuccess',
    defaultMessage: 'Achievements successfully reordered',
  },
});

const AchievementReordering = (
  props: AchievementReorderingProps,
): JSX.Element => {
  const { handleReordering, isReordering } = props;

  const { t } = useTranslation();

  async function submitReordering(ordering: string): Promise<void> {
    try {
      await CourseAPI.achievements.reorder(ordering);
      toast.success(t(translations.updateSuccess));
    } catch {
      toast.error(t(translations.updateFailed));
    }
  }

  const [loadingSortable, setLoadingSortable] = useState(false);

  const sortableCallbacksRef = useRef<{
    enable: () => void;
    disable: () => void;
  }>();

  return (
    <LoadingButton
      color="primary"
      loading={loadingSortable}
      loadingPosition="start"
      onClick={(): void => {
        if (loadingSortable) return;

        if (!sortableCallbacksRef.current) {
          setLoadingSortable(true);

          (async (): Promise<void> => {
            const [jquery] = await Promise.all([
              import(
                /* webpackChunkName: "jquery-sortable" */
                'jquery'
              ),
              import(
                /* webpackChunkName: "jquery-sortable" */
                'jquery-ui/ui/widgets/sortable'
              ),
            ]);

            sortableCallbacksRef.current = {
              enable: (): void => {
                const table = jquery.default('tbody').first();

                table.sortable({
                  disabled: false,
                  update() {
                    const ordering = table.sortable('serialize', {
                      attribute: 'achievementid',
                      key: 'achievement_order[]',
                    });

                    submitReordering(ordering);
                  },
                });

                handleReordering(true);
              },
              disable: (): void => {
                jquery.default('tbody').first().sortable({ disabled: true });
                handleReordering(false);
              },
            };

            sortableCallbacksRef.current.enable();

            setLoadingSortable(false);
          })();

          return;
        }

        if (isReordering) {
          sortableCallbacksRef.current.disable();
        } else {
          sortableCallbacksRef.current.enable();
        }
      }}
      variant={isReordering ? 'contained' : 'outlined'}
    >
      {isReordering
        ? t(translations.endReorderAchievement)
        : t(translations.startReorderAchievement)}
    </LoadingButton>
  );
};

export default AchievementReordering;
