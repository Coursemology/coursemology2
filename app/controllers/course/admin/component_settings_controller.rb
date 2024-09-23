# frozen_string_literal: true
class Course::Admin::ComponentSettingsController < Course::Admin::Controller
  before_action :load_settings

  def edit
    respond_to do |format|
      format.json
    end
  end

  def update
    if @settings.update(settings_components_params) && current_course.save
      is_koditsu_enabled = settings_components_params['enabled_component_ids'].
                           include?('course_koditsu_platform_component')

      setup_koditsu_workspace if is_koditsu_enabled && !current_course.koditsu_workspace_id

      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def setup_koditsu_workspace
    workspace_service = Course::KoditsuWorkspaceService.new(current_course)
    response = workspace_service.run_create_koditsu_workspace_service

    workspace_id = response['id']
    current_course.update!(koditsu_workspace_id: workspace_id)
  end

  def settings_components_params
    params.require(:settings_components)
  end

  # Load our settings adapter to handle component settings
  def load_settings
    @settings ||= Course::Settings::Components.new(current_course)
  end
end
