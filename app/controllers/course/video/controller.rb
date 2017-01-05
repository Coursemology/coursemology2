# frozen_string_literal: true
class Course::Video::Controller < Course::ComponentController
  load_and_authorize_resource :video, through: :course, class: Course::Video.name
  before_action :add_videos_breadcrumb

  private

  def add_videos_breadcrumb
    add_breadcrumb @settings.title || :index, :course_videos_path
  end

  # @return [Course::Video Component] The video component.
  # @return [nil] If video component is disabled.
  def component
    current_component_host[:course_videos_component]
  end
end
