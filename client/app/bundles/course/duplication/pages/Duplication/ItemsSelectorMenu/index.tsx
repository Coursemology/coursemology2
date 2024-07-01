import { FC } from 'react';
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';

import {
  duplicableItemTypes,
  itemSelectorPanels as panels,
} from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateButton from '../DuplicateButton';

const {
  TAB,
  ASSESSMENT,
  CATEGORY,
  SURVEY,
  ACHIEVEMENT,
  FOLDER,
  MATERIAL,
  VIDEO_TAB,
  VIDEO,
} = duplicableItemTypes;

interface SidebarItemsProps {
  className: string;
  panelKey: string;
  titleKey: string;
  count: number;
}

const SidebarItem: FC<SidebarItemsProps> = (props) => {
  const { className, panelKey, titleKey, count } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);
  const {
    sourceCourse: { enabledComponents },
  } = duplication;

  if (!enabledComponents.includes(panelKey)) {
    return <div />;
  }

  if (enabledComponents.length === 1) {
    dispatch(actions.setItemSelectorPanel(panelKey));
  }

  return (
    <ListItem
      button
      className={className}
      onClick={() => dispatch(actions.setItemSelectorPanel(panelKey))}
    >
      <ListItemAvatar className="h-[50px] flex items-center">
        <Avatar
          className={`h-[30px] w-[30px] m-5 ${count > 0 && 'bg-cyan-500'}`}
        >
          {count}
        </Avatar>
      </ListItemAvatar>
      <ListItemText>{t(defaultComponentTitles[titleKey])}</ListItemText>
    </ListItem>
  );
};

const ItemsSelectorMenu: FC = () => {
  const duplication = useAppSelector(selectDuplicationStore);
  const { selectedItems, destinationCourseId, destinationCourses } =
    duplication;

  const unduplicableObjectTypes = destinationCourses.find(
    (course) => course.id === destinationCourseId,
  ).unduplicableObjectTypes;

  const counts = {};
  Object.keys(selectedItems).forEach((key) => {
    const idsHash = selectedItems[key];
    counts[key] = Object.keys(idsHash).reduce(
      (count, id) => (idsHash[id] ? count + 1 : count),
      0,
    );
  });

  const assessmentsComponentCount =
    counts[TAB] + counts[ASSESSMENT] + counts[CATEGORY];
  const videosComponentCount = counts[VIDEO] + counts[VIDEO_TAB];

  return (
    <List className="items-selector-menu">
      {!unduplicableObjectTypes.includes('ASSESSMENT') && (
        <SidebarItem
          className="items-selector-menu-assessment"
          count={assessmentsComponentCount}
          panelKey={panels.ASSESSMENTS}
          titleKey="course_assessments_component"
        />
      )}
      {!unduplicableObjectTypes.includes('SURVEY') && (
        <SidebarItem
          className="items-selector-menu-survey"
          count={counts[SURVEY]}
          panelKey={panels.SURVEYS}
          titleKey="course_survey_component"
        />
      )}
      {!unduplicableObjectTypes.includes('ACHIEVEMENT') && (
        <SidebarItem
          className="items-selector-menu-achievement"
          count={counts[ACHIEVEMENT]}
          panelKey={panels.ACHIEVEMENTS}
          titleKey="course_achievements_component"
        />
      )}
      {!unduplicableObjectTypes.includes('MATERIAL') && (
        <SidebarItem
          className="items-selector-menu-material"
          count={counts[FOLDER] + counts[MATERIAL]}
          panelKey={panels.MATERIALS}
          titleKey="course_materials_component"
        />
      )}
      {!unduplicableObjectTypes.includes('VIDEO') && (
        <SidebarItem
          className="items-selector-menu-video"
          count={videosComponentCount}
          panelKey={panels.VIDEOS}
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
