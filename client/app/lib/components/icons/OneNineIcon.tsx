// Icons by Remix Icon (https://remixicon.com)
// https://remixicon.com/icon/sort-number-asc

import { SvgIcon, SvgIconProps } from '@mui/material';
import OneNine from 'assets/icons/one-nine.svg';

type OneNineIconProps = SvgIconProps;

const OneNineIcon = (props: OneNineIconProps): JSX.Element => (
  <SvgIcon {...props} component={OneNine} inheritViewBox />
);

export default OneNineIcon;
