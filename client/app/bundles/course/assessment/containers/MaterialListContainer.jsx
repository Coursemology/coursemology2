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
    this.onMaterialDelete = this.onMaterialDelete.bind(this);
  }

  onMaterialDelete(url) {
    let materials = this.state.materials;

    // Update UI to show the loader.
    const [index, material] = materials.findEntry(m => m.get('url') === url);
    const updatingMaterials = materials.set(index, material.set('deleting', true));
    this.setState({ materials: updatingMaterials, success: null });

    axios.delete(url)
      .then(() => {
        // Remove material from the list
        materials = materials.filter(m => m.get('url') !== url);
        const materialName = material.get('name');
        this.setState({ materials, success: true, materialName });
      })
      .catch(() => {
        // Display failure message and restore to previous state
        const materialName = material.get('name');
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
