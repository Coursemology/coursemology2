import { ComponentProps, useState } from 'react';
import { Popover } from '@mui/material';

interface AnchorPosition {
  left: number;
  top: number;
}

interface SeriouslyAnchoredPopupProps extends ComponentProps<typeof Popover> {
  anchorEl: ComponentProps<typeof Popover>['anchorEl'];
  anchorPosition?: never;
  anchorReference?: never;
  TransitionComponent?: never;
  TransitionProps?: never;
}

/**
 * No joke, this popup will be anchored at `anchorEl` and will remain and that
 * position, even when the parent component re-renders to a different position
 * or becomes stale (no longer found in the DOM).
 *
 * It works by initially entering the DOM at `anchorEl`'s position. Once it enters,
 * the CSS `left` and `top` are stored in state, and the popup's anchor is now fixed
 * to these values instead of the `anchorEl`. This way, no matter what happens to
 * `anchorEl`, this popup will never move. Hence, being *seriously anchored*.
 */
const SeriouslyAnchoredPopup = (
  props: SeriouslyAnchoredPopupProps,
): JSX.Element => {
  const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>();

  return (
    <Popover
      {...props}
      anchorPosition={anchorPosition}
      anchorReference={anchorPosition ? 'anchorPosition' : 'anchorEl'}
      TransitionProps={{
        onEntered: (node): void => {
          setAnchorPosition({
            left: parseInt(node.style.left, 10),
            top: parseInt(node.style.top, 10),
          });
        },
        onExited: (): void => setAnchorPosition(undefined),
      }}
    />
  );
};

export default SeriouslyAnchoredPopup;
