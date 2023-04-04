import { SvgIcon, SvgIconProps } from '@mui/material';
import Pointer from 'assets/icons/pointer.svg';

type PointerIconProps = SvgIconProps;

const PointerIcon = (props: PointerIconProps): JSX.Element => (
  <SvgIcon {...props} component={Pointer} inheritViewBox />
);

export default PointerIcon;
