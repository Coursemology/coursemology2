import { FC } from 'react';
import Block from '@mui/icons-material/Block';

interface Props {
  tooltipId?: string;
}

const UnpublishedIcon: FC<Props> = (props) => {
  const { tooltipId } = props;

  if (!tooltipId) {
    return <Block className="w-[1em] h-[1em] mr-2" />;
  }

  return (
    <Block
      className="w-[1em] h-[1em] mr-2 z-10 relative"
      data-tooltip-id={tooltipId}
    />
  );
};

export default UnpublishedIcon;
