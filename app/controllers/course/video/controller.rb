# frozen_string_literal: true
class Course::Video::Controller < Course::ComponentController
  load_and_authorize_resource :video, through: :course, class: Course::Video.name
  before_action :add_videos_breadcrumb

  private

  def current_tab
    raise NotImplementedError
  end

  def add_videos_breadcrumb
    add_breadcrumb @settings.title || t('breadcrumbs.course.video.videos.index'),
                   :course_videos_path

    add_tabs_breadcrumb
  end

  def add_tabs_breadcrumb
    return if current_course.video_tabs.count == 1 || current_tab.blank?

    add_breadcrumb current_tab.title, course_videos_path(current_course, tab: current_tab)
  end

  # @return [Course::Video Component] The video component.
  # @return [nil] If video component is disabled.
  def component
    current_component_host[:course_videos_component]
  end
end
