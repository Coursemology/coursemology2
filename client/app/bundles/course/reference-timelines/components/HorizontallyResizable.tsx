import {
  ForwardedRef,
  MouseEventHandler,
  ReactNode,
  TouchEventHandler,
  useState,
} from 'react';
import { Resizable, ResizeHandle } from 'react-resizable';

type Pixels = number;

type HandleCreator = (
  handleRef: ForwardedRef<HTMLDivElement>,
  resizing: boolean,
) => JSX.Element;

type ResizeEventHandler = (deltaWidth: Pixels) => void;

interface HorizontallyResizableProps {
  width: Pixels;
  height: Pixels;
  minWidth?: Pixels;
  maxWidth?: Pixels;
  handleLeft?: HandleCreator;
  handleRight?: HandleCreator;
  disabled?: boolean;
  snapsBy?: Pixels;
  onResizeLeft?: ResizeEventHandler;
  onResizeRight?: ResizeEventHandler;
  onChangeResizeState?: (resizing: boolean) => void;
  className?: string;
  left?: Pixels;
  children?: ReactNode;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onMouseUp?: MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: TouchEventHandler<HTMLDivElement>;
}

const HorizontallyResizable = (
  props: HorizontallyResizableProps,
): JSX.Element => {
  const [resizingHandle, setResizingHandle] = useState<ResizeHandle>();

  const resizeHandles: ResizeHandle[] = [];
  if (!props.disabled) {
    if (props.handleLeft) resizeHandles.push('w');
    if (props.handleRight) resizeHandles.push('e');
  }

  return (
    <Resizable
      axis="x"
      draggableOpts={{
        grid: props.snapsBy ? [props.snapsBy, props.snapsBy] : undefined,
      }}
      handle={(handleAxis, handleRef): JSX.Element | undefined => {
        const isHandleResizing = resizingHandle === handleAxis;

        if (handleAxis === 'w')
          return props.handleLeft?.(handleRef, isHandleResizing);

        return props.handleRight?.(handleRef, isHandleResizing);
      }}
      height={props.height}
      maxConstraints={
        props.maxWidth ? [props.maxWidth, props.maxWidth] : undefined
      }
      minConstraints={
        props.minWidth ? [props.minWidth, props.minWidth] : undefined
      }
      onResize={(_, { size, handle }): void => {
        const snapWidth = props.snapsBy ?? 1;
        const pureDelta = size.width - props.width;

        /**
         * `Math.abs` to make sure `-0.00xx` does not become `-30`. This could cause the box to
         * be mysteriously pushed to the -> right when resizing to the <- left.
         *
         * `Math.floor` and division/re-multiplication by `30` to snap deltas to multiples of 30.
         *
         * Known issue: When resizing to the <- left and the `TimelinesStack` auto-scrolls to
         * the <- left when mouse is still down, the box does not follow to resize.
         * Resizing to the -> right works fine, though.
         */
        const absDelta =
          Math.floor(Math.abs(pureDelta) / snapWidth) * snapWidth;
        const delta = absDelta * Math.sign(pureDelta);

        if (handle === 'w') props.onResizeLeft?.(delta);
        if (handle === 'e') props.onResizeRight?.(delta);
      }}
      onResizeStart={(_, { handle }): void => {
        setResizingHandle(handle);
        props.onChangeResizeState?.(true);
      }}
      onResizeStop={(): void => {
        setResizingHandle(undefined);
        props.onChangeResizeState?.(false);
      }}
      resizeHandles={resizeHandles}
      width={props.width}
    >
      <div
        className={props.className}
        onMouseDown={props.onMouseDown}
        onMouseUp={props.onMouseUp}
        onTouchEnd={props.onTouchEnd}
        style={{
          width: `${props.width}px`,
          ...(props.left && { left: `${props.left}px` }),
        }}
      >
        {props.children}
      </div>
    </Resizable>
  );
};

export default HorizontallyResizable;
