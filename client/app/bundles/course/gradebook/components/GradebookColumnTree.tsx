import { useMemo } from 'react';
import { defineMessages } from 'react-intl';

import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import { ColumnPickerRenderCtx, ColumnPickerTreeGroup } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';

import type { AssessmentData, CategoryData, TabData } from '../types';
import { buildAssessmentColumnId } from './buildAssessmentColumnIds';

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
  externalId: {
    id: 'course.gradebook.GradebookColumnTree.externalId',
    defaultMessage: 'External ID',
  },
  level: {
    id: 'course.gradebook.GradebookColumnTree.level',
    defaultMessage: 'Level',
  },
  assessments: {
    id: 'course.gradebook.GradebookColumnTree.assessments',
    defaultMessage: 'Assessments',
  },
});

interface GradebookColumnTreeProps extends ColumnPickerRenderCtx {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
}

const GradebookColumnTree = ({
  isVisible,
  setVisible,
  setManyVisible,
  categories,
  tabs,
  assessments,
}: GradebookColumnTreeProps): JSX.Element => {
  const { t } = useTranslation();
  const ctx: ColumnPickerRenderCtx = { isVisible, setVisible, setManyVisible };

  const studentAllIds = useMemo(() => ['name', 'email', 'externalId', 'level'], []);

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
        childIds={studentAllIds}
        ctx={ctx}
        indentLevel={0}
        label={t(translations.studentInfo)}
        locked={['name']}
      >
        <IndentedCheckbox checked disabled indentLevel={1} label={t(translations.name)} />
        {(['email', 'externalId', 'level'] as const).map((id) => (
          <IndentedCheckbox
            key={id}
            checked={isVisible(id)}
            indentLevel={1}
            label={t(translations[id])}
            onChange={(e) => setVisible(id, e.target.checked)}
          />
        ))}
      </ColumnPickerTreeGroup>

      <ColumnPickerTreeGroup
        childIds={asnIds}
        ctx={ctx}
        indentLevel={0}
        label={t(translations.assessments)}
      >
        {categories.map((cat) => {
          const catIds = catAsnIds.get(cat.id) ?? [];
          const catTabs = tabs.filter((tab) => tab.categoryId === cat.id);
          return (
            <ColumnPickerTreeGroup
              key={cat.id}
              childIds={catIds}
              ctx={ctx}
              indentLevel={1}
              label={cat.title}
            >
              {catTabs.map((tab) => {
                const tabIds = tabAsnIds.get(tab.id) ?? [];
                const tabAsns = assessments.filter((a) => a.tabId === tab.id);
                return (
                  <ColumnPickerTreeGroup
                    key={tab.id}
                    childIds={tabIds}
                    ctx={ctx}
                    indentLevel={2}
                    label={tab.title}
                  >
                    {tabAsns.map((asn) => {
                      const id = buildAssessmentColumnId(asn.id);
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
