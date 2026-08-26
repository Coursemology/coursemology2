import Page from 'lib/components/core/layouts/Page';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import ColumnVisibilityDropdown from '../../containers/ColumnVisibilityDropdown';
import NewEventButton from '../../containers/LessonPlanLayout/NewEventButton';
import NewMilestoneButton from '../../containers/LessonPlanLayout/NewMilestoneButton';
import translations from '../../translations';
import { LessonPlanEditColumn, LessonPlanGroup } from '../../types';

import ItemRow from './ItemRow';
import MilestoneRow from './MilestoneRow';

interface LessonPlanEditProps {
  groups: LessonPlanGroup[];
  columnsVisible: Record<string, boolean>;
  canManageLessonPlan: boolean;
}

export const LessonPlanEdit = (props: LessonPlanEditProps): JSX.Element => {
  const { groups, columnsVisible, canManageLessonPlan } = props;

  const { t } = useTranslation();
  const courseId = getCourseId();

  const renderGroup = (group: LessonPlanGroup): JSX.Element[] => {
    const { id, milestone, items } = group;

    const rows = items
      ? items.map((item) => (
          <ItemRow
            key={item.id}
            bonusEndAt={item.bonus_end_at}
            endAt={item.end_at}
            id={item.id}
            itemPath={item.item_path}
            published={item.published}
            startAt={item.start_at}
            title={item.title}
            type={item.itemTypeKey ?? ''}
          />
        ))
      : [];

    if (milestone) {
      rows.unshift(
        <MilestoneRow
          key={`milestone-${id}`}
          groupId={id}
          id={milestone.id}
          startAt={milestone.start_at ?? null}
          title={milestone.title}
        />,
      );
    }

    return rows;
  };

  const headerFor = (field: LessonPlanEditColumn): JSX.Element => (
    <th>{t(translations[field])}</th>
  );

  return (
    <Page
      actions={
        canManageLessonPlan && (
          <div className="space-x-4">
            <NewMilestoneButton />
            <NewEventButton />
            <ColumnVisibilityDropdown />
          </div>
        )
      }
      backTo={`/courses/${courseId}/lesson_plan`}
      title={t(translations.editLessonPlan)}
    >
      <div className="mt-8">
        <table className="border-separate border-spacing-x-4">
          <thead>
            <tr>
              {columnsVisible.ITEM_TYPE ? headerFor('ITEM_TYPE') : null}
              <th>{t(translations.title)}</th>
              {columnsVisible.START_AT ? headerFor('START_AT') : null}
              {columnsVisible.BONUS_END_AT ? headerFor('BONUS_END_AT') : null}
              {columnsVisible.END_AT ? headerFor('END_AT') : null}
              {columnsVisible.PUBLISHED ? headerFor('PUBLISHED') : null}
            </tr>
          </thead>
          <tbody>{groups.map(renderGroup)}</tbody>
        </table>
      </div>
    </Page>
  );
};

const ConnectedLessonPlanEdit = (): JSX.Element => {
  const groups = useAppSelector((state) => state.lessonPlan.lessonPlan.groups);
  // Field by field; see LessonPlanLayout.
  const columnsVisible = useAppSelector(
    (state) => state.lessonPlan.flags.editPageColumnsVisible,
  );
  const canManageLessonPlan = useAppSelector(
    (state) => state.lessonPlan.flags.canManageLessonPlan,
  );

  return (
    <LessonPlanEdit
      canManageLessonPlan={canManageLessonPlan}
      columnsVisible={columnsVisible}
      groups={groups}
    />
  );
};

export default ConnectedLessonPlanEdit;
