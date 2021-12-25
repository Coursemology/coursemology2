import { defineMessages, FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import ContentAdd from 'material-ui/svg-icons/content/add';
import PropTypes from 'prop-types';

import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';

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
      defaultMessage="Files"
      id="course.assessment.MaterialList.uploadedFiles"
    />
  );

  const materialNodes = materials.map((material) => (
    <Material
      key={material.id}
      deleting={material.deleting}
      disabled={!enableMaterialsAction}
      id={material.id}
      name={material.name}
      onMaterialDelete={onMaterialDelete}
      updatedAt={material.updated_at}
    />
  ));

  const uploadingMaterialNodes = uploadingMaterials.map((material) => (
    <Material
      key={material.name}
      disabled={!enableMaterialsAction}
      name={material.name}
      uploading={true}
    />
  ));

  const newFileButton = (
    <>
      <div
        data-for="add-files-button"
        data-tip={true}
        data-tip-disable={enableMaterialsAction}
      >
        <FlatButton
          containerElement="label"
          disabled={!enableMaterialsAction}
          fullWidth={true}
          icon={<ContentAdd />}
          label="Add Files"
          style={styles.newFileButton}
        >
          <input
            disabled={!enableMaterialsAction}
            multiple={true}
            onChange={onFileInputChange}
            style={styles.uploadInput}
            type="file"
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
        autoHideDuration={5000}
        notification={props.notification}
      />
    </>
  );
};

MaterialList.propTypes = propTypes;
MaterialList.defaultProps = defaultProps;

export default MaterialList;
