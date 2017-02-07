import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import axios from 'lib/axios';
import MaterialList from '../components/MaterialList';

const propTypes = {
  materials: PropTypes.instanceOf(Immutable.List).isRequired,
};

class MaterialListContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { materials: props.materials };
  }

  onMaterialDelete = (url) => {
    const originMaterials = this.state.materials;
    // Update UI to show the loader.
    const [index, material] = originMaterials.findEntry(m => m.get('url') === url);
    const updatedMaterials = originMaterials.set(index, material.set('deleting', true));
    this.setState({ materials: updatedMaterials, success: null });
    const materialName = material.get('name');

    axios.delete(url)
      .then(() => {
        // Remove material from the list
        const materials = this.state.materials.filter(m => m.get('url') !== url);
        this.setState({ materials, success: true, materialName });
      })
      .catch(() => {
        // Display failure message and restore the material to not deleting state
        const materials = this.state.materials.update(
          this.state.materials.findIndex(m =>
             m.get('url') === url
          ), m =>
           m.set('deleting', false)
        );
        this.setState({ materials, success: false, materialName });
      });
  }

  render() {
    return (
      <MaterialList
        materials={this.state.materials}
        success={this.state.success}
        materialName={this.state.materialName}
        onMaterialDelete={this.onMaterialDelete}
      />
    );
  }
}

MaterialListContainer.propTypes = propTypes;

export default MaterialListContainer;
