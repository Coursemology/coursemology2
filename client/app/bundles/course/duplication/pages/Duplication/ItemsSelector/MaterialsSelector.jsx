import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { folderShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import BulkSelectors from 'course/duplication/components/BulkSelectors';

const { FOLDER, MATERIAL } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.MaterialsSelector.noItems',
    defaultMessage: 'There are no materials to duplicate.',
  },
});

class MaterialsSelector extends Component {
  folderSetAll = (folder) => (value) => {
    this.props.dispatch(setItemSelectedBoolean(FOLDER, folder.id, value));
    folder.subfolders.forEach((subfolder) =>
      this.folderSetAll(subfolder)(value),
    );
    folder.materials.forEach((material) => {
      this.props.dispatch(setItemSelectedBoolean(MATERIAL, material.id, value));
    });
  };

  renderFolder(folder, indentLevel) {
    const { dispatch, selectedItems } = this.props;
    const { id, name, materials, subfolders } = folder;
    const checked = !!selectedItems[FOLDER][folder.id];
    const hasChildren = materials.length + subfolders.length > 0;

    return (
      <div key={id}>
        <IndentedCheckbox
          label={
            <span>
              <TypeBadge itemType={FOLDER} />
              {name}
            </span>
          }
          onCheck={(e, value) =>
            dispatch(setItemSelectedBoolean(FOLDER, id, value))
          }
          {...{ checked, indentLevel }}
        >
          {hasChildren ? (
            <BulkSelectors callback={this.folderSetAll(folder)} />
          ) : null}
        </IndentedCheckbox>
        {materials.map((material) =>
          this.renderMaterial(material, indentLevel + 1),
        )}
        {subfolders.map((subfolder) =>
          this.renderFolder(subfolder, indentLevel + 1),
        )}
      </div>
    );
  }

  renderMaterial(material, indentLevel) {
    const { dispatch, selectedItems } = this.props;
    const checked = !!selectedItems[MATERIAL][material.id];

    return (
      <IndentedCheckbox
        key={material.id}
        label={
          <span>
            <TypeBadge itemType={MATERIAL} />
            {material.name}
          </span>
        }
        onCheck={(e, value) =>
          dispatch(setItemSelectedBoolean(MATERIAL, material.id, value))
        }
        {...{ checked, indentLevel }}
      />
    );
  }

  render() {
    const { folders } = this.props;
    if (!folders) {
      return null;
    }

    return (
      <>
        <h2>
          <FormattedMessage
            {...defaultComponentTitles.course_materials_component}
          />
        </h2>
        {folders.length > 0 ? (
          folders.map((rootFolder) => this.renderFolder(rootFolder, 0))
        ) : (
          <Subheader>
            <FormattedMessage {...translations.noItems} />
          </Subheader>
        )}
      </>
    );
  }
}

MaterialsSelector.propTypes = {
  folders: PropTypes.arrayOf(folderShape),
  selectedItems: PropTypes.shape(),

  dispatch: PropTypes.func.isRequired,
};

export default connect(({ duplication }) => ({
  folders: duplication.materialsComponent,
  selectedItems: duplication.selectedItems,
}))(MaterialsSelector);
