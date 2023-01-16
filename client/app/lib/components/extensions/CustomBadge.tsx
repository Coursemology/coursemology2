import { Badge, BadgeProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -6,
    top: 4,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export default CustomBadge;
