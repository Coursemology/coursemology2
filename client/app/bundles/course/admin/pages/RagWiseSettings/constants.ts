import mirrorCreator from 'utilities/mirrorCreator';

export const EXPAND_SWITCH_TYPE = mirrorCreator(['folders', 'courses']);

export const FORUM_SWITCH_TYPE = mirrorCreator(['course', 'forum_import']);

export const MATERIAL_SWITCH_TYPE = mirrorCreator(['folder', 'material']);

export const FORUM_IMPORT_WORKFLOW_STATE = mirrorCreator([
  'not_imported',
  'importing',
  'imported',
]);
