import { defineMessages } from 'react-intl';

const translations = defineMessages({
  addFiles: {
    id: 'course.assessment.FileTreeManager.addFiles',
    defaultMessage: 'Add files',
  },
  newFolder: {
    id: 'course.assessment.FileTreeManager.newFolder',
    defaultMessage: 'New folder',
  },
  foldersNotUploaded: {
    id: 'course.assessment.FileTreeManager.foldersNotUploaded',
    defaultMessage:
      'Folders cannot be uploaded. Create the folder, then add its files.',
  },
  collapseAll: {
    id: 'course.assessment.FileTreeManager.collapseAll',
    defaultMessage: 'Collapse all',
  },
  expandAll: {
    id: 'course.assessment.FileTreeManager.expandAll',
    defaultMessage: 'Expand all',
  },
  size: {
    id: 'course.assessment.FileTreeManager.size',
    defaultMessage: 'Size',
  },
  files: {
    id: 'course.assessment.FileTreeManager.files',
    defaultMessage: 'Files',
  },
  newBadge: {
    id: 'course.assessment.FileTreeManager.newBadge',
    defaultMessage: 'New',
  },
  toReplaceBadge: {
    id: 'course.assessment.FileTreeManager.toReplaceBadge',
    defaultMessage: 'To replace',
  },
  replace: {
    id: 'course.assessment.FileTreeManager.replace',
    defaultMessage: 'Replace',
  },
  replaceConfirmationTitle: {
    id: 'course.assessment.FileTreeManager.replaceConfirmationTitle',
    defaultMessage:
      '{count, plural, one {Replace file?} other {Replace files?}}',
  },
  replaceConfirmation: {
    id: 'course.assessment.FileTreeManager.replaceConfirmation',
    defaultMessage:
      'Are you sure you want to replace {count, plural, one {this file} other {these files}}?',
  },
  replacedFile: {
    id: 'course.assessment.FileTreeManager.replacedFile',
    defaultMessage: '{path}, {from} → {to}',
  },
  toDeleteBadge: {
    id: 'course.assessment.FileTreeManager.toDeleteBadge',
    defaultMessage: 'To delete',
  },
  emptyFolder: {
    id: 'course.assessment.FileTreeManager.emptyFolder',
    defaultMessage: 'empty',
  },
  folderSummary: {
    id: 'course.assessment.FileTreeManager.folderSummary',
    defaultMessage: '{count, plural, one {# file} other {# files}} · {size}',
  },
  filesSummary: {
    id: 'course.assessment.FileTreeManager.filesSummary',
    defaultMessage: '{count, plural, one {# file} other {# files}} · {size}',
  },
  toUploadSummary: {
    id: 'course.assessment.FileTreeManager.toUploadSummary',
    defaultMessage: '{count} to upload',
  },
  toDeleteSummary: {
    id: 'course.assessment.FileTreeManager.toDeleteSummary',
    defaultMessage: '{count} to delete',
  },
  noFiles: {
    id: 'course.assessment.FileTreeManager.noFiles',
    defaultMessage: 'No files yet.',
  },
  emptyFolderHint: {
    id: 'course.assessment.FileTreeManager.emptyFolderHint',
    defaultMessage: 'Empty folders will not be saved.',
  },
  newFolderName: {
    id: 'course.assessment.FileTreeManager.newFolderName',
    defaultMessage: 'New folder name',
  },
  newName: {
    id: 'course.assessment.FileTreeManager.newName',
    defaultMessage: 'New name for {name}',
  },
  folderNamePlaceholder: {
    id: 'course.assessment.FileTreeManager.folderNamePlaceholder',
    defaultMessage: 'folder name',
  },
  expandFolder: {
    id: 'course.assessment.FileTreeManager.expandFolder',
    defaultMessage: 'Expand {name}',
  },
  collapseFolder: {
    id: 'course.assessment.FileTreeManager.collapseFolder',
    defaultMessage: 'Collapse {name}',
  },
  deleteFile: {
    id: 'course.assessment.FileTreeManager.deleteFile',
    defaultMessage: 'Delete {name}',
  },
  deleteFolder: {
    id: 'course.assessment.FileTreeManager.deleteFolder',
    defaultMessage: 'Delete folder {name}',
  },
  restoreFile: {
    id: 'course.assessment.FileTreeManager.restoreFile',
    defaultMessage: 'Restore {name}',
  },
  restoreFolder: {
    id: 'course.assessment.FileTreeManager.restoreFolder',
    defaultMessage: 'Restore folder {name}',
  },
  renameFile: {
    id: 'course.assessment.FileTreeManager.renameFile',
    defaultMessage: 'Rename {name}',
  },
  downloadFile: {
    id: 'course.assessment.FileTreeManager.downloadFile',
    defaultMessage: 'Download {name}',
  },
  deleteConfirmation: {
    id: 'course.assessment.FileTreeManager.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete "{path}"?',
  },
  invalidPath: {
    id: 'course.assessment.FileTreeManager.invalidPath',
    defaultMessage:
      'Names cannot contain " ? * : | < > \\, start or end with a space, or end with a dot.',
  },
  pathTooLong: {
    id: 'course.assessment.FileTreeManager.pathTooLong',
    defaultMessage: 'File path too long.',
  },
  duplicatePath: {
    id: 'course.assessment.FileTreeManager.duplicatePath',
    defaultMessage: 'A file or folder with this name already exists here.',
  },
  fileFolderClash: {
    id: 'course.assessment.FileTreeManager.fileFolderClash',
    defaultMessage: 'A file and a folder cannot have the same name.',
  },
  folderAlreadyExists: {
    id: 'course.assessment.FileTreeManager.folderAlreadyExists',
    defaultMessage: 'This folder already exists.',
  },
  someFilesNotAdded: {
    id: 'course.assessment.FileTreeManager.someFilesNotAdded',
    defaultMessage:
      '{count, plural, one {This file was} other {These files were}} not added:',
  },
  saveFailed: {
    id: 'course.assessment.FileTreeManager.saveFailed',
    defaultMessage: 'Your change could not be saved. Please try again.',
  },
});

export default translations;
