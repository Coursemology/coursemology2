# frozen_string_literal: true
module Course::KoditsuWorkspaceConcern
  extend ActiveSupport::Concern

  def setup_koditsu_workspace
    workspace_service = Course::KoditsuWorkspaceService.new(current_course)
    response = workspace_service.run_create_koditsu_workspace_service

    workspace_id = response['id']
    current_course.update!(koditsu_workspace_id: workspace_id)
  end
end
