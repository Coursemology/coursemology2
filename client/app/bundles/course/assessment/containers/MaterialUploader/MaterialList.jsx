import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import ContentAdd from 'material-ui/svg-icons/content/add';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import ReactTooltip from 'react-tooltip';
import Material from './Material';

const translations = defineMessages({
  disableNewFile: {
    id: 'course.material.disableNewFile',
    defaultMessage:
      'This action is unavailable as the Materials Component is disabled in the Admin Settings',
  },
});

const propTypes = {
  materials: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      updated_at: PropTypes.string,
      deleting: PropTypes.bool,
    }),
  ),
  // The popup notification message
  notification: notificationShape,
  onMaterialDelete: PropTypes.func.isRequired,
  // The materials that are being uploading.
  uploadingMaterials: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      uploading: PropTypes.bool,
    }),
  ),
  onFileInputChange: PropTypes.func,
  enableMaterialsAction: PropTypes.bool,
};

const defaultProps = {
  materials: [],
  uploadingMaterials: [],
};

const styles = {
  newFileButton: {
    verticalAlign: 'middle',
  },
  uploadInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    opacity: 0,
  },
};

const MaterialList = (props) => {
  const {
    materials,
    uploadingMaterials,
    onMaterialDelete,
    onFileInputChange,
    enableMaterialsAction,
  } = props;
  const header = (
    <FormattedMessage
      id="course.assessment.MaterialList.uploadedFiles"
      defaultMessage="Files"
    />
  );

  const materialNodes = materials.map((material) => (
    <Material
      key={material.id}
      id={material.id}
      name={material.name}
      updatedAt={material.updated_at}
      deleting={material.deleting}
      onMaterialDelete={onMaterialDelete}
      disabled={!enableMaterialsAction}
    />
  ));

  const uploadingMaterialNodes = uploadingMaterials.map((material) => (
    <Material
      key={material.name}
      name={material.name}
      uploading
      disabled={!enableMaterialsAction}
    />
  ));

  const newFileButton = (
    <>
      <div
        data-tip
        data-for="add-files-button"
        data-tip-disable={enableMaterialsAction}
      >
        <FlatButton
          fullWidth
          label="Add Files"
          icon={<ContentAdd />}
          containerElement="label"
          style={styles.newFileButton}
          disabled={!enableMaterialsAction}
        >
          <input
            type="file"
            multiple
            style={styles.uploadInput}
            onChange={onFileInputChange}
            disabled={!enableMaterialsAction}
          />
        </FlatButton>
      </div>
      <ReactTooltip id="add-files-button">
        <FormattedMessage {...translations.disableNewFile} />
      </ReactTooltip>
    </>
  );

  return (
    <>
      <Divider />
      <List>
        {(materials.length > 0 || uploadingMaterials.length > 0) && (
          <Subheader>{header}</Subheader>
        )}
        {materialNodes}
        {uploadingMaterialNodes}
        {newFileButton}
      </List>
      <Divider />
      <NotificationBar
        notification={props.notification}
        autoHideDuration={5000}
      />
    </>
  );
};

MaterialList.propTypes = propTypes;
MaterialList.defaultProps = defaultProps;

export default MaterialList;
