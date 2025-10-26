import { PaginationState, RowSelectionState } from '@tanstack/react-table';

export interface HandlersProps {
  getPaginationState: () => PaginationState;
  getRowSelectionState: () => RowSelectionState;
}
