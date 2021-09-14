import BaseCourseAPI from './Base';

export default class MaterialFoldersAPI extends BaseCourseAPI {
  /**
  * Upload files to the specified folder.
  *
  * @param {number} folderId
  * @param {array} files - A list of files from file input.
  * @return {Promise}
  * success response: { materials: Array.<{id:number, name:string, url:string, updated_at:string}> }
      - A list of materials that has been created.
  * error response: { message:string }
  */
  upload(folderId, files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i += 1) {
      formData.append('material_folder[files_attributes][]', files[i]);
    }

    return this.getClient().put(
      `${this._getUrlPrefix()}/${folderId}/upload_materials`,
      formData,
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/materials/folders`;
  }
}
