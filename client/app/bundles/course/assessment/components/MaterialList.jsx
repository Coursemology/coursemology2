import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { FormattedMessage } from 'react-intl';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Snackbar from 'material-ui/Snackbar';
import Material from './Material';

const propTypes = {
  materials: PropTypes.instanceOf(Immutable.List).isRequired,
  success: PropTypes.bool, // Whether the material has been deleted successfully
  materialName: PropTypes.string, // The name of the material being deleted
  onMaterialDelete: PropTypes.func.isRequired,
};

const listStyle = {
  border: 'solid 1px #d9d9d9', // Light grey border
};

const MaterialList = (props) => {
  const { materials, success, onMaterialDelete } = props;
  const header =
    (<FormattedMessage
      id="course.assessment.MaterialList.uploadedFiles"
      defaultMessage="Uploaded Files"
    />);

  const materialNodes = materials.map(material =>
     (
       <Material
         key={material.get('url')}
         name={material.get('name')}
         url={material.get('url')}
         updatedAt={material.get('updated_at')}
         deleting={material.get('deleting')}
         onMaterialDelete={onMaterialDelete}
       />
    )
  );

  const notification = success === true || success === false;
  let message;

  if (success) {
    message =
      (<FormattedMessage
        id="course.assessment.MaterialList.deleteSuccess"
        defaultMessage="{name} was deleted."
        values={{ name: props.materialName }}
      />);
  } else {
    message =
      (<FormattedMessage
        id="course.assessment.MaterialList.deleteFail"
        defaultMessage="Failed to delete {name}, please try again."
        values={{ name: props.materialName }}
      />);
  }

  return (
    <div>
      <List style={listStyle}>
        <Subheader>{header}</Subheader>
        {materialNodes}
      </List>

      <Snackbar
        open={notification}
        message={message}
        autoHideDuration={1500}
      />
    </div>
  );
};

MaterialList.propTypes = propTypes;

export default MaterialList;
