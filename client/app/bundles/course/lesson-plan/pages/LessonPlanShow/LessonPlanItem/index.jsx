import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Details from './Details';
import Material from './Material';
import AdminMenu from './AdminMenu';

const styles = {
  item: {
    // This allows the admin menu to be positioned
    position: 'relative',
  },
};

const LessonPlanItem = (props) => {
  const {
    item: {
      id, title, published, location, description, materials,
      itemTypeKey: itemType,
      start_at: startAt,
      end_at: endAt,
      item_path: itemPath,
      edit_path: editPath,
      delete_path: deletePath,
    },
    visibility,
  } = props;

  const isHidden = !visibility[itemType];
  if (isHidden) { return null; }

  return (
    <div id={`item-${id}`} style={styles.item}>
      <Details
        {...{ title, description, itemPath, published, itemType, startAt, endAt, location }}
      />
      <CardText>
        {
          materials && materials.map(material => (
            <Material
              key={material.id}
              name={material.name}
              url={material.url}
            />
          ))
        }
      </CardText>
      <AdminMenu {...{ editPath, deletePath }} />
      <Divider />
    </div>
  );
};

LessonPlanItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    published: PropTypes.bool,
    location: PropTypes.string,
    description: PropTypes.string,
    itemTypeKey: PropTypes.string,
    materials: PropTypes.array,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    item_path: PropTypes.string,
    edit_path: PropTypes.string,
    delete_path: PropTypes.string,
  }).isRequired,
  visibility: PropTypes.shape().isRequired,
};

export default connect(state => ({
  visibility: state.visibilityByType,
}))(LessonPlanItem);
