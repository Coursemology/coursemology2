import { useMemo } from 'react';
import { defineMessages } from 'react-intl';
import { Chip } from '@mui/material';

import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import {
  ColumnPickerRenderContext,
  ColumnPickerTreeGroup,
} from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import {
  GAMIFICATION_COL_IDS,
  type GamificationColId,
  STUDENT_INFO_COL_IDS,
  type StudentInfoColId,
} from '../constants';
import type { AssessmentData, CategoryData, TabData } from '../types';

import {
  buildAssessmentColumnId,
  parseAssessmentColumnId,
} from './buildAssessmentColumnIds';

const translations = defineMessages({
  studentInfo: {
    id: 'course.gradebook.GradebookColumnTree.studentInfo',
    defaultMessage: 'Student info',
  },
  name: {
    id: 'course.gradebook.GradebookColumnTree.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'course.gradebook.GradebookColumnTree.email',
    defaultMessage: 'Email',
  },
  level: {
    id: 'course.gradebook.GradebookColumnTree.level',
    defaultMessage: 'Level',
  },
  totalXp: {
    id: 'course.gradebook.GradebookColumnTree.totalXp',
    defaultMessage: 'Total XP',
  },
  gamification: {
    id: 'course.gradebook.GradebookColumnTree.gamification',
    defaultMessage: 'Gamification',
  },
  grades: {
    id: 'course.gradebook.GradebookColumnTree.grades',
    defaultMessage: 'Grades',
  },
  alwaysIncluded: {
    id: 'course.gradebook.GradebookColumnTree.alwaysIncluded',
    defaultMessage: 'Always included',
  },
});

interface GradebookColumnTreeProps extends ColumnPickerRenderContext {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  gamificationEnabled: boolean;
}

const EXTERNAL_ID = 'externalId';
const STUDENT_ALL_IDS = [...STUDENT_INFO_COL_IDS, EXTERNAL_ID];
const GAMIFICATION_ALL_IDS = [...GAMIFICATION_COL_IDS];

const GradebookColumnTree = ({
  isVisible,
  setVisible,
  setManyVisible,
  categories,
  tabs,
  assessments,
  gamificationEnabled,
}: GradebookColumnTreeProps): JSX.Element => {
  const { t } = useTranslation();
  const context: ColumnPickerRenderContext = {
    isVisible,
    setVisible,
    setManyVisible,
  };

  const asnIds = useMemo(
    () => assessments.map((a) => buildAssessmentColumnId(a.id)),
    [assessments],
  );

  const tabAsnIds = useMemo(() => {
    const map = new Map<number, string[]>();
    assessments.forEach((a) => {
      const existing = map.get(a.tabId) ?? [];
      map.set(a.tabId, [...existing, buildAssessmentColumnId(a.id)]);
    });
    return map;
  }, [assessments]);

  const catTabs = useMemo(() => {
    const map = new Map<number, TabData[]>();
    tabs.forEach((tab) => {
      const existing = map.get(tab.categoryId) ?? [];
      map.set(tab.categoryId, [...existing, tab]);
    });
    return map;
  }, [tabs]);

  const asnById = useMemo(
    () => new Map(assessments.map((a) => [a.id, a])),
    [assessments],
  );

  const catAsnIds = useMemo(() => {
    const map = new Map<number, string[]>();
    tabs.forEach((tab) => {
      const tabIds = tabAsnIds.get(tab.id) ?? [];
      const existing = map.get(tab.categoryId) ?? [];
      map.set(tab.categoryId, [...existing, ...tabIds]);
    });
    return map;
  }, [tabs, tabAsnIds]);

  return (
    <div>
      <ColumnPickerTreeGroup
        childIds={STUDENT_ALL_IDS}
        context={context}
        indentLevel={0}
        label={t(translations.studentInfo)}
      >
        {STUDENT_INFO_COL_IDS.map((id: StudentInfoColId) =>
          id === 'name' ? (
            <IndentedCheckbox
              key={id}
              checked
              disabled
              indentLevel={1}
              label={
                <span className="flex items-center gap-2">
                  {t(translations[id])}
                  <Chip
                    color="primary"
                    label={t(translations.alwaysIncluded)}
                    size="small"
                    variant="outlined"
                  />
                </span>
              }
            />
          ) : (
            <IndentedCheckbox
              key={id}
              checked={isVisible(id)}
              indentLevel={1}
              label={t(translations[id])}
              onChange={(e) => setVisible(id, e.target.checked)}
            />
          ),
        )}
        <IndentedCheckbox
          checked={isVisible(EXTERNAL_ID)}
          indentLevel={1}
          label={t(tableTranslations.externalId)}
          onChange={(e) => setVisible(EXTERNAL_ID, e.target.checked)}
        />
      </ColumnPickerTreeGroup>

      {gamificationEnabled && (
        <ColumnPickerTreeGroup
          childIds={GAMIFICATION_ALL_IDS}
          context={context}
          indentLevel={0}
          label={t(translations.gamification)}
        >
          {GAMIFICATION_COL_IDS.map((id: GamificationColId) => (
            <IndentedCheckbox
              key={id}
              checked={isVisible(id)}
              indentLevel={1}
              label={t(translations[id])}
              onChange={(e) => setVisible(id, e.target.checked)}
            />
          ))}
        </ColumnPickerTreeGroup>
      )}

      <ColumnPickerTreeGroup
        childIds={asnIds}
        context={context}
        indentLevel={0}
        label={t(translations.grades)}
      >
        {categories.map((cat) => {
          const catIds = catAsnIds.get(cat.id) ?? [];
          const thisCatTabs = catTabs.get(cat.id) ?? [];
          return (
            <ColumnPickerTreeGroup
              key={cat.id}
              childIds={catIds}
              context={context}
              indentLevel={1}
              label={cat.title}
            >
              {thisCatTabs.map((tab) => {
                const tabIds = tabAsnIds.get(tab.id) ?? [];
                return (
                  <ColumnPickerTreeGroup
                    key={tab.id}
                    childIds={tabIds}
                    context={context}
                    indentLevel={2}
                    label={tab.title}
                  >
                    {tabIds.map((id) => {
                      const asnId = parseAssessmentColumnId(id);
                      const asn =
                        asnId !== null ? asnById.get(asnId) : undefined;
                      if (!asn) return null;
                      return (
                        <IndentedCheckbox
                          key={asn.id}
                          checked={isVisible(id)}
                          indentLevel={3}
                          label={asn.title}
                          onChange={(e) => setVisible(id, e.target.checked)}
                        />
                      );
                    })}
                  </ColumnPickerTreeGroup>
                );
              })}
            </ColumnPickerTreeGroup>
          );
        })}
      </ColumnPickerTreeGroup>
    </div>
  );
};

export default GradebookColumnTree;
