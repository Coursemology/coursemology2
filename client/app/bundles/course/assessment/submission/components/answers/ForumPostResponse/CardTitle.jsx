import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

const CardTitle = ({ type, title }) => (
  <div>
    <div className="text-gray-600 text-sm mb-[-3px]">
      <Typography variant="body2">{type}</Typography>
    </div>
    <div className="flex flex-col max-w-[600px] overflow-hidden whitespace-nowrap overflow-ellipsis text-black">
      <Typography variant="body2">{title}</Typography>
    </div>
  </div>
);

export default CardTitle;

CardTitle.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.object.isRequired,
};
