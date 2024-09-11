import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Cancel, Delete, Undo } from '@mui/icons-material';
import {
  Icon,
  IconButton,
  InputAdornment,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  orderedIncorrectly: {
    id: 'course.level.Level.orderedIncorrectly',
    defaultMessage:
      'Levels will be sorted automatically when saved regardless of their order here.',
  },
  placeholder: {
    id: 'course.level.Level.placeholder',
    defaultMessage: '0',
  },
  resetTooltip: {
    id: 'course.level.Level.resetTooltip',
    defaultMessage: 'Reset changes',
  },
});

interface Props {
  row: {
    levelId: number;
    experiencePointsThreshold: number;
    originalThreshold: number;
    toBeDeleted: boolean;
    toBeAdded: boolean;
  };
  index: number;
  isThresholdOrderedCorrectly: (index: number) => boolean;
  canManage: boolean;
  isSaving: boolean;
  onThresholdChange: (index: number, newThreshold: number) => void;
  onResetThreshold: (index: number) => void;
  onDeleteLevel: (index: number) => void;
  onUndoDelete: (index: number) => void;
}

const getClassName = (
  deleted: boolean,
  added: boolean,
  index: number,
): string => {
  if (deleted) return 'bg-red-100';
  if (added) return 'bg-green-50';
  return index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
};

const LevelsTableRow: FC<Props> = ({
  row,
  index,
  isThresholdOrderedCorrectly,
  canManage,
  isSaving,
  onThresholdChange,
  onResetThreshold,
  onDeleteLevel,
  onUndoDelete,
}) => {
  const { t } = useTranslation();

  const isThresholdChanged =
    row.experiencePointsThreshold !== row.originalThreshold;

  return (
    <TableRow
      className={`${getClassName(row.toBeDeleted, row.toBeAdded, index)}`}
    >
      <TableCell className="p-6">
        <Typography>{index + 1}</Typography>
      </TableCell>

      <TableCell>
        <Tooltip
          arrow
          placement="top"
          title={
            !isThresholdOrderedCorrectly(index + 1)
              ? t(translations.orderedIncorrectly)
              : ''
          }
        >
          <TextField
            disabled={!canManage || isSaving || row.toBeDeleted}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {isThresholdChanged && !row.toBeDeleted && !row.toBeAdded ? (
                    <Tooltip
                      placement="top"
                      title={t(translations.resetTooltip)}
                    >
                      <IconButton
                        disabled={isSaving || row.toBeDeleted}
                        edge="end"
                        onClick={() => onResetThreshold(index)}
                        size="small"
                      >
                        <Cancel color="disabled" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton disabled>
                      <Icon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              const inputValue = Number(e.target.value);
              if (!Number.isNaN(inputValue)) {
                onThresholdChange(index, inputValue);
              }
            }}
            placeholder={t(translations.placeholder)}
            size="small"
            value={row.experiencePointsThreshold || ''}
            variant="outlined"
          />
        </Tooltip>
      </TableCell>

      <TableCell>
        {canManage && !row.toBeDeleted && (
          <IconButton disabled={isSaving} onClick={() => onDeleteLevel(index)}>
            <Delete
              color={isSaving ? 'disabled' : 'error'}
              id={`delete_${index + 1}`}
            />
          </IconButton>
        )}
        {canManage && row.toBeDeleted && (
          <IconButton disabled={isSaving} onClick={() => onUndoDelete(index)}>
            <Undo color={isSaving ? 'disabled' : 'primary'} />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

export default LevelsTableRow;
