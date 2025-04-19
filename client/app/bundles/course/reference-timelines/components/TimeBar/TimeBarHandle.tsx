import {
  forwardRef,
  MouseEventHandler,
  ReactNode,
  TouchEventHandler,
} from 'react';
import { Typography } from '@mui/material';

import moment from 'lib/moment';

interface HandleContentProps {
  side: 'start' | 'end';
  persistent?: boolean;
  children?: ReactNode;
}

interface HandleContainerProps extends HandleContentProps {
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onMouseUp?: MouseEventHandler<HTMLDivElement>;
  onTouchEnd?: TouchEventHandler<HTMLDivElement>;
}

type TimeBarHandleProps = Omit<HandleContainerProps, 'children' | 'side'> & {
  time: moment.Moment;
};

const HandleBar = (
  props: Omit<HandleContentProps, 'children'>,
): JSX.Element => (
  <div
    className={`h-2/3 w-1.5 self-center rounded-full bg-black ${
      props.persistent
        ? 'visible'
        : `invisible ${
            props.side === 'start'
              ? 'group-hover/start-handle:visible'
              : 'group-hover/end-handle:visible'
          }`
    }`}
  />
);

const HandleText = (props: HandleContentProps): JSX.Element => (
  <Typography
    className={`select-none ${
      props.persistent
        ? 'visible'
        : `invisible ${
            props.side === 'start'
              ? 'group-hover/start-handle:visible'
              : 'group-hover/end-handle:visible'
          }`
    }`}
    variant="body2"
  >
    {props.children}
  </Typography>
);

const HandleContainer = forwardRef<
  HTMLDivElement,
  Omit<HandleContainerProps, 'persistent'>
>(
  (props, ref): JSX.Element => (
    <div
      ref={ref}
      className={`absolute inset-y-0 z-10 cursor-ew-resize ${
        props.side === 'start'
          ? 'group/start-handle left-1'
          : 'group/end-handle right-1'
      }`}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onTouchEnd={props.onTouchEnd}
    >
      <div
        className={`absolute flex h-full w-28 items-center space-x-4 ${
          props.side === 'start' ? 'right-0 justify-end' : 'left-0'
        }`}
      >
        {props.children}
      </div>
    </div>
  ),
);

HandleContainer.displayName = 'HandleContainer';

const StartTimeBarHandle = forwardRef<HTMLDivElement, TimeBarHandleProps>(
  (props, ref): JSX.Element => (
    <HandleContainer {...props} ref={ref} side="start">
      <HandleText {...props} side="start">
        {props.time.format('MMM D')}
      </HandleText>

      <HandleBar {...props} side="start" />
    </HandleContainer>
  ),
);

StartTimeBarHandle.displayName = 'StartTimeBarHandle';

const EndTimeBarHandle = forwardRef<HTMLDivElement, TimeBarHandleProps>(
  (props, ref): JSX.Element => (
    <HandleContainer {...props} ref={ref} side="end">
      <HandleBar {...props} side="end" />

      <HandleText {...props} side="end">
        {props.time.format('MMM D')}
      </HandleText>
    </HandleContainer>
  ),
);

EndTimeBarHandle.displayName = 'EndTimeBarHandle';

export default {
  Start: StartTimeBarHandle,
  End: EndTimeBarHandle,
};
