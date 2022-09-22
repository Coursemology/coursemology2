import { Tooltip, TooltipProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

/**
 * This is meant for adding styling to the tooltip provided by MUI. Can refer to StartEndTime for usage example.
 */
const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip placement="top" {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

export default CustomTooltip;
