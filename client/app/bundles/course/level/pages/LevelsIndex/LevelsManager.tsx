import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Slide, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import LevelsTable from '../../components/LevelsTable';
import { saveLevels } from '../../operations';
import { getLevels } from '../../selector';

const INITIAL_THRESHOLD = 100;

const translations = defineMessages({
  unsavedChanges: {
    id: 'course.level.Level.unsavedChanges',
    defaultMessage: 'You have unsaved changes',
  },
  saveChanges: {
    id: 'course.level.Level.saveChanges',
    defaultMessage: 'Save',
  },
  reset: {
    id: 'course.level.Level.reset',
    defaultMessage: 'Reset',
  },
  saveSuccess: {
    id: 'course.level.Level.saveSuccess',
    defaultMessage: 'Levels Saved',
  },
  saveFailure: {
    id: 'course.level.Level.saveFailure',
    defaultMessage: 'Failed to save levels',
  },
});

const LevelsManager = (): JSX.Element => {
  const { canManage, levels } = useAppSelector(getLevels);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [newLevels, setNewLevels] = useState(() =>
    levels.map((level) => ({
      levelId: level.levelId,
      experiencePointsThreshold: level.experiencePointsThreshold,
      originalThreshold: level.experiencePointsThreshold,
      toBeDeleted: false,
      toBeAdded: false,
    })),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(
      newLevels.some(
        (level) =>
          level.toBeAdded ||
          level.toBeDeleted ||
          level.experiencePointsThreshold !== level.originalThreshold,
      ),
    );
  }, [newLevels]);

  const handleAddLevel = (): void => {
    const lastLevel = newLevels[newLevels.length - 1];
    const newLevelThreshold = lastLevel
      ? lastLevel.experiencePointsThreshold * 2
      : INITIAL_THRESHOLD;

    const updatedLevels = [
      ...newLevels,
      {
        levelId: Math.max(...newLevels.map((level) => level.levelId)) + 1,
        experiencePointsThreshold: newLevelThreshold,
        originalThreshold: newLevelThreshold,
        toBeDeleted: false,
        toBeAdded: true,
      },
    ];

    setNewLevels(updatedLevels);
  };

  const handleThresholdChange = (index: number, newThreshold: number): void => {
    setNewLevels((prevLevels) =>
      prevLevels.map((level, i) =>
        i === index + 1
          ? { ...level, experiencePointsThreshold: newThreshold }
          : level,
      ),
    );
  };

  const handleResetThreshold = (index: number): void => {
    const updatedLevels = [...newLevels];
    updatedLevels[index + 1].experiencePointsThreshold =
      updatedLevels[index + 1].originalThreshold;
    setNewLevels(updatedLevels);
    setIsDirty(true);
  };

  const handleDeleteLevel = (index: number): void => {
    const updatedLevels = [...newLevels];
    if (updatedLevels[index + 1].toBeAdded) {
      // Remove the level if it was added and not saved
      updatedLevels.splice(index + 1, 1);
    } else {
      updatedLevels[index + 1].toBeDeleted = true;
    }
    setNewLevels(updatedLevels);
  };

  const handleUndoDelete = (index: number): void => {
    const updatedLevels = [...newLevels];
    updatedLevels[index + 1].toBeDeleted = false;

    setNewLevels(updatedLevels);
  };

  const handleSaveLevels = (): void => {
    setIsSaving(true);
    const levelsToSave = newLevels.filter((level) => !level.toBeDeleted);
    dispatch(
      saveLevels(
        levelsToSave,
        translations.saveSuccess,
        translations.saveFailure,
      ),
    )
      .then(() => {
        setIsSaving(false);
        setNewLevels(
          levelsToSave.map((level) => ({
            levelId: level.levelId,
            experiencePointsThreshold: level.experiencePointsThreshold,
            originalThreshold: level.experiencePointsThreshold,
            toBeDeleted: false,
            toBeAdded: false,
          })),
        );
      })
      .catch(() => {
        setIsSaving(false);
      });
  };

  const resetForm = (): void => {
    setNewLevels(
      levels.map((level) => ({
        levelId: level.levelId,
        experiencePointsThreshold: level.experiencePointsThreshold,
        originalThreshold: level.experiencePointsThreshold,
        toBeDeleted: false,
        toBeAdded: false,
      })),
    );
  };

  return (
    <>
      <LevelsTable
        canManage={canManage}
        isSaving={isSaving}
        levels={newLevels}
        onAddLevel={handleAddLevel}
        onDeleteLevel={handleDeleteLevel}
        onResetThreshold={handleResetThreshold}
        onThresholdChange={handleThresholdChange}
        onUndoDelete={handleUndoDelete}
      />

      <Slide direction="up" in={isDirty} unmountOnExit>
        <div className="fixed inset-x-0 bottom-0 z-10 flex w-full items-center justify-between bg-neutral-800 px-8 py-4 text-white sm:bottom-8 sm:mx-auto sm:w-fit sm:rounded-lg sm:drop-shadow-xl">
          <Typography>{t(translations.unsavedChanges)}</Typography>

          <div className="ml-10">
            <Button onClick={resetForm}>{t(translations.reset)}</Button>

            <Button
              disableElevation
              id="save-levels"
              onClick={handleSaveLevels}
              type="submit"
              variant="contained"
            >
              {t(translations.saveChanges)}
            </Button>
          </div>
        </div>
      </Slide>
    </>
  );
};

export default LevelsManager;
