import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ListSubheader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { folderShape } from 'course/duplication/propTypes';
import { actions } from 'course/duplication/store';
import componentTranslations from 'course/translations';

const { FOLDER, MATERIAL } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.MaterialsSelector.noItems',
    defaultMessage: 'There are no materials to duplicate.',
  },
});

class MaterialsSelector extends Component {
  folderSetAll = (folder) => (value) => {
    this.props.dispatch(
      actions.setItemSelectedBoolean(FOLDER, folder.id, value),
    );
    folder.subfolders.forEach((subfolder) =>
      this.folderSetAll(subfolder)(value),
    );
    folder.materials.forEach((material) => {
      this.props.dispatch(
        actions.setItemSelectedBoolean(MATERIAL, material.id, value),
      );
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
          onChange={(e, value) =>
            dispatch(actions.setItemSelectedBoolean(FOLDER, id, value))
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
        onChange={(e, value) =>
          dispatch(actions.setItemSelectedBoolean(MATERIAL, material.id, value))
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
        <Typography className="mt-5 mb-5" variant="h2">
          <FormattedMessage
            {...componentTranslations.course_materials_component}
          />
        </Typography>
        {folders.length > 0 ? (
          folders.map((rootFolder) => this.renderFolder(rootFolder, 0))
        ) : (
          <ListSubheader disableSticky>
            <FormattedMessage {...translations.noItems} />
          </ListSubheader>
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
