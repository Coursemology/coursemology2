import { CSSProperties, FC, ReactNode } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

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
  const allLocked =
    childIds.length > 0 && childIds.every((id) => locked.includes(id));

  const checkboxStyle: CSSProperties = { marginLeft: indentLevel * 15 };

  return (
    <div>
      <div className="flex items-center">
        <FormControlLabel
          className="py-2 px-0 w-auto"
          control={
            <Checkbox
              checked={allVisible}
              className="py-0 px-2"
              disabled={allLocked}
              indeterminate={someVisible}
              onChange={(e) => ctx.setManyVisible(childIds, e.target.checked)}
              style={checkboxStyle}
            />
          }
          label={<b>{label}</b>}
        />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default ColumnPickerTreeGroup;
