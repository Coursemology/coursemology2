// Icons by Remix Icon (https://remixicon.com)
// https://remixicon.com/icon/sort-alphabet-asc

import { SvgIcon, SvgIconProps } from '@mui/material';
import AZ from 'assets/icons/a-z.svg';

type AZIconProps = SvgIconProps;

const AZIcon = (props: AZIconProps): JSX.Element => (
  <SvgIcon {...props} component={AZ} inheritViewBox />
);

export default AZIcon;
