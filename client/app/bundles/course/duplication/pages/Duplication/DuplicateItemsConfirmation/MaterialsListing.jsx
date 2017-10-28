import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { folderShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';

const { FOLDER, MATERIAL } = duplicableItemTypes;
const ROOT_CHILDREN_LEVEL = 1;

const flatten = arr => arr.reduce((a, b) => a.concat(b), []);

const translations = defineMessages({
  root: {
    id: 'course.duplication.MaterialsListing.root',
    defaultMessage: 'Root Folder',
  },
  nameConflictWarning: {
    id: 'course.duplication.MaterialsListing.nameConflictWarning',
    defaultMessage: "Warning: Naming conflict exists. A serial number will be appended to the duplicated item's name.",
  },
});

class MaterialsListing extends React.Component {
  static propTypes = {
    folders: PropTypes.arrayOf(folderShape),
    selectedItems: PropTypes.shape(),
    targetRootFolder: PropTypes.shape({
      subfolders: PropTypes.arrayOf(PropTypes.string),
      materials: PropTypes.arrayOf(PropTypes.string),
    }),
  }

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
        checked
        key={item.id}
        label={
          <span>
            <TypeBadge itemType={itemType} />
            {item.name}
            {
              nameConflict &&
              <div><FormattedMessage {...translations.nameConflictWarning} tagName="small" /></div>
            }
          </span>
        }
        indentLevel={indentLevel}
      />
    );
  }

  renderFolderTree(folder, indentLevel) {
    const { selectedItems, targetRootFolder } = this.props;
    const checked = !!selectedItems[FOLDER][folder.id];
    // Children will be duplicated under the target course root folder if current folder is not checked
    const childrenIndentLevel = checked ? indentLevel + 1 : ROOT_CHILDREN_LEVEL;
    const exisitingNames = targetRootFolder.subfolders.concat(targetRootFolder.materials)
      .map(name => name.toLowerCase());
    const nameConflict = indentLevel === ROOT_CHILDREN_LEVEL &&
      exisitingNames.includes(folder.name.toLowerCase());

    const folderNode = checked ? MaterialsListing.renderRow(folder, FOLDER, indentLevel, nameConflict) : [];
    const materialNodes = folder.materials
      .filter(material => !!selectedItems[MATERIAL][material.id])
      .map((material) => {
        const materialNameConflict = childrenIndentLevel === ROOT_CHILDREN_LEVEL &&
          exisitingNames.includes(material.name.toLowerCase());
        return MaterialsListing.renderRow(material, MATERIAL, childrenIndentLevel, materialNameConflict);
      });
    const subfolderNodes = flatten(folder.subfolders.map(subfolder => (
      this.renderFolderTree(subfolder, childrenIndentLevel)
    )));
    return flatten([folderNode, materialNodes, subfolderNodes]);
  }

  render() {
    const { folders } = this.props;
    const folderTrees = flatten(folders.map(folder => this.renderFolderTree(folder, ROOT_CHILDREN_LEVEL)));
    if (folderTrees.length < 1) { return null; }

    return (
      <div>
        <Subheader>
          <FormattedMessage {...defaultComponentTitles.course_materials_component} />
        </Subheader>
        <Card>
          <CardText>
            { MaterialsListing.renderRootRow() }
            { folderTrees }
          </CardText>
        </Card>
      </div>
    );
  }
}

export default connect(({ duplication }) => ({
  folders: duplication.materialsComponent,
  selectedItems: duplication.selectedItems,
  targetRootFolder: duplication.targetCourses
    .find(course => course.id === duplication.targetCourseId).rootFolder,
}))(MaterialsListing);
