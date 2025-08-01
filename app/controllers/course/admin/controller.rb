# frozen_string_literal: true
class Course::Admin::Controller < Course::ComponentController
  before_action :authorize_admin

  private

  def authorize_admin
    authorize!(:manage, current_course) unless publicly_accessible?
  end

  # @return [Course::SettingsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_settings_component]
  end
end
