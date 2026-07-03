import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { Add, Delete, DragIndicator, Edit } from '@mui/icons-material';
import {
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { AppDispatch } from 'store';
import type { AssessmentData } from 'types/course/gradebook';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { reorderExternalAssessments } from '../../operations';
import { getExternalAssessments } from '../../selectors';
import AddExternalColumnPrompt from '../AddExternalColumnPrompt';
import DeleteExternalColumnPrompt from '../DeleteExternalColumnPrompt';

import EditExternalAssessmentPrompt from './EditExternalAssessmentPrompt';

const translations = defineMessages({
  add: {
    id: 'course.gradebook.ManageExternalAssessmentContent.add',
    defaultMessage: 'Add',
  },
  name: {
    id: 'course.gradebook.ManageExternalAssessmentContent.name',
    defaultMessage: 'Name',
  },
  max: {
    id: 'course.gradebook.ManageExternalAssessmentContent.max',
    defaultMessage: 'Max',
  },
  remarks: {
    id: 'course.gradebook.ManageExternalAssessmentContent.remarks',
    defaultMessage: 'Remarks',
  },
  noFloor: {
    id: 'course.gradebook.ManageExternalAssessmentContent.noFloor',
    defaultMessage: 'No floor',
  },
  noCap: {
    id: 'course.gradebook.ManageExternalAssessmentContent.noCap',
    defaultMessage: 'No cap',
  },
  noFloorHint: {
    id: 'course.gradebook.ManageExternalAssessmentContent.noFloorHint',
    defaultMessage:
      'Negative grades are kept as-is (not floored to 0) when computing the weighted total. Gradebook warnings for negative grades are hidden.',
  },
  noCapHint: {
    id: 'course.gradebook.ManageExternalAssessmentContent.noCapHint',
    defaultMessage:
      'Grades above the maximum are kept as-is (not capped) when computing the weighted total. Gradebook warnings for grades above the maximum are hidden.',
  },
  actions: {
    id: 'course.gradebook.ManageExternalAssessmentContent.actions',
    defaultMessage: 'Actions',
  },
  empty: {
    id: 'course.gradebook.ManageExternalAssessmentContent.empty',
    defaultMessage: 'No external assessments yet',
  },
  emptyHint: {
    id: 'course.gradebook.ManageExternalAssessmentContent.emptyHint',
    defaultMessage:
      'Add one manually, or import a CSV of grades earned outside Coursemology.',
  },
  reorderError: {
    id: 'course.gradebook.ManageExternalAssessmentContent.reorderError',
    defaultMessage: 'Could not save the new order. Please try again.',
  },
});

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

interface Props {
  onRequestImport?: () => void;
}

const ManageExternalAssessmentsContent: FC<Props> = () => {
  const { t } = useTranslation();
  const externals = useAppSelector(getExternalAssessments);
  const dispatch = useAppDispatch();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AssessmentData | null>(null);
  const [deleting, setDeleting] = useState<AssessmentData | null>(null);

  const onDragEnd = (result: DropResult): void =>
    handleDragEnd(
      externals.map((a) => a.id),
      result,
      dispatch,
      () => toast.error(t(translations.reorderError)),
    );

  // The Remarks column only appears when some row carries a chip ("No floor" /
  // "No cap"), and is widened when a row shows both so they stay on one line.
  const maxRemarksPerRow = externals.reduce((max, a) => {
    const count =
      (a.floorAtZero === false ? 1 : 0) + (a.capAtMaximum === false ? 1 : 0);
    return Math.max(max, count);
  }, 0);
  const showRemarks = maxRemarksPerRow > 0;
  const remarksColWidth = maxRemarksPerRow >= 2 ? '12rem' : '6rem';

  // Name/Max/Remarks keep natural widths and cluster at the left; a flexible
  // spacer then pushes Actions to the right edge — the standard "list row with
  // trailing actions" pattern, so the row spreads across the available width.
  // Symmetric horizontal padding (px-8) insets the whole table from the dialog
  // edges. Fixed widths keep the header and each row (separate grid containers)
  // aligned.
  const gridCols = [
    '2.5rem',
    '14rem',
    '4rem',
    ...(showRemarks ? [remarksColWidth] : []),
    '1fr',
    '5rem',
  ].join(' ');

  // A lone assessment has nothing to reorder against, so dragging is disabled
  // and the handle is hidden. Its grid column is kept (empty) so the rest of
  // the row stays in identical placement.
  const reorderable = externals.length > 1;

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          onClick={() => setAddOpen(true)}
          startIcon={<Add />}
          variant="contained"
        >
          {t(translations.add)}
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
            className="grid w-full items-center gap-4 px-12 py-3 text-2xl font-medium text-neutral-500"
            style={{ gridTemplateColumns: gridCols }}
          >
            <span />
            <span>{t(translations.name)}</span>
            <span>{t(translations.max)}</span>
            {showRemarks && <span>{t(translations.remarks)}</span>}
            <span aria-hidden />
            <span className="text-right">{t(translations.actions)}</span>
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
                          className={`grid w-full min-h-[40px] items-center gap-4 border-b border-neutral-200 bg-white px-12 text-2xl ${
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
                          <span className="min-w-0 truncate" title={a.title}>
                            {a.title}
                          </span>
                          <span>{a.maxGrade}</span>
                          {showRemarks && (
                            <span>
                              <Stack
                                direction="row"
                                flexWrap="nowrap"
                                spacing={1}
                              >
                                {a.floorAtZero === false && (
                                  <Tooltip title={t(translations.noFloorHint)}>
                                    <Chip
                                      label={t(translations.noFloor)}
                                      size="small"
                                      sx={{ flexShrink: 0 }}
                                    />
                                  </Tooltip>
                                )}
                                {a.capAtMaximum === false && (
                                  <Tooltip title={t(translations.noCapHint)}>
                                    <Chip
                                      label={t(translations.noCap)}
                                      size="small"
                                      sx={{ flexShrink: 0 }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            </span>
                          )}
                          <span aria-hidden />
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

      <AddExternalColumnPrompt
        onClose={() => setAddOpen(false)}
        open={addOpen}
      />
      {editing && (
        <EditExternalAssessmentPrompt
          assessment={editing}
          onClose={() => setEditing(null)}
          open={Boolean(editing)}
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
    </>
  );
};

export default ManageExternalAssessmentsContent;
