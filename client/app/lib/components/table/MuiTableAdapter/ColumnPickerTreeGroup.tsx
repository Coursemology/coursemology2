import { FC, ReactNode } from 'react';

import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';

import { ColumnPickerRenderContext } from '../builder';

interface ColumnPickerTreeGroupProps {
  label: string;
  /** All leaf column ids that belong to this group (used to derive parent state). */
  childIds: string[];
  context: ColumnPickerRenderContext;
  /** Ids that are locked visible — parent checkbox is disabled when all children are locked. */
  locked?: string[];
  indentLevel?: number;
  children: ReactNode;
}

/**
 * Renders a parent checkbox whose checked/indeterminate state mirrors its children's
 * visibility, and whose onChange bulk-toggles all children via context.setManyVisible.
 * Children are rendered below (not inline), giving a vertical tree layout.
 */
const ColumnPickerTreeGroup: FC<ColumnPickerTreeGroupProps> = ({
  label,
  childIds,
  context,
  locked = [],
  indentLevel = 0,
  children,
}) => {
  const visibleCount = childIds.filter((id) => context.isVisible(id)).length;
  const allVisible = childIds.length > 0 && visibleCount === childIds.length;
  const someVisible = visibleCount > 0 && !allVisible;
  const allLocked =
    childIds.length > 0 && childIds.every((id) => locked.includes(id));

  return (
    <div>
      <IndentedCheckbox
        checked={allVisible}
        disabled={allLocked}
        indentLevel={indentLevel}
        indeterminate={someVisible}
        label={label}
        onChange={(e) => context.setManyVisible(childIds, e.target.checked)}
      />
      <div>{children}</div>
    </div>
  );
};

export default ColumnPickerTreeGroup;
