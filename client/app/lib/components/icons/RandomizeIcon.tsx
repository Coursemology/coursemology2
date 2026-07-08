// Icons by Remix Icon (https://remixicon.com)
// https://remixicon.com/icon/shuffle-line

// This icon is called "shuffle", but we call it "randomize" to differentiate
// it from MUI's built-in shuffle icon (straight crossed arrows)

import { SvgIcon, SvgIconProps } from '@mui/material';
import Randomize from 'assets/icons/randomize.svg';

type RandomizeIconProps = SvgIconProps;

const RandomizeIcon = (props: RandomizeIconProps): JSX.Element => (
  <SvgIcon {...props} component={Randomize} inheritViewBox />
);

export default RandomizeIcon;
