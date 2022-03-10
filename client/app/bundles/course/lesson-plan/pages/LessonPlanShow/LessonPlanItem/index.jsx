import PropTypes from 'prop-types';
import { CardContent, Divider } from '@mui/material';
import Details from './Details';
import Material from './Material';
import AdminTools from './AdminTools';

const styles = {
  item: {
    // This allows the admin menu to be positioned
    position: 'relative',
  },
};

const LessonPlanItem = (props) => {
  const { item } = props;
  const {
    id,
    title,
    published,
    location,
    description,
    materials,
    itemTypeKey: itemType,
    start_at: startAt,
    end_at: endAt,
    item_path: itemPath,
  } = item;

  return (
    <div id={`item-${id}`} style={styles.item}>
      <Divider />
      <Details
        {...{
          title,
          description,
          itemPath,
          published,
          itemType,
          startAt,
          endAt,
          location,
        }}
      />
      <CardContent>
        {materials &&
          materials.map((material) => (
            <Material
              key={material.id}
              name={material.name}
              url={material.url}
            />
          ))}
      </CardContent>
      <AdminTools {...{ item }} />
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
    // eslint-disable-next-line react/forbid-prop-types
    materials: PropTypes.array,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    item_path: PropTypes.string,
  }).isRequired,
};

export default LessonPlanItem;
