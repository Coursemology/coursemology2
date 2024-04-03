import { FC } from 'react';
import { Typography } from '@mui/material';

interface Props {
  legends: {
    key: string;
    backgroundColor: string;
    description: string;
  }[];
}

const TableLegends: FC<Props> = (props) => {
  const { legends } = props;

  return (
    <div className="flex flex-row space-x-3">
      {legends.map((l) => (
        <div key={`legend-${l.key}`} className="flex flex-row items-start">
          <div className={`w-8 h-8 mr-2 ${l.backgroundColor}`} />
          <Typography variant="caption">{l.description}</Typography>
        </div>
      ))}
    </div>
  );
};

export default TableLegends;
