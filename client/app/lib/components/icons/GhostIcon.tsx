import { SvgIcon, SvgIconProps } from '@mui/material';
import Ghost from 'assets/icons/ghost.svg';

type GhostIconProps = SvgIconProps;

const GhostIcon = (props: GhostIconProps): JSX.Element => (
  <SvgIcon {...props} component={Ghost} inheritViewBox />
);

export default GhostIcon;
