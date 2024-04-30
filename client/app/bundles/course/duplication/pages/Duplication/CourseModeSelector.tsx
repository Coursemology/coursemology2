import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

import { duplicationModes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  newCourse: {
    id: 'course.duplication.Duplication.newCourse',
    defaultMessage: 'New Course',
  },
  existingCourse: {
    id: 'course.duplication.Duplication.existingCourse',
    defaultMessage: 'Existing Course',
  },
});

const CourseModeSelector: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);
  const { duplicationMode } = duplication;

  return (
    <RadioGroup
      className="mt-4"
      name="duplicationMode"
      onChange={(_, mode) => dispatch(actions.setDuplicationMode(mode))}
      value={duplicationMode}
    >
      <FormControlLabel
        key={duplicationModes.COURSE}
        control={<Radio className="py-0" />}
        label={t(translations.newCourse)}
        value={duplicationModes.COURSE}
      />
      <FormControlLabel
        key={duplicationModes.OBJECT}
        control={<Radio className="py-0" />}
        label={t(translations.existingCourse)}
        value={duplicationModes.OBJECT}
      />
    </RadioGroup>
  );
};

export default CourseModeSelector;
