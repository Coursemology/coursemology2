import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Card, CardContent, ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import { duplicableItemTypes } from 'course/duplication/constants';
import { folderShape } from 'course/duplication/propTypes';
import componentTranslations from 'course/translations';

const { FOLDER, MATERIAL } = duplicableItemTypes;
const ROOT_CHILDREN_LEVEL = 1;

const flatten = (arr) => arr.reduce((a, b) => a.concat(b), []);

const translations = defineMessages({
  root: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.MaterialsListing.root',
    defaultMessage: 'Root Folder',
  },
  nameConflictWarning: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.MaterialsListing.nameConflictWarning',
    defaultMessage:
      "Warning: Naming conflict exists. A serial number will be appended to the duplicated item's name.",
  },
});

class MaterialsListing extends Component {
  static renderRootRow() {
    return (
      <IndentedCheckbox
        disabled
        label={<FormattedMessage {...translations.root} />}
      />
    );
  }

  static renderRow(item, itemType, indentLevel, nameConflict) {
    return (
      <IndentedCheckbox
        key={`material_${item.id}`}
        checked
        indentLevel={indentLevel}
        label={
          <span>
            <TypeBadge itemType={itemType} />
            {item.name}
            {nameConflict && (
              <div>
                <FormattedMessage
                  {...translations.nameConflictWarning}
                  tagName="small"
                />
              </div>
            )}
          </span>
        }
      />
    );
  }

  renderFolderTree(folder, indentLevel) {
    const { selectedItems, targetRootFolder } = this.props;
    const checked = !!selectedItems[FOLDER][folder.id];
    // Children will be duplicated under the target course root folder if current folder is not checked
    const childrenIndentLevel = checked ? indentLevel + 1 : ROOT_CHILDREN_LEVEL;
    const exisitingNames = targetRootFolder.subfolders
      .concat(targetRootFolder.materials)
      .map((name) => name.toLowerCase());
    const nameConflict =
      indentLevel === ROOT_CHILDREN_LEVEL &&
      exisitingNames.includes(folder.name.toLowerCase());

    const folderNode = checked
      ? MaterialsListing.renderRow(folder, FOLDER, indentLevel, nameConflict)
      : [];
    const materialNodes = folder.materials
      .filter((material) => !!selectedItems[MATERIAL][material.id])
      .map((material) => {
        const materialNameConflict =
          childrenIndentLevel === ROOT_CHILDREN_LEVEL &&
          exisitingNames.includes(material.name.toLowerCase());
        return MaterialsListing.renderRow(
          material,
          MATERIAL,
          childrenIndentLevel,
          materialNameConflict,
        );
      });
    const subfolderNodes = flatten(
      folder.subfolders.map((subfolder) =>
        this.renderFolderTree(subfolder, childrenIndentLevel),
      ),
    );
    return flatten([folderNode, materialNodes, subfolderNodes]);
  }

  render() {
    const { folders } = this.props;
    const folderTrees = flatten(
      folders.map((folder) =>
        this.renderFolderTree(folder, ROOT_CHILDREN_LEVEL),
      ),
    );
    if (folderTrees.length < 1) {
      return null;
    }

    return (
      <div>
        <ListSubheader disableSticky>
          <FormattedMessage
            {...componentTranslations.course_materials_component}
          />
        </ListSubheader>
        <Card>
          <CardContent>
            {MaterialsListing.renderRootRow()}
            {folderTrees}
          </CardContent>
        </Card>
      </div>
    );
  }
}

MaterialsListing.propTypes = {
  folders: PropTypes.arrayOf(folderShape),
  selectedItems: PropTypes.shape(),
  targetRootFolder: PropTypes.shape({
    subfolders: PropTypes.arrayOf(PropTypes.string),
    materials: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default connect(({ duplication }) => ({
  folders: duplication.materialsComponent,
  selectedItems: duplication.selectedItems,
  targetRootFolder: duplication.destinationCourses.find(
    (course) => course.id === duplication.destinationCourseId,
  ).rootFolder,
}))(MaterialsListing);
