import PropTypes from 'prop-types';
import Block from '@mui/icons-material/Block';

const styles = {
  // TODO: lower position of the icon so that it aligns with adjacent text
  unpublishedIcon: {
    width: '1em',
    height: '1em',
    marginRight: 3,
  },
  withTooltip: {
    zIndex: 3,
    position: 'relative',
  },
};

const UnpublishedIcon = ({ tooltipId }) => {
  if (!tooltipId) {
    return <Block style={styles.unpublishedIcon} />;
  }
  return (
    <Block
      data-tip
      data-for={tooltipId}
      style={{ ...styles.unpublishedIcon, ...styles.withTooltip }}
    />
  );
};

UnpublishedIcon.propTypes = {
  tooltipId: PropTypes.string,
};

export default UnpublishedIcon;
