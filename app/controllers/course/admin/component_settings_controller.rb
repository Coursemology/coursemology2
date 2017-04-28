# frozen_string_literal: true
class Course::Admin::ComponentSettingsController < Course::Admin::Controller
  before_action :load_settings
  add_breadcrumb :edit, :course_admin_components_path

  def edit #:nodoc:
  end

  def update #:nodoc:
    validate_params
    if @settings.update(settings_components_params) && current_course.save!
      redirect_to course_admin_components_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def settings_components_params
    params.require(:settings_components)
  end

  # Load our settings adapter to handle component settings
  def load_settings
    @settings ||= Course::Settings::Components.new(current_course, current_component_host)
  end

  def validate_params
    raise ArgumentError, 'Invalid list of selected components' \
      unless @settings.valid_params?(settings_components_params)
  end
end
