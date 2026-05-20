import { FC, ReactNode } from 'react';

import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';

import { ColumnPickerRenderCtx } from '../builder';

interface ColumnPickerTreeGroupProps {
  label: string;
  /** All leaf column ids that belong to this group (used to derive parent state). */
  childIds: string[];
  ctx: ColumnPickerRenderCtx;
  /** Ids that are locked visible — parent checkbox is disabled when all children are locked. */
  locked?: string[];
  indentLevel?: number;
  children: ReactNode;
}

/**
 * Renders a parent checkbox whose checked/indeterminate state mirrors its children's
 * visibility, and whose onChange bulk-toggles all children via ctx.setManyVisible.
 * Children are rendered below (not inline), giving a vertical tree layout.
 */
const ColumnPickerTreeGroup: FC<ColumnPickerTreeGroupProps> = ({
  label,
  childIds,
  ctx,
  locked = [],
  indentLevel = 0,
  children,
}) => {
  const visibleCount = childIds.filter((id) => ctx.isVisible(id)).length;
  const allVisible = childIds.length > 0 && visibleCount === childIds.length;
  const someVisible = visibleCount > 0 && !allVisible;
  const allLocked = childIds.length > 0 && childIds.every((id) => locked.includes(id));

  return (
    <div>
      <IndentedCheckbox
        checked={allVisible}
        disabled={allLocked}
        indentLevel={indentLevel}
        indeterminate={someVisible}
        label={label}
        onChange={(e) => ctx.setManyVisible(childIds, e.target.checked)}
      />
      <div>{children}</div>
    </div>
  );
};

export default ColumnPickerTreeGroup;
