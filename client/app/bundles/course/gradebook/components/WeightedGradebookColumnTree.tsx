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
  alwaysIncluded: {
    id: 'course.gradebook.GradebookColumnTree.alwaysIncluded',
    defaultMessage: 'Always included',
  },
});

interface WeightedGradebookColumnTreeProps extends ColumnPickerRenderContext {
  gamificationEnabled: boolean;
}

const EXTERNAL_ID = 'externalId';
const STUDENT_ALL_IDS = [...STUDENT_INFO_COL_IDS, EXTERNAL_ID];
const GAMIFICATION_ALL_IDS = [...GAMIFICATION_COL_IDS];

const WeightedGradebookColumnTree = ({
  isVisible,
  setVisible,
  setManyVisible,
  gamificationEnabled,
}: WeightedGradebookColumnTreeProps): JSX.Element => {
  const { t } = useTranslation();
  const context: ColumnPickerRenderContext = {
    isVisible,
    setVisible,
    setManyVisible,
  };

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
    </div>
  );
};

export default WeightedGradebookColumnTree;
