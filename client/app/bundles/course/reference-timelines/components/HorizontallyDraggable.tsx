import { ReactNode, useState } from 'react';
import { DraggableCore } from 'react-draggable';

interface HorizontallyDraggableProps {
  children?: ReactNode;
  disabled?: boolean;
  snapsBy?: number;
  handleClassName?: string;
  onDrag?: (deltaX: number) => void;
  onChangeDragState?: (dragging: boolean) => void;
  onClick?: (target: HTMLElement | null) => void;
}

/**
 * The `children` must accept `onMouseDown`, `oneMouseUp`, and `onTouchEnd` as props.
 */
const HorizontallyDraggable = (
  props: HorizontallyDraggableProps,
): JSX.Element => {
  const [didDrag, setDidDrag] = useState(false);

  return (
    <DraggableCore
      disabled={props.disabled}
      grid={props.snapsBy ? [props.snapsBy, props.snapsBy] : undefined}
      handle={props.handleClassName ? `.${props.handleClassName}` : undefined}
      onDrag={(_, { deltaX }): void => {
        setDidDrag(true);
        props.onDrag?.(deltaX);
      }}
      onStart={(_): void => props.onChangeDragState?.(true)}
      onStop={(e): void => {
        e.stopPropagation();
        props.onChangeDragState?.(false);
        if (!didDrag) props.onClick?.(e.target as HTMLElement);
        setDidDrag(false);
      }}
    >
      {props.children}
    </DraggableCore>
  );
};

export default HorizontallyDraggable;
