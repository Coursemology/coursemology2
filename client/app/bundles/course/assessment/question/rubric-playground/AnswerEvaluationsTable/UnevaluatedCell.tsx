import { FC } from 'react';
import { PlayArrow } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

import { AnswerTableEntry } from './types';

const UnevaluatedCell: FC<{
  answer: AnswerTableEntry;
  handleEvaluate: () => void;
  compact?: boolean;
}> = ({ answer, compact, handleEvaluate }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full bg-gray-100 px-6 py-3 flex items-center justify-start">
      {compact && (
        <Tooltip title={t(translations.evaluate)}>
          <IconButton
            className="p-0"
            color="primary"
            disabled={answer.isEvaluating}
            onClick={handleEvaluate}
          >
            <PlayArrow />
          </IconButton>
        </Tooltip>
      )}
      {!compact && (
        <Button
          className="w-fit whitespace-nowrap"
          color="primary"
          disabled={answer.isEvaluating}
          onClick={handleEvaluate}
          startIcon={
            answer.isEvaluating ? (
              <LoadingIndicator bare size={15} />
            ) : (
              <PlayArrow />
            )
          }
          variant="outlined"
        >
          {answer.isEvaluating
            ? t(translations.evaluating)
            : t(translations.evaluate)}
        </Button>
      )}
    </div>
  );
};

export default UnevaluatedCell;
