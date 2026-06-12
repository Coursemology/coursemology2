import { defineMessages } from 'react-intl';
import { Chip } from '@mui/material';

import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import {
  ColumnPickerRenderContext,
  ColumnPickerTreeGroup,
} from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import { STUDENT_INFO_COL_IDS, type StudentInfoColId } from '../constants';

const translations = defineMessages({
  studentInfo: {
    id: 'course.gradebook.GradebookColumnTree.studentInfo',
    defaultMessage: 'Student info',
  },
  alwaysIncluded: {
    id: 'course.gradebook.GradebookColumnTree.alwaysIncluded',
    defaultMessage: 'Always included',
  },
});

const WeightedGradebookColumnTree = ({
  isVisible,
  setVisible,
  setManyVisible,
}: ColumnPickerRenderContext): JSX.Element => {
  const { t } = useTranslation();
  const context: ColumnPickerRenderContext = {
    isVisible,
    setVisible,
    setManyVisible,
  };

  return (
    <div>
      <ColumnPickerTreeGroup
        childIds={[...STUDENT_INFO_COL_IDS]}
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
                  {t(tableTranslations[id])}
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
              label={t(tableTranslations[id])}
              onChange={(e) => setVisible(id, e.target.checked)}
            />
          ),
        )}
      </ColumnPickerTreeGroup>
    </div>
  );
};

export default WeightedGradebookColumnTree;
