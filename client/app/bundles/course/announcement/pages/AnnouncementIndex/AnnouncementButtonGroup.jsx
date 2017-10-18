import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import EditAnnouncementButton from './EditAnnouncementButton';
import DeleteAnnouncementButton from './DeleteAnnouncementButton';

const propTypes = {
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
    sticky: PropTypes.bool,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    id: PropTypes.number,
    canEdit: PropTypes.bool,
  }).isRequired,
};


class AnnouncementButtonGroup extends React.Component {

  render() {
    const { initialValues } = this.props;

    return (
      <span className="pull-right">
        <div className="btn-group">
          <EditAnnouncementButton initialValues={{ ...initialValues }} />
          <DeleteAnnouncementButton initialValues={{ ...initialValues }} />
        </div>
      </span>
    );
  }
}

AnnouncementButtonGroup.propTypes = propTypes;

export default connect(state => state.announcementsFlags)(injectIntl(AnnouncementButtonGroup));
