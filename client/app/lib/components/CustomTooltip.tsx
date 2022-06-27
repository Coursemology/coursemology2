import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';

/**
 * This is meant for adding styling to the tooltip provided by MUI. Can refer to StartEndTime for usage example.
 */
const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow placement="top" classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

export default CustomTooltip;
