import { Badge, BadgeProps, styled } from '@mui/material';

const CustomBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -8,
    top: -1,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export default CustomBadge;
