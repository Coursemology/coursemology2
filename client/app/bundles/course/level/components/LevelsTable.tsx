import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Add } from '@mui/icons-material';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import LevelsTableRow from './LevelsTableRow';

const translations = defineMessages({
  levelHeader: {
    id: 'course.level.Level.levelHeader',
    defaultMessage: 'Level',
  },
  thresholdHeader: {
    id: 'course.level.Level.thresholdHeader',
    defaultMessage: 'EXP Threshold',
  },
  addNewLevel: {
    id: 'course.level.Level.addNewLevel',
    defaultMessage: 'Add New Level',
  },
  orderedIncorrectly: {
    id: 'course.level.Level.orderedIncorrectly',
    defaultMessage:
      'Levels will be sorted automatically when saved regardless of their order here.',
  },
});

interface Props {
  levels: {
    levelId: number;
    experiencePointsThreshold: number;
    originalThreshold: number;
    toBeDeleted: boolean;
    toBeAdded: boolean;
  }[];
  canManage: boolean;
  isSaving: boolean;
  onAddLevel: () => void;
  onThresholdChange: (index: number, newThreshold: number) => void;
  onResetThreshold: (index: number) => void;
  onDeleteLevel: (index: number) => void;
  onUndoDelete: (index: number) => void;
}

const LevelsTable: FC<Props> = ({
  levels,
  canManage,
  isSaving,
  onAddLevel,
  onThresholdChange,
  onResetThreshold,
  onDeleteLevel,
  onUndoDelete,
}) => {
  const { t } = useTranslation();
  const isThresholdOrderedCorrectly = (index: number): boolean =>
    index === 0 ||
    levels[index].experiencePointsThreshold >
      levels[index - 1].experiencePointsThreshold;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell className="p-6">
            <Typography>{t(translations.levelHeader)}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{t(translations.thresholdHeader)}</Typography>
          </TableCell>
          <TableCell />
        </TableRow>
      </TableHead>

      <TableBody>
        {levels.slice(1).map((row, index) => (
          <LevelsTableRow
            key={`level-row-${row.levelId}`}
            canManage={canManage}
            index={index}
            isSaving={isSaving}
            isThresholdOrderedCorrectly={isThresholdOrderedCorrectly}
            onDeleteLevel={onDeleteLevel}
            onResetThreshold={onResetThreshold}
            onThresholdChange={onThresholdChange}
            onUndoDelete={onUndoDelete}
            row={row}
          />
        ))}
      </TableBody>

      {canManage && (
        <TableFooter>
          <TableRow>
            <TableCell />
            <TableCell colSpan={2}>
              <Button
                disabled={isSaving}
                id="add-level"
                onClick={onAddLevel}
                startIcon={<Add />}
              >
                <Typography>{t(translations.addNewLevel)}</Typography>
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
};

export default LevelsTable;
