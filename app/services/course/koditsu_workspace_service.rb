# frozen_string_literal: true
class Course::KoditsuWorkspaceService
  def initialize(course)
    @course = course

    @course_object = { name: "#{@course.id}_#{course.title}" }
  end

  def run_create_koditsu_workspace_service
    return if @course.koditsu_workspace_id

    koditsu_api_service = KoditsuAsyncApiService.new('api/workspace', @course_object)
    response_status, response_body = koditsu_api_service.post

    unless response_status == 201
      raise KoditsuError,
            { status: response_status, body: response_body }
    end

    response_body['data']
  end
end
