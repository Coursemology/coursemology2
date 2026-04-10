import { FC } from 'react';
import {
  CropSquareRounded,
  RadioButtonUncheckedRounded,
} from '@mui/icons-material';
import { Button } from '@mui/material';

import { ScribingShape } from 'course/assessment/submission/constants';
import useTranslation from 'lib/hooks/useTranslation';

import { scribingTranslations as translations } from '../../../translations';

interface ShapeFieldProps {
  currentShape: ScribingShape;
  setSelectedShape: (shape: ScribingShape) => void;
}

const ShapeField: FC<ShapeFieldProps> = (props) => {
  const { currentShape, setSelectedShape } = props;
  const { t } = useTranslation();

  return (
    <>
      <Button
        color={currentShape === 'RECT' ? 'primary' : 'info'}
        onClick={() => setSelectedShape('RECT')}
        startIcon={<CropSquareRounded />}
      >
        {t(translations.rectangle)}
      </Button>

      <Button
        color={currentShape === 'ELLIPSE' ? 'primary' : 'info'}
        onClick={() => setSelectedShape('ELLIPSE')}
        startIcon={<RadioButtonUncheckedRounded />}
      >
        {t(translations.ellipse)}
      </Button>
    </>
  );
};

export default ShapeField;
