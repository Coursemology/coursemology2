import { FC, useState } from 'react';
import { Popover } from '@mui/material';

import UserHTMLText from 'lib/components/core/UserHTMLText';

const PopoverContentCell: FC<{ content: string | TrustedHTML }> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    setIsOverflowing(
      event.currentTarget.clientHeight < event.currentTarget.scrollHeight,
    );
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const isPopoverOpen = isOverflowing && Boolean(anchorEl);

  return (
    <>
      <UserHTMLText
        className="whitespace-normal line-clamp-4 [&_p]:m-0 text-[13px]"
        html={props.content}
        onClick={handleClick}
      />
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handleClose}
        open={isPopoverOpen}
        slotProps={{ paper: { className: 'w-full max-w-[60%] [&_p]:m-0 p-5' } }}
      >
        <UserHTMLText className="whitespace-normal" html={props.content} />
      </Popover>
    </>
  );
};

export default PopoverContentCell;
