# frozen_string_literal: true
class Course::SsidFolderService
  def initialize(folder_name, parent_folder_id = nil)
    @folder_object = { name: folder_name, parentId: parent_folder_id }
  end

  def run_create_ssid_folder_service
    ssid_api_service = SsidAsyncApiService.new('folders', @folder_object)
    response_status, response_body = ssid_api_service.post
    raise SsidError, { status: response_status, body: response_body } unless response_status == 200

    response_body['payload']['data']
  end
end
