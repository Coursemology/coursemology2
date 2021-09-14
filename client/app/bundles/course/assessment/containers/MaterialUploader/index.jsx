import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CourseAPI from 'api/course';
import typeMaterial from 'lib/types';
import MaterialList from './MaterialList';
import translations from './translations.intl';

const propTypes = {
  folderId: PropTypes.number.isRequired,
  materials: typeMaterial,
};

class MaterialUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      materials: props.materials,
      uploadingMaterials: [],
    };
  }

  onMaterialDelete = (id, name) => {
    this.setState((state) => {
      // Update UI to show the loader.
      const updatedMaterials = state.materials.map((m) => {
        if (m.id === id) {
          return Object.assign({}, m, { deleting: true });
        }
        return m;
      });

      return { materials: updatedMaterials };
    });

    CourseAPI.materials.destroy(this.props.folderId, id)
      .then(() => {
        this.setState((state) => {
          // Remove material from the list
          const materials = state.materials.filter(m => m.id !== id);
          const successMessage = <FormattedMessage {...{ ...translations.deleteSuccess, values: { name } }} />;

          return { materials, notification: { message: successMessage } };
        });
      })
      .catch(() => {
        this.setState((state) => {
          // Display failure message and restore the material to not deleting state
          const materials = state.materials.map((m) => {
            if (m.id === id) {
              return Object.assign({}, m, { deleting: false });
            }
            return m;
          });
          const failureMessage = <FormattedMessage {...{ ...translations.deleteFail, values: { name } }} />;

          return { materials, notification: { message: failureMessage } };
        });
      });
  }

  onFileInputChange = (e) => {
    e.preventDefault();
    const fileInput = e.target;
    const { folderId } = this.props;
    const files = fileInput.files;

    const materials = [];
    for (let i = 0; i < files.length; i += 1) {
      materials.push({ name: files[i].name });
    }
    this.setState(state => ({
      uploadingMaterials: state.uploadingMaterials.concat(materials),
    }));

    CourseAPI.materialFolders.upload(folderId, files)
      .then((response) => {
        this.updateMaterials(materials, response);
      })
      .catch((error) => {
        this.removeUploads(materials, error.response);
        // Set the value to null so that the files can be selected again.
        fileInput.value = null;
      });
  }

  // Remove materials from uploading list and add new materials from server reponse to existing
  // materials list.
  updateMaterials(materials, response) {
    const uploadingMaterials = this.state.uploadingMaterials.filter(m => materials.indexOf(m) === -1);
    const newState = {
      uploadingMaterials,
    };

    const newMaterials = response && response.data && response.data.materials;
    if (newMaterials) {
      newState.materials = this.state.materials.concat(newMaterials);
    }
    this.setState(newState);
  }

  // Remove given materials from uploading list and display error message.
  removeUploads(materials, response) {
    const messageFromServer = response && response.data && response.data.message;
    const failureMessage = <FormattedMessage {...translations.uploadFail} />;
    this.setState(state => ({
      uploadingMaterials: state.uploadingMaterials.filter(m => materials.indexOf(m) === -1),
      notification: { message: messageFromServer || failureMessage },
    }));
  }

  render() {
    return (
      <MaterialList
        materials={this.state.materials}
        uploadingMaterials={this.state.uploadingMaterials}
        notification={this.state.notification}
        onMaterialDelete={this.onMaterialDelete}
        onFileInputChange={this.onFileInputChange}
      />
    );
  }
}

MaterialUploader.propTypes = propTypes;

export default MaterialUploader;
