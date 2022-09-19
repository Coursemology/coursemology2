# frozen_string_literal: true
class Course::Admin::ComponentSettingsController < Course::Admin::Controller
  before_action :load_settings
  add_breadcrumb :edit, :course_admin_components_path

  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(settings_components_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def settings_components_params
    params.require(:settings_components)
  end

  # Load our settings adapter to handle component settings
  def load_settings
    @settings ||= Course::Settings::Components.new(current_course)
  end
end
