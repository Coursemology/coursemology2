import { FC, useState } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import AchievementAward from '../../pages/AchievementAward';

interface OwnProps extends IconButtonProps {
  achievementId: number;
  disabled?: boolean;
  tooltipText?: string;
}

const AwardButton: FC<OwnProps> = ({
  achievementId,
  disabled,
  tooltipText,
  ...props
}: OwnProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const awardButton = (
    <IconButton
      onClick={() => setIsOpen(true)}
      color="inherit"
      disabled={disabled}
      {...props}
    >
      <EmojiEvents />
    </IconButton>
  );

  const awardDialog = (
    <AchievementAward
      achievementId={achievementId}
      open={isOpen}
      handleClose={() => setIsOpen(false)}
    />
  );

  if (disabled && tooltipText) {
    return (
      <>
        <Tooltip title={tooltipText}>
          <span>{awardButton}</span>
        </Tooltip>
      </>
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
