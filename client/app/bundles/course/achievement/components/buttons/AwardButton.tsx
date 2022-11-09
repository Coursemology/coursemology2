import { FC, useState } from 'react';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

import AchievementAward from '../../pages/AchievementAward';

interface Props extends IconButtonProps {
  achievementId: number;
  disabled?: boolean;
  tooltipText?: string;
}

const AwardButton: FC<Props> = ({
  achievementId,
  disabled,
  tooltipText,
  ...props
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const awardButton = (
    <IconButton
      color="inherit"
      disabled={disabled}
      onClick={(): void => setIsOpen(true)}
      {...props}
    >
      <EmojiEvents />
    </IconButton>
  );

  const awardDialog = (
    <AchievementAward
      achievementId={achievementId}
      handleClose={(): void => setIsOpen(false)}
      open={isOpen}
    />
  );

  if (disabled && tooltipText) {
    return (
      <Tooltip title={tooltipText}>
        <span>{awardButton}</span>
      </Tooltip>
    );
  }

  return (
    <>
      {awardButton}
      {awardDialog}
    </>
  );
};

export default AwardButton;
