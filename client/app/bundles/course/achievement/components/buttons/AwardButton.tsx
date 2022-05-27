import { FC, useState } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
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
      onClick={(): void => setIsOpen(true)}
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
      handleClose={(): void => setIsOpen(false)}
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
