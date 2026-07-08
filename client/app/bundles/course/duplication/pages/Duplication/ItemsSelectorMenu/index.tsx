import { FC } from 'react';
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors';
import { actions } from 'course/duplication/store';
import {
  DUPLICABLE_ITEM_TYPES,
  DuplicableItemType,
  ItemSelectorPanel,
} from 'course/duplication/types';
import componentTranslations from 'course/translations';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateButton from '../DuplicateButton';

interface ItemsSelectorSidebarItemProps {
  panelKey: ItemSelectorPanel;
  titleKey: string;
  count: number;
  className: string;
}

const ItemsSelectorSidebarItem: FC<ItemsSelectorSidebarItemProps> = ({
  panelKey,
  titleKey,
  count,
  className,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <ListItemButton
      className={className}
      onClick={() => dispatch(actions.setItemSelectorPanel(panelKey))}
    >
      <ListItemAvatar>
        <Avatar className={`w-12 h-12 m-2 ${count > 0 ? 'bg-cyan-500' : ''}`}>
          {count}
        </Avatar>
      </ListItemAvatar>
      <ListItemText>{t(componentTranslations[titleKey])}</ListItemText>
    </ListItemButton>
  );
};

const ItemsSelectorMenu: FC = () => {
  const {
    selectedItems,
    destinationCourses,
    destinationCourseId,
    sourceCourse: { enabledComponents },
  } = useAppSelector(selectDuplicationStore);

  // Disabled models for cherry pick duplication as defined in `disabled_cherrypickable_types`.
  const unduplicableObjectTypes =
    destinationCourses.find((course) => course.id === destinationCourseId)
      ?.unduplicableObjectTypes ?? DUPLICABLE_ITEM_TYPES;

  const counts: Record<DuplicableItemType, number> = {} as Record<
    DuplicableItemType,
    number
  >;
  DUPLICABLE_ITEM_TYPES.forEach((itemType) => {
    const idsHash = selectedItems[itemType];
    counts[itemType] = Object.keys(idsHash).reduce(
      (count, id) => (idsHash[id] ? count + 1 : count),
      0,
    );
  });

  const assessmentsComponentCount =
    counts.TAB + counts.ASSESSMENT + counts.CATEGORY;
  const videosComponentCount = counts.VIDEO + counts.VIDEO_TAB;

  const shouldRenderSidebarItem = (
    panelKey: ItemSelectorPanel,
    objectKey: DuplicableItemType,
  ): boolean =>
    !unduplicableObjectTypes.includes(objectKey) &&
    enabledComponents.includes(panelKey);

  return (
    <List className="items-selector-menu">
      {shouldRenderSidebarItem('ASSESSMENTS', 'ASSESSMENT') && (
        <ItemsSelectorSidebarItem
          className="items-selector-menu-assessment"
          count={assessmentsComponentCount}
          panelKey="ASSESSMENTS"
          titleKey="course_assessments_component"
        />
      )}
      {shouldRenderSidebarItem('SURVEYS', 'SURVEY') && (
        <ItemsSelectorSidebarItem
          className="items-selector-menu-survey"
          count={counts.SURVEY}
          panelKey="SURVEYS"
          titleKey="course_survey_component"
        />
      )}
      {shouldRenderSidebarItem('ACHIEVEMENTS', 'ACHIEVEMENT') && (
        <ItemsSelectorSidebarItem
          className="items-selector-menu-achievement"
          count={counts.ACHIEVEMENT}
          panelKey="ACHIEVEMENTS"
          titleKey="course_achievements_component"
        />
      )}
      {shouldRenderSidebarItem('MATERIALS', 'MATERIAL') && (
        <ItemsSelectorSidebarItem
          className="items-selector-menu-material"
          count={counts.FOLDER + counts.MATERIAL}
          panelKey="MATERIALS"
          titleKey="course_materials_component"
        />
      )}
      {shouldRenderSidebarItem('VIDEOS', 'VIDEO') && (
        <ItemsSelectorSidebarItem
          className="items-selector-menu-video"
          count={videosComponentCount}
          panelKey="VIDEOS"
          titleKey="course_videos_component"
        />
      )}
      <ListItem className="flex justify-center">
        <DuplicateButton />
      </ListItem>
    </List>
  );
};

export default ItemsSelectorMenu;
