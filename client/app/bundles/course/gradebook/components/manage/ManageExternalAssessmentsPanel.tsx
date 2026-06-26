import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { Add, Delete, DragIndicator, Edit, Upload } from '@mui/icons-material';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type {
  AssessmentData,
  ExistingExternalAssessment,
} from 'types/course/gradebook';
import type { AppDispatch } from 'store';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { reorderExternalAssessments } from '../../operations';
import {
  getExternalAssessments,
  getTabs,
  getWeightedViewEnabled,
} from '../../selectors';
import AddExternalColumnPrompt from '../AddExternalColumnPrompt';
import DeleteExternalColumnPrompt from '../DeleteExternalColumnPrompt';
import ImportExternalAssessmentsWizard from '../import/ImportExternalAssessmentsWizard';

import EditExternalAssessmentPrompt from './EditExternalAssessmentPrompt';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.ManageExternalPanel.title',
    defaultMessage: 'External assessments',
  },
  add: {
    id: 'course.gradebook.ManageExternalPanel.add',
    defaultMessage: 'Add',
  },
  import: {
    id: 'course.gradebook.ManageExternalPanel.import',
    defaultMessage: 'Import CSV',
  },
  name: {
    id: 'course.gradebook.ManageExternalPanel.name',
    defaultMessage: 'Name',
  },
  max: {
    id: 'course.gradebook.ManageExternalPanel.max',
    defaultMessage: 'Max',
  },
  weight: {
    id: 'course.gradebook.ManageExternalPanel.weight',
    defaultMessage: 'Weight',
  },
  bounds: {
    id: 'course.gradebook.ManageExternalPanel.bounds',
    defaultMessage: 'Bounds',
  },
  floored: {
    id: 'course.gradebook.ManageExternalPanel.floored',
    defaultMessage: '≥ 0',
  },
  capped: {
    id: 'course.gradebook.ManageExternalPanel.capped',
    defaultMessage: '≤ max',
  },
  actions: {
    id: 'course.gradebook.ManageExternalPanel.actions',
    defaultMessage: 'Actions',
  },
  empty: {
    id: 'course.gradebook.ManageExternalPanel.empty',
    defaultMessage: 'No external assessments yet',
  },
  emptyHint: {
    id: 'course.gradebook.ManageExternalPanel.emptyHint',
    defaultMessage:
      'Add one manually, or import a CSV of grades earned outside Coursemology.',
  },
  close: {
    id: 'course.gradebook.ManageExternalPanel.close',
    defaultMessage: 'Close',
  },
  reorderError: {
    id: 'course.gradebook.ManageExternalPanel.reorderError',
    defaultMessage: 'Could not save the new order. Please try again.',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
}

// Returns a new array with the item at `from` moved to `to`.
export const moveItem = (ids: number[], from: number, to: number): number[] => {
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

// Builds the new external order from a drag result and persists it.
// Exported so the no-op / dispatch / failure branches stay unit-testable
// without driving the drag-and-drop library in jsdom.
export const handleDragEnd = (
  externalIds: number[],
  result: DropResult,
  dispatch: AppDispatch,
  onError: () => void,
): void => {
  if (!result.destination || result.destination.index === result.source.index) {
    return;
  }
  const order = moveItem(
    externalIds,
    result.source.index,
    result.destination.index,
  );
  dispatch(reorderExternalAssessments(order)).catch(onError);
};

const ManageExternalAssessmentsPanel: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const externals = useAppSelector(getExternalAssessments);
  const tabs = useAppSelector(getTabs);
  const weightedViewEnabled = useAppSelector(getWeightedViewEnabled);
  const dispatch = useAppDispatch();
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<AssessmentData | null>(null);
  const [deleting, setDeleting] = useState<AssessmentData | null>(null);

  const tabWeights = Object.fromEntries(
    tabs.map((tab) => [tab.id, tab.gradebookWeight ?? 0]),
  );
  const existingAssessments: ExistingExternalAssessment[] = externals.map(
    (a) => ({
      name: a.title,
      maximumGrade: a.maxGrade,
      weightage: tabWeights[a.tabId] ?? 0,
    }),
  );

  const onDragEnd = (result: DropResult): void =>
    handleDragEnd(
      externals.map((a) => a.id),
      result,
      dispatch,
      () => toast.error(t(translations.reorderError)),
    );

  const gridCols = weightedViewEnabled
    ? '2.5rem minmax(10rem,1fr) 5rem 5rem 9.5rem 6rem'
    : '2.5rem minmax(10rem,1fr) 5rem 9.5rem 6rem';

  // A lone assessment has nothing to reorder against, so dragging is disabled
  // and the handle is hidden. Its grid column is kept (empty) so the rest of
  // the row stays in identical placement.
  const reorderable = externals.length > 1;

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={onClose}
        open={open && !importOpen}
      >
        <DialogTitle>{t(translations.title)}</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              onClick={() => setAddOpen(true)}
              startIcon={<Add />}
              variant="contained"
            >
              {t(translations.add)}
            </Button>
            <Button
              onClick={() => setImportOpen(true)}
              startIcon={<Upload />}
              variant="outlined"
            >
              {t(translations.import)}
            </Button>
          </Stack>

          {externals.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-10 text-center">
              <Typography color="text.secondary" variant="h6">
                {t(translations.empty)}
              </Typography>
              <Typography color="text.disabled" variant="body2">
                {t(translations.emptyHint)}
              </Typography>
            </div>
          ) : (
            <>
              <div
                className="grid items-center gap-4 px-[14px] py-3 text-2xl font-medium text-neutral-500"
                style={{ gridTemplateColumns: gridCols }}
              >
                <span />
                <span>{t(translations.name)}</span>
                <span>{t(translations.max)}</span>
                {weightedViewEnabled && <span>{t(translations.weight)}</span>}
                <span>{t(translations.bounds)}</span>
                <span>{t(translations.actions)}</span>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="external-assessments">
                  {(dropProvided) => (
                    <div
                      ref={dropProvided.innerRef}
                      {...dropProvided.droppableProps}
                    >
                      {externals.map((a, index) => (
                        <Draggable
                          key={a.id}
                          draggableId={String(a.id)}
                          index={index}
                          isDragDisabled={!reorderable}
                        >
                          {(dragProvided, { isDragging }) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={`grid min-h-[40px] items-center gap-4 border-b border-neutral-200 bg-white px-[14px] text-2xl ${
                                isDragging ? 'rounded drop-shadow-md' : ''
                              }`}
                              style={{
                                gridTemplateColumns: gridCols,
                                ...dragProvided.draggableProps.style,
                              }}
                            >
                              {reorderable ? (
                                <IconButton
                                  {...dragProvided.dragHandleProps}
                                  aria-label={`reorder ${a.title}`}
                                  className="cursor-grab"
                                  size="small"
                                >
                                  <DragIndicator
                                    color="disabled"
                                    fontSize="small"
                                  />
                                </IconButton>
                              ) : (
                                <span aria-hidden />
                              )}
                              <span
                                className="min-w-0 truncate"
                                title={a.title}
                              >
                                {a.title}
                              </span>
                              <span>{a.maxGrade}</span>
                              {weightedViewEnabled && (
                                <span>{tabWeights[a.tabId] ?? 0}</span>
                              )}
                              <span>
                                <Stack direction="row" spacing={0.5}>
                                  {(a.floorAtZero ?? true) && (
                                    <Chip
                                      label={t(translations.floored)}
                                      size="small"
                                    />
                                  )}
                                  {(a.capAtMaximum ?? true) && (
                                    <Chip
                                      label={t(translations.capped)}
                                      size="small"
                                    />
                                  )}
                                </Stack>
                              </span>
                              <span className="whitespace-nowrap text-right">
                                <IconButton
                                  aria-label={`edit ${a.title}`}
                                  onClick={() => setEditing(a)}
                                  size="small"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  aria-label={`delete ${a.title}`}
                                  onClick={() => setDeleting(a)}
                                  size="small"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {dropProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            {t(translations.close)}
          </Button>
        </DialogActions>

        <AddExternalColumnPrompt
          onClose={() => setAddOpen(false)}
          open={addOpen}
          weightedViewEnabled={weightedViewEnabled}
        />
        {editing && (
          <EditExternalAssessmentPrompt
            assessment={editing}
            onClose={() => setEditing(null)}
            open={Boolean(editing)}
            weightedViewEnabled={weightedViewEnabled}
          />
        )}
        {deleting && (
          <DeleteExternalColumnPrompt
            assessmentId={deleting.id}
            onClose={() => setDeleting(null)}
            open={Boolean(deleting)}
            title={deleting.title}
          />
        )}
      </Dialog>
      <ImportExternalAssessmentsWizard
        existingAssessments={existingAssessments}
        onClose={() => setImportOpen(false)}
        open={open && importOpen}
        weightedViewEnabled={weightedViewEnabled}
      />
    </>
  );
};

export default ManageExternalAssessmentsPanel;
